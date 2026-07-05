import argparse
import json
import re
import sys
import time
import uuid
from collections import Counter
from datetime import UTC, datetime
from pathlib import Path


BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.services.rag_service import rag_service


DEFAULT_EN_QUESTIONS = "evals/golden_questions/crc_rag_en.json"
DEFAULT_ZH_QUESTIONS = "evals/golden_questions/crc_rag_zh_TW.json"
DEFAULT_REPORTS_DIR = "evals/reports"
CRC_METADATA_FILTER = {"source_uri": "knowledge-base/crc-rag/"}
NO_ANSWER_PATTERNS = (
    "do not know",
    "don't know",
    "not in the indexed",
    "not enough information",
    "無法根據",
    "不知道",
)
SOURCE_CITATION_PATTERN = re.compile(r"\[(S\d+)\]")
CJK_PATTERN = re.compile(r"[\u4e00-\u9fff]")


def normalize_text(value: str | None) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip().lower()


def basename(value: str | None) -> str:
    return Path(str(value or "")).name


def load_questions(path: str | Path) -> list[dict]:
    questions_path = BACKEND_ROOT / path if not Path(path).is_absolute() else Path(path)
    with questions_path.open(encoding="utf-8") as file:
        questions = json.load(file)

    if not isinstance(questions, list):
        raise ValueError(f"{questions_path} must contain a JSON list.")

    return questions


def safe_rate(passed: int, total: int) -> float:
    if total <= 0:
        return 0.0

    return round(passed / total, 4)


def average(values: list[float]) -> float:
    if not values:
        return 0.0

    return round(sum(values) / len(values), 4)


def answer_excerpt(answer: str, limit: int = 320) -> str:
    compact = re.sub(r"\s+", " ", answer or "").strip()
    if len(compact) <= limit:
        return compact

    return f"{compact[:limit].rstrip()}..."


def extract_cited_source_ids(answer: str) -> set[str]:
    return set(SOURCE_CITATION_PATTERN.findall(answer or ""))


def source_file_names(sources: list[dict]) -> list[str]:
    return sorted(
        {
            basename(source.get("file_name") or source.get("source_uri"))
            for source in sources
            if source.get("file_name") or source.get("source_uri")
        }
    )


def top_source_name(sources: list[dict]) -> str | None:
    if not sources:
        return None

    top_source = sources[0]
    return basename(top_source.get("file_name") or top_source.get("source_uri"))


def source_score(source: dict) -> float | None:
    for key in ("rerank_score", "score", "vector_score"):
        value = source.get(key)
        if isinstance(value, (int, float)):
            return float(value)

    return None


def expected_source_matched(sources: list[dict], expected_sources: list[str]) -> bool:
    actual = {normalize_text(name) for name in source_file_names(sources)}
    expected = {normalize_text(name) for name in expected_sources}
    return bool(actual) and bool(expected & actual)


def all_keywords_present(answer: str, keywords: list[str]) -> tuple[bool, list[str]]:
    normalized_answer = normalize_text(answer)
    missing = [
        keyword
        for keyword in keywords or []
        if normalize_text(keyword) not in normalized_answer
    ]
    return not missing, missing


def is_no_answer(answer: str) -> bool:
    normalized_answer = normalize_text(answer)
    return any(pattern in normalized_answer for pattern in NO_ANSWER_PATTERNS)


def language_matches(answer: str, expected_language: str) -> bool:
    compact = re.sub(r"\s+", "", answer or "")
    if not compact:
        return False

    cjk_count = len(CJK_PATTERN.findall(compact))
    cjk_ratio = cjk_count / max(len(compact), 1)

    if expected_language == "zh-TW":
        return cjk_count >= 20 or cjk_ratio >= 0.15

    if expected_language == "en":
        return cjk_ratio <= 0.35

    return True


def citation_grounded(answer: str, sources: list[dict], requires_citation: bool) -> tuple[bool, list[str], list[str]]:
    valid_source_ids = sorted(
        source.get("source_id") for source in sources if source.get("source_id")
    )
    cited_source_ids = sorted(extract_cited_source_ids(answer))

    if not requires_citation:
        return True, cited_source_ids, valid_source_ids

    if not valid_source_ids or not cited_source_ids:
        return False, cited_source_ids, valid_source_ids

    invalid = set(cited_source_ids) - set(valid_source_ids)
    return not invalid, cited_source_ids, valid_source_ids


def failure_fix(reason: str) -> str:
    fixes = {
        "request_error": "Inspect backend credentials, local environment, and service availability before rerunning the suite.",
        "wrong_retrieval": "Improve metadata, chunk headings, or retrieval scoring for the expected CRC-RAG source document.",
        "missing_keyword": "Add or strengthen source wording for the missing concept, or loosen an overly exact keyword.",
        "citation_validation": "Review prompt citation instructions and grounded-answer validation for returned source IDs.",
        "language_mismatch": "Add explicit answer-language instructions for the requested locale.",
        "safe_no_answer": "Check whether relevant chunks were retrieved and whether validation replaced the model answer.",
        "insufficient_context": "Add more complete parent context or adjust chunk boundaries for multi-step questions.",
    }
    return fixes.get(reason, "Review the retrieved sources and answer trace for this question.")


def classify_failure_reasons(checks: dict, missing_keywords: list[str]) -> list[str]:
    reasons = []
    if not checks["retrieval_accuracy"]:
        reasons.append("wrong_retrieval")
    if missing_keywords:
        reasons.append("missing_keyword")
    if not checks["citation_success"]:
        reasons.append("citation_validation")
    if not checks["language_consistency"]:
        reasons.append("language_mismatch")
    if not checks["not_safe_no_answer"]:
        reasons.append("safe_no_answer")
    if not checks["grounding_success"]:
        reasons.append("insufficient_context")

    return sorted(set(reasons), key=reasons.index)


def evaluate_case(case: dict) -> dict:
    started_at = time.perf_counter()
    try:
        response = rag_service.answer_question(
            case["question"],
            history=[],
            session_id=f"crc-rag-hiring-eval-{uuid.uuid4()}",
            metadata_filter=CRC_METADATA_FILTER,
        )
        response_time_ms = round((time.perf_counter() - started_at) * 1000, 2)
    except Exception as error:
        response_time_ms = round((time.perf_counter() - started_at) * 1000, 2)
        checks = {
            "retrieval_accuracy": False,
            "citation_success": False,
            "grounding_success": False,
            "keyword_coverage": False,
            "language_consistency": False,
            "not_safe_no_answer": False,
        }
        return {
            "id": case["id"],
            "language": case["language"],
            "role": case["role"],
            "category": case["category"],
            "difficulty": case["difficulty"],
            "question": case["question"],
            "passed": False,
            "failure_reasons": ["request_error"],
            "failure_analysis": {
                "question": case["question"],
                "expected_source": case.get("expected_sources", []),
                "retrieved_source": [],
                "reason": "request_error",
                "possible_fix": failure_fix("request_error"),
            },
            "response_time_ms": response_time_ms,
            "average_retrieval_score": 0.0,
            "top_retrieved_source": None,
            "expected_sources": case.get("expected_sources", []),
            "actual_sources": [],
            "missing_keywords": case.get("expected_keywords", []),
            "cited_source_ids": [],
            "valid_source_ids": [],
            "answer_excerpt": "",
            "checks": checks,
            "error": str(error),
        }

    answer = response.get("answer", "")
    sources = response.get("sources", [])
    retrieval_scores = [
        score
        for score in (source_score(source) for source in sources)
        if isinstance(score, (int, float))
    ]
    keyword_coverage, missing_keywords = all_keywords_present(
        answer,
        case.get("expected_keywords", []),
    )
    citation_success, cited_source_ids, valid_source_ids = citation_grounded(
        answer,
        sources,
        bool(case.get("requires_citation", True)),
    )
    retrieval_accuracy = expected_source_matched(
        sources,
        case.get("expected_sources", []),
    )
    not_safe_no_answer = not is_no_answer(answer)
    checks = {
        "retrieval_accuracy": retrieval_accuracy,
        "citation_success": citation_success,
        "grounding_success": bool(sources) and citation_success and not_safe_no_answer,
        "keyword_coverage": keyword_coverage,
        "language_consistency": language_matches(
            answer,
            case.get("expected_language", case.get("language")),
        ),
        "not_safe_no_answer": not_safe_no_answer,
    }
    failure_reasons = classify_failure_reasons(checks, missing_keywords)

    return {
        "id": case["id"],
        "language": case["language"],
        "role": case["role"],
        "category": case["category"],
        "difficulty": case["difficulty"],
        "question": case["question"],
        "passed": not failure_reasons,
        "failure_reasons": failure_reasons,
        "failure_analysis": {
            "question": case["question"],
            "expected_source": case.get("expected_sources", []),
            "retrieved_source": source_file_names(sources),
            "reason": ", ".join(failure_reasons) if failure_reasons else "passed",
            "possible_fix": failure_fix(failure_reasons[0]) if failure_reasons else "",
        },
        "response_time_ms": response_time_ms,
        "average_retrieval_score": average(retrieval_scores),
        "top_retrieved_source": top_source_name(sources),
        "expected_sources": case.get("expected_sources", []),
        "actual_sources": source_file_names(sources),
        "missing_keywords": missing_keywords,
        "cited_source_ids": cited_source_ids,
        "valid_source_ids": valid_source_ids,
        "answer_excerpt": answer_excerpt(answer),
        "checks": checks,
    }


def summarize_results(results: list[dict], language: str | None = None) -> dict:
    total = len(results)
    passed = sum(1 for result in results if result["passed"])
    failed = total - passed
    role_counts = {}
    for role in ("hr", "technical_hiring_manager"):
        role_results = [result for result in results if result.get("role") == role]
        role_counts[role] = {
            "total": len(role_results),
            "passed": sum(1 for result in role_results if result["passed"]),
            "pass_rate": safe_rate(
                sum(1 for result in role_results if result["passed"]),
                len(role_results),
            ),
        }

    check_names = [
        "retrieval_accuracy",
        "citation_success",
        "grounding_success",
        "keyword_coverage",
        "language_consistency",
        "not_safe_no_answer",
    ]
    check_rates = {
        f"{check}_rate": safe_rate(
            sum(1 for result in results if result["checks"].get(check)),
            total,
        )
        for check in check_names
    }
    reason_counts = Counter(
        reason
        for result in results
        for reason in result.get("failure_reasons", [])
    )
    scores = [
        result["average_retrieval_score"]
        for result in results
        if isinstance(result.get("average_retrieval_score"), (int, float))
        and result.get("average_retrieval_score") > 0
    ]
    response_times = [
        result["response_time_ms"]
        for result in results
        if isinstance(result.get("response_time_ms"), (int, float))
    ]

    return {
        "language": language,
        "total_questions": total,
        "passed_questions": passed,
        "failed_questions": failed,
        "overall_pass_rate": safe_rate(passed, total),
        "hr": role_counts["hr"],
        "technical_hiring_manager": role_counts["technical_hiring_manager"],
        "citation_success_rate": check_rates["citation_success_rate"],
        "retrieval_accuracy_rate": check_rates["retrieval_accuracy_rate"],
        "grounding_success_rate": check_rates["grounding_success_rate"],
        "language_consistency_rate": check_rates["language_consistency_rate"],
        "keyword_coverage_rate": check_rates["keyword_coverage_rate"],
        "average_retrieval_score": average(scores),
        "average_response_time_ms": average(response_times),
        "failure_reason_counts": dict(reason_counts),
    }


def build_language_report(language: str, questions_path: str, results: list[dict]) -> dict:
    return {
        "generated_at": datetime.now(UTC).isoformat(),
        "language": language,
        "questions_path": questions_path,
        "metadata_filter": CRC_METADATA_FILTER,
        "summary": summarize_results(results, language=language),
        "results": results,
    }


def top_failed_questions(results: list[dict], limit: int = 10) -> list[dict]:
    failures = [result for result in results if not result["passed"]]
    return sorted(
        failures,
        key=lambda result: (
            len(result.get("failure_reasons", [])),
            result.get("response_time_ms") or 0,
        ),
        reverse=True,
    )[:limit]


def build_recommendations(summary: dict) -> dict[str, list[str]]:
    reason_counts = Counter(summary.get("failure_reason_counts", {}))
    recommendations = {
        "quick_wins": [],
        "medium_effort": [],
        "major_architectural_improvements": [],
    }

    if reason_counts.get("citation_validation"):
        recommendations["quick_wins"].append(
            "Tighten the answer prompt and validator trace fields so every factual answer cites returned source IDs."
        )
    if reason_counts.get("language_mismatch"):
        recommendations["quick_wins"].append(
            "Add explicit locale-specific answer instructions for English and zh-TW evaluation prompts."
        )
    if reason_counts.get("missing_keyword"):
        recommendations["medium_effort"].append(
            "Review failed keyword coverage and add clearer source wording for hiring-facing project value and technical trade-off claims."
        )
    if reason_counts.get("wrong_retrieval"):
        recommendations["medium_effort"].append(
            "Strengthen CRC-RAG metadata, section headings, and retrieval ranking for Overview, Architecture, Implementation, and RAG design documents."
        )
    if reason_counts.get("insufficient_context"):
        recommendations["major_architectural_improvements"].append(
            "Improve parent-child context assembly and retrieval diagnostics for multi-step technical hiring-manager questions."
        )
    if reason_counts.get("safe_no_answer"):
        recommendations["major_architectural_improvements"].append(
            "Add pre-validation answer traces and validator replacement reasons to distinguish retrieval failure from citation replacement."
        )

    for key, fallback in {
        "quick_wins": "Keep this suite in CI as a soft-fail eval artifact after each CRC-RAG documentation update.",
        "medium_effort": "Periodically review the top failed questions and update chunk boundaries or source docs where failures cluster.",
        "major_architectural_improvements": "Use repeated hard-question failures to prioritize retrieval architecture improvements.",
    }.items():
        if not recommendations[key]:
            recommendations[key].append(fallback)

    return recommendations


def build_combined_summary(en_report: dict, zh_report: dict) -> dict:
    combined_results = en_report["results"] + zh_report["results"]
    combined_summary = summarize_results(combined_results)
    return {
        "generated_at": datetime.now(UTC).isoformat(),
        "summary": combined_summary,
        "english": en_report["summary"],
        "traditional_chinese": zh_report["summary"],
        "top_10_failed_questions": top_failed_questions(combined_results, limit=10),
        "recommendations": build_recommendations(combined_summary),
    }


def format_rate(value: float) -> str:
    return f"{round(value * 100, 2)}%"


def build_language_markdown(report: dict) -> str:
    summary = report["summary"]
    lines = [
        f"# CRC-RAG Hiring Evaluation - {report['language']}",
        "",
        f"- Generated at: `{report['generated_at']}`",
        f"- Questions: `{summary['total_questions']}`",
        f"- Overall pass rate: `{format_rate(summary['overall_pass_rate'])}`",
        f"- HR pass rate: `{format_rate(summary['hr']['pass_rate'])}`",
        f"- Technical hiring manager pass rate: `{format_rate(summary['technical_hiring_manager']['pass_rate'])}`",
        f"- Citation success rate: `{format_rate(summary['citation_success_rate'])}`",
        f"- Retrieval accuracy: `{format_rate(summary['retrieval_accuracy_rate'])}`",
        f"- Grounding success: `{format_rate(summary['grounding_success_rate'])}`",
        f"- Average retrieval score: `{summary['average_retrieval_score']}`",
        f"- Average response time ms: `{summary['average_response_time_ms']}`",
        "",
        "## Failure Reasons",
        "",
    ]
    if summary["failure_reason_counts"]:
        for reason, count in sorted(summary["failure_reason_counts"].items()):
            lines.append(f"- {reason}: `{count}`")
    else:
        lines.append("- None")

    lines.extend(["", "## Failed Questions", ""])
    failed = [result for result in report["results"] if not result["passed"]]
    if not failed:
        lines.append("- None")
    for result in failed:
        failure = result["failure_analysis"]
        lines.extend(
            [
                f"### {result['id']}",
                "",
                f"- Question: {result['question']}",
                f"- Expected source: `{', '.join(result['expected_sources'])}`",
                f"- Retrieved source: `{', '.join(result['actual_sources'])}`",
                f"- Top retrieved source: `{result.get('top_retrieved_source')}`",
                f"- Failure reason: `{', '.join(result['failure_reasons'])}`",
                f"- Possible fix: {failure['possible_fix']}",
                f"- Missing keywords: `{', '.join(result.get('missing_keywords', []))}`",
                "",
                "Answer excerpt:",
                "",
                result["answer_excerpt"] or "(empty)",
                "",
            ]
        )

    return "\n".join(lines).rstrip() + "\n"


def build_summary_markdown(summary_report: dict) -> str:
    summary = summary_report["summary"]
    en = summary_report["english"]
    zh = summary_report["traditional_chinese"]
    recommendations = summary_report["recommendations"]
    lines = [
        "# CRC-RAG Hiring Evaluation",
        "",
        "## Files Created",
        "",
        "- `backend-GCP/evals/questionnaires/en/hr.md`",
        "- `backend-GCP/evals/questionnaires/en/technical_hiring_manager.md`",
        "- `backend-GCP/evals/questionnaires/zh-TW/hr.md`",
        "- `backend-GCP/evals/questionnaires/zh-TW/technical_hiring_manager.md`",
        "- `backend-GCP/evals/golden_questions/crc_rag_en.json`",
        "- `backend-GCP/evals/golden_questions/crc_rag_zh_TW.json`",
        "- `backend-GCP/evals/run_crc_rag_hiring_eval.py`",
        "- `backend-GCP/evals/reports/crc_rag_hiring_eval_en.md`",
        "- `backend-GCP/evals/reports/crc_rag_hiring_eval_en.json`",
        "- `backend-GCP/evals/reports/crc_rag_hiring_eval_zh.md`",
        "- `backend-GCP/evals/reports/crc_rag_hiring_eval_zh.json`",
        "- `backend-GCP/evals/reports/crc_rag_hiring_eval_summary.md`",
        "",
        "## English",
        "",
        f"Questions: `{en['total_questions']}`",
        "",
        f"Pass Rate: `{format_rate(en['overall_pass_rate'])}`",
        "",
        "## Traditional Chinese",
        "",
        f"Questions: `{zh['total_questions']}`",
        "",
        f"Pass Rate: `{format_rate(zh['overall_pass_rate'])}`",
        "",
        "## HR",
        "",
        f"Pass Rate: `{format_rate(safe_rate(en['hr']['passed'] + zh['hr']['passed'], en['hr']['total'] + zh['hr']['total']))}`",
        "",
        "## Technical Hiring Manager",
        "",
        f"Pass Rate: `{format_rate(safe_rate(en['technical_hiring_manager']['passed'] + zh['technical_hiring_manager']['passed'], en['technical_hiring_manager']['total'] + zh['technical_hiring_manager']['total']))}`",
        "",
        "## Citation Success",
        "",
        f"`{format_rate(summary['citation_success_rate'])}`",
        "",
        "## Retrieval Accuracy",
        "",
        f"`{format_rate(summary['retrieval_accuracy_rate'])}`",
        "",
        "## Grounding Success",
        "",
        f"`{format_rate(summary['grounding_success_rate'])}`",
        "",
        "## Response Time",
        "",
        f"Average response time: `{summary['average_response_time_ms']} ms`",
        "",
        "## Common Failure Reasons",
        "",
    ]
    if summary["failure_reason_counts"]:
        for reason, count in sorted(summary["failure_reason_counts"].items()):
            lines.append(f"- {reason}: `{count}`")
    else:
        lines.append("- None")

    lines.extend(["", "## Top 10 Failed Questions", ""])
    if not summary_report["top_10_failed_questions"]:
        lines.append("- None")
    for result in summary_report["top_10_failed_questions"]:
        lines.extend(
            [
                f"### {result['id']}",
                "",
                f"- Question: {result['question']}",
                f"- Expected Source: `{', '.join(result['expected_sources'])}`",
                f"- Actual Source: `{', '.join(result['actual_sources'])}`",
                f"- Reason: `{', '.join(result['failure_reasons'])}`",
                f"- Possible Fix: {result['failure_analysis']['possible_fix']}",
                "",
            ]
        )

    lines.extend(["## Recommendations", "", "### Quick Wins", ""])
    lines.extend(f"- {item}" for item in recommendations["quick_wins"])
    lines.extend(["", "### Medium Effort", ""])
    lines.extend(f"- {item}" for item in recommendations["medium_effort"])
    lines.extend(["", "### Major Architectural Improvements", ""])
    lines.extend(f"- {item}" for item in recommendations["major_architectural_improvements"])

    return "\n".join(lines).rstrip() + "\n"


def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def write_markdown(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def run_language(language: str, questions_path: str) -> dict:
    questions = load_questions(questions_path)
    results = []
    for index, case in enumerate(questions, start=1):
        result = evaluate_case(case)
        results.append(result)
        status = "PASS" if result["passed"] else "FAIL"
        reasons = ",".join(result.get("failure_reasons", []))
        print(f"{language} {index}/{len(questions)} {status} {result['id']} {reasons}".rstrip())

    return build_language_report(language, questions_path, results)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run the CRC-RAG bilingual hiring evaluation suite.",
    )
    parser.add_argument("--en-questions", default=DEFAULT_EN_QUESTIONS)
    parser.add_argument("--zh-questions", default=DEFAULT_ZH_QUESTIONS)
    parser.add_argument("--reports-dir", default=DEFAULT_REPORTS_DIR)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    reports_dir = BACKEND_ROOT / args.reports_dir

    en_report = run_language("en", args.en_questions)
    zh_report = run_language("zh-TW", args.zh_questions)
    summary_report = build_combined_summary(en_report, zh_report)

    write_json(reports_dir / "crc_rag_hiring_eval_en.json", en_report)
    write_markdown(
        reports_dir / "crc_rag_hiring_eval_en.md",
        build_language_markdown(en_report),
    )
    write_json(reports_dir / "crc_rag_hiring_eval_zh.json", zh_report)
    write_markdown(
        reports_dir / "crc_rag_hiring_eval_zh.md",
        build_language_markdown(zh_report),
    )
    write_markdown(
        reports_dir / "crc_rag_hiring_eval_summary.md",
        build_summary_markdown(summary_report),
    )

    print(
        "Overall pass rate: "
        f"{summary_report['summary']['overall_pass_rate']} "
        f"({summary_report['summary']['passed_questions']}/"
        f"{summary_report['summary']['total_questions']})"
    )
    print(f"Reports saved to: {reports_dir.relative_to(BACKEND_ROOT)}")


if __name__ == "__main__":
    main()

import argparse
import json
import os
import re
import sys
import time
from datetime import UTC, datetime
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


DEFAULT_BASE_URL = "http://localhost:8080"
DEFAULT_QUESTIONS_PATH = "evals/golden_questions.json"
DEFAULT_MARKDOWN_REPORT_PATH = "rag_eval_report.md"
DEFAULT_JSON_REPORT_PATH = "rag_eval_report.json"
DEFAULT_MIN_OVERALL_PASS_RATE = 0.80
DEFAULT_MIN_SOURCE_MATCH_RATE = 0.75
DEFAULT_MIN_CITATION_RATE = 0.90
DEFAULT_MAX_AVERAGE_LATENCY_MS = 12000
NO_ANSWER_PATTERNS = (
    "do not know",
    "don't know",
    "not in the context",
    "not in the indexed",
    "based on the indexed project documents",
)


def normalize_text(value):
    return re.sub(r"\s+", " ", str(value or "").lower()).strip()


def load_questions(path):
    questions_path = Path(path)
    with questions_path.open(encoding="utf-8") as file:
        questions = json.load(file)

    if not isinstance(questions, list):
        raise ValueError("Golden question file must contain a JSON list.")

    return questions


def call_ask_rag(base_url, question, timeout):
    url = f"{base_url.rstrip('/')}/ask-rag"
    payload = json.dumps({"question": question}).encode("utf-8")
    request = Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    started_at = time.perf_counter()
    with urlopen(request, timeout=timeout) as response:
        body = response.read().decode("utf-8")
        duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
        return json.loads(body), response.status, duration_ms


def contains_all_terms(answer, terms):
    normalized_answer = normalize_text(answer)
    missing = [
        term
        for term in terms or []
        if normalize_text(term) not in normalized_answer
    ]
    return len(missing) == 0, missing


def contains_no_forbidden_terms(answer, terms):
    normalized_answer = normalize_text(answer)
    found = [
        term
        for term in terms or []
        if normalize_text(term) in normalized_answer
    ]
    return len(found) == 0, found


def extract_source_files(sources):
    return sorted(
        {
            source.get("file_name")
            for source in sources or []
            if source.get("file_name")
        }
    )


def extract_doc_types(sources):
    return sorted(
        {
            source.get("doc_type")
            for source in sources or []
            if source.get("doc_type")
        }
    )


def check_source_match(sources, expected_sources):
    source_files = set(extract_source_files(sources))
    expected = set(expected_sources or [])
    missing = sorted(expected - source_files)
    return len(missing) == 0, missing, sorted(source_files)


def check_doc_type_match(sources, expected_doc_types):
    if not expected_doc_types:
        return True, [], extract_doc_types(sources)

    doc_types = set(extract_doc_types(sources))
    expected = set(expected_doc_types)
    missing = sorted(expected - doc_types)
    return len(missing) == 0, missing, sorted(doc_types)


def extract_cited_source_ids(answer):
    return sorted(set(re.findall(r"\[(S\d+)\]", answer or "")))


def check_citation_grounding(answer, sources, expect_no_answer=False):
    if expect_no_answer and is_no_answer(answer):
        return True, [], []

    valid_source_ids = sorted(
        source.get("source_id")
        for source in sources or []
        if source.get("source_id")
    )
    cited_source_ids = extract_cited_source_ids(answer)

    if not valid_source_ids:
        return False, cited_source_ids, valid_source_ids

    if not cited_source_ids:
        return False, cited_source_ids, valid_source_ids

    invalid_citations = sorted(set(cited_source_ids) - set(valid_source_ids))
    return len(invalid_citations) == 0, cited_source_ids, valid_source_ids


def is_no_answer(answer):
    normalized_answer = normalize_text(answer)
    return any(pattern in normalized_answer for pattern in NO_ANSWER_PATTERNS)


def check_no_answer(answer, expect_no_answer):
    actual_no_answer = is_no_answer(answer)
    if expect_no_answer:
        return actual_no_answer, actual_no_answer

    return not actual_no_answer, actual_no_answer


def build_answer_excerpt(answer, limit=260):
    compact_answer = re.sub(r"\s+", " ", answer or "").strip()
    if len(compact_answer) <= limit:
        return compact_answer

    return f"{compact_answer[:limit].rstrip()}..."


def build_failure_reasons(checks, details):
    reasons = []

    if not checks["source_match"]:
        reasons.append("source_mismatch")

    if not checks["required_terms"]:
        reasons.append("missing_required_terms")

    if not checks["forbidden_terms"]:
        reasons.append("forbidden_claim")

    if not checks["citation_grounding"]:
        if details.get("cited_source_ids"):
            reasons.append("invalid_citation")
        else:
            reasons.append("missing_citation")

    if not checks["no_answer"]:
        reasons.append("wrong_no_answer")

    if not checks["doc_type_match"]:
        reasons.append("source_mismatch")

    return sorted(set(reasons), key=reasons.index)


def evaluate_response(case, response, status_code, latency_ms):
    answer = response.get("answer", "")
    sources = response.get("sources", [])
    expected_sources = case.get("expected_sources", [])
    expected_doc_types = case.get("expected_doc_types", [])
    expect_no_answer = bool(case.get("expect_no_answer", False))

    source_match, missing_sources, sources_returned = check_source_match(
        sources,
        expected_sources,
    )
    doc_type_match, missing_doc_types, doc_types_returned = check_doc_type_match(
        sources,
        expected_doc_types,
    )
    required_terms, missing_required_terms = contains_all_terms(
        answer,
        case.get("answer_must_include", []),
    )
    forbidden_terms, found_forbidden_terms = contains_no_forbidden_terms(
        answer,
        case.get("answer_should_not_include", []),
    )
    citation_grounding, cited_source_ids, valid_source_ids = check_citation_grounding(
        answer,
        sources,
        expect_no_answer=expect_no_answer,
    )
    no_answer, actual_no_answer = check_no_answer(answer, expect_no_answer)

    checks = {
        "source_match": source_match,
        "doc_type_match": doc_type_match,
        "required_terms": required_terms,
        "forbidden_terms": forbidden_terms,
        "citation_grounding": citation_grounding,
        "no_answer": no_answer,
    }
    details = {
        "cited_source_ids": cited_source_ids,
        "valid_source_ids": valid_source_ids,
    }
    failure_reasons = build_failure_reasons(checks, details)

    return {
        "id": case["id"],
        "category": case.get("category", "uncategorized"),
        "project": case.get("project"),
        "question": case["question"],
        "passed": len(failure_reasons) == 0,
        "failure_reasons": failure_reasons,
        "latency_ms": latency_ms,
        "status_code": status_code,
        "sources_returned": sources_returned,
        "doc_types_returned": doc_types_returned,
        "expected_sources": expected_sources,
        "expected_doc_types": expected_doc_types,
        "missing_sources": missing_sources,
        "missing_doc_types": missing_doc_types,
        "missing_required_terms": missing_required_terms,
        "found_forbidden_terms": found_forbidden_terms,
        "cited_source_ids": cited_source_ids,
        "valid_source_ids": valid_source_ids,
        "answer_excerpt": build_answer_excerpt(answer),
        "checks": checks,
        "actual_no_answer": actual_no_answer,
        "expect_no_answer": expect_no_answer,
    }


def evaluate_case(base_url, case, timeout):
    started_at = time.perf_counter()
    try:
        response, status_code, latency_ms = call_ask_rag(
            base_url,
            case["question"],
            timeout,
        )
    except TimeoutError:
        return build_error_result(case, "latency_timeout", "Request timed out")
    except HTTPError as error:
        latency_ms = round((time.perf_counter() - started_at) * 1000, 2)
        return build_error_result(
            case,
            "request_error",
            f"HTTP {error.code}: {error.reason}",
            latency_ms=latency_ms,
        )
    except URLError as error:
        latency_ms = round((time.perf_counter() - started_at) * 1000, 2)
        return build_error_result(
            case,
            "request_error",
            f"Connection error: {error.reason}",
            latency_ms=latency_ms,
        )

    return evaluate_response(case, response, status_code, latency_ms)


def build_error_result(case, reason, message, latency_ms=None):
    checks = {
        "source_match": False,
        "doc_type_match": False,
        "required_terms": False,
        "forbidden_terms": False,
        "citation_grounding": False,
        "no_answer": False,
    }
    return {
        "id": case["id"],
        "category": case.get("category", "uncategorized"),
        "project": case.get("project"),
        "question": case["question"],
        "passed": False,
        "failure_reasons": [reason],
        "latency_ms": latency_ms,
        "sources_returned": [],
        "doc_types_returned": [],
        "expected_sources": case.get("expected_sources", []),
        "expected_doc_types": case.get("expected_doc_types", []),
        "answer_excerpt": "",
        "checks": checks,
        "error": message,
    }


def safe_rate(passed, total):
    if total <= 0:
        return 0

    return round(passed / total, 4)


def percentile(values, percentile_rank):
    if not values:
        return 0

    sorted_values = sorted(values)
    index = int(round((len(sorted_values) - 1) * percentile_rank))
    return round(sorted_values[index], 2)


def summarize_results(results):
    total_cases = len(results)
    passed_cases = sum(1 for result in results if result["passed"])
    failed_cases = total_cases - passed_cases
    latencies = [
        result["latency_ms"]
        for result in results
        if isinstance(result.get("latency_ms"), (int, float))
    ]

    check_names = [
        "source_match",
        "required_terms",
        "forbidden_terms",
        "citation_grounding",
        "no_answer",
    ]
    check_rates = {}
    for check_name in check_names:
        check_rates[f"{check_name}_rate"] = safe_rate(
            sum(1 for result in results if result["checks"].get(check_name)),
            total_cases,
        )

    failure_category_counts = {}
    for result in results:
        for reason in result.get("failure_reasons", []):
            failure_category_counts[reason] = failure_category_counts.get(reason, 0) + 1

    average_latency_ms = (
        round(sum(latencies) / len(latencies), 2)
        if latencies
        else 0
    )

    return {
        "total_cases": total_cases,
        "passed_cases": passed_cases,
        "failed_cases": failed_cases,
        "overall_pass_rate": safe_rate(passed_cases, total_cases),
        **check_rates,
        "no_answer_accuracy": check_rates["no_answer_rate"],
        "average_latency_ms": average_latency_ms,
        "p95_latency_ms": percentile(latencies, 0.95),
        "failure_category_counts": failure_category_counts,
    }


def build_thresholds(args):
    return {
        "min_overall_pass_rate": coerce_float(
            args.min_overall_pass_rate,
            os.getenv("RAG_EVAL_MIN_OVERALL_PASS_RATE"),
            DEFAULT_MIN_OVERALL_PASS_RATE,
        ),
        "min_source_match_rate": coerce_float(
            args.min_source_match_rate,
            os.getenv("RAG_EVAL_MIN_SOURCE_MATCH_RATE"),
            DEFAULT_MIN_SOURCE_MATCH_RATE,
        ),
        "min_citation_rate": coerce_float(
            args.min_citation_rate,
            os.getenv("RAG_EVAL_MIN_CITATION_RATE"),
            DEFAULT_MIN_CITATION_RATE,
        ),
        "max_average_latency_ms": coerce_float(
            args.max_average_latency_ms,
            os.getenv("RAG_EVAL_MAX_AVERAGE_LATENCY_MS"),
            DEFAULT_MAX_AVERAGE_LATENCY_MS,
        ),
    }


def coerce_float(cli_value, env_value, default):
    if cli_value is not None:
        return float(cli_value)

    if env_value not in {None, ""}:
        return float(env_value)

    return float(default)


def evaluate_thresholds(summary, thresholds):
    failures = []

    if summary["overall_pass_rate"] < thresholds["min_overall_pass_rate"]:
        failures.append("overall_pass_rate")

    if summary["source_match_rate"] < thresholds["min_source_match_rate"]:
        failures.append("source_match_rate")

    if summary["citation_grounding_rate"] < thresholds["min_citation_rate"]:
        failures.append("citation_grounding_rate")

    if summary["average_latency_ms"] > thresholds["max_average_latency_ms"]:
        failures.append("average_latency_ms")

    return {
        "passed": len(failures) == 0,
        "failures": failures,
        "thresholds": thresholds,
    }


def build_report(base_url, questions_path, results, thresholds, soft_fail):
    summary = summarize_results(results)
    threshold_result = evaluate_thresholds(summary, thresholds)
    return {
        "generated_at": datetime.now(UTC).isoformat(),
        "base_url": base_url,
        "questions_path": questions_path,
        "soft_fail": soft_fail,
        "summary": summary,
        "thresholds": threshold_result,
        "results": results,
    }


def build_markdown_report(report):
    summary = report["summary"]
    threshold_result = report["thresholds"]
    lines = [
        "# RAG Evaluation Report",
        "",
        f"- Generated at: `{report['generated_at']}`",
        f"- Base URL: `{report['base_url']}`",
        f"- Questions: `{report['questions_path']}`",
        f"- Soft fail: `{report['soft_fail']}`",
        "",
        "## Summary",
        "",
        f"- Total cases: `{summary['total_cases']}`",
        f"- Passed cases: `{summary['passed_cases']}`",
        f"- Failed cases: `{summary['failed_cases']}`",
        f"- Overall pass rate: `{summary['overall_pass_rate']}`",
        f"- Source match rate: `{summary['source_match_rate']}`",
        f"- Required terms rate: `{summary['required_terms_rate']}`",
        f"- Forbidden terms rate: `{summary['forbidden_terms_rate']}`",
        f"- Citation grounding rate: `{summary['citation_grounding_rate']}`",
        f"- No-answer accuracy: `{summary['no_answer_accuracy']}`",
        f"- Average latency ms: `{summary['average_latency_ms']}`",
        f"- P95 latency ms: `{summary['p95_latency_ms']}`",
        "",
        "## Thresholds",
        "",
        f"- Threshold pass: `{threshold_result['passed']}`",
        f"- Failed thresholds: `{', '.join(threshold_result['failures'])}`",
    ]

    for key, value in threshold_result["thresholds"].items():
        lines.append(f"- {key}: `{value}`")

    lines.extend(["", "## Failure Categories", ""])
    if summary["failure_category_counts"]:
        for reason, count in sorted(summary["failure_category_counts"].items()):
            lines.append(f"- {reason}: `{count}`")
    else:
        lines.append("- None")

    lines.extend(["", "## Results", ""])
    for result in report["results"]:
        status = "PASS" if result["passed"] else "FAIL"
        lines.extend(
            [
                f"### {result['id']} - {status}",
                "",
                f"- Category: `{result['category']}`",
                f"- Question: {result['question']}",
                f"- Failure reasons: `{', '.join(result.get('failure_reasons', []))}`",
                f"- Latency ms: `{result.get('latency_ms')}`",
                f"- Sources returned: `{', '.join(result.get('sources_returned', []))}`",
                f"- Expected sources: `{', '.join(result.get('expected_sources', []))}`",
                f"- Checks: `{json.dumps(result.get('checks', {}), sort_keys=True)}`",
            ]
        )
        if result.get("error"):
            lines.append(f"- Error: `{result['error']}`")
        if result.get("answer_excerpt"):
            lines.extend(["", "Answer excerpt:", "", result["answer_excerpt"]])
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def save_reports(report, markdown_output_path, json_output_path):
    markdown_path = Path(markdown_output_path)
    markdown_path.parent.mkdir(parents=True, exist_ok=True)
    markdown_path.write_text(build_markdown_report(report), encoding="utf-8")

    json_path = Path(json_output_path)
    json_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(report, indent=2), encoding="utf-8")


def parse_args():
    parser = argparse.ArgumentParser(description="Evaluate the RAG /ask-rag endpoint.")
    parser.add_argument(
        "--base-url",
        default=DEFAULT_BASE_URL,
        help="Base URL for the backend, for example http://localhost:8080.",
    )
    parser.add_argument(
        "--questions",
        default=DEFAULT_QUESTIONS_PATH,
        help="Path to the golden question JSON file.",
    )
    parser.add_argument(
        "--output",
        default=DEFAULT_MARKDOWN_REPORT_PATH,
        help="Markdown report output path.",
    )
    parser.add_argument(
        "--json-output",
        default=DEFAULT_JSON_REPORT_PATH,
        help="JSON report output path.",
    )
    parser.add_argument(
        "--timeout",
        default=30,
        type=int,
        help="HTTP request timeout in seconds.",
    )
    parser.add_argument("--min-overall-pass-rate", type=float)
    parser.add_argument("--min-source-match-rate", type=float)
    parser.add_argument("--min-citation-rate", type=float)
    parser.add_argument("--max-average-latency-ms", type=float)
    parser.add_argument(
        "--soft-fail",
        action="store_true",
        help="Print failures and write reports, but exit 0 even if thresholds fail.",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    questions = load_questions(args.questions)
    thresholds = build_thresholds(args)
    results = [
        evaluate_case(args.base_url, case, args.timeout)
        for case in questions
    ]
    report = build_report(
        base_url=args.base_url,
        questions_path=args.questions,
        results=results,
        thresholds=thresholds,
        soft_fail=args.soft_fail,
    )
    save_reports(report, args.output, args.json_output)

    for result in results:
        status = "PASS" if result["passed"] else "FAIL"
        reasons = ",".join(result.get("failure_reasons", []))
        print(f"{status} {result['id']} {reasons}".rstrip())

    print(
        "Pass rate: "
        f"{report['summary']['overall_pass_rate']} "
        f"({report['summary']['passed_cases']}/{report['summary']['total_cases']})"
    )
    print(f"Markdown report saved to: {args.output}")
    print(f"JSON report saved to: {args.json_output}")

    if not report["thresholds"]["passed"]:
        print(
            "Threshold failures: "
            + ", ".join(report["thresholds"]["failures"]),
            file=sys.stderr,
        )
        if not args.soft_fail:
            sys.exit(1)


if __name__ == "__main__":
    main()

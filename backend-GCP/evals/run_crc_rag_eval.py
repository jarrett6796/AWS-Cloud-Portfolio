import json
import re
import sys
import uuid
from datetime import UTC, datetime
from pathlib import Path


BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.services.rag_service import rag_service
from scripts.crc_rag_docs import CRC_RAG_QUESTIONS, CRC_RAG_SOURCE_PREFIX


NO_ANSWER_PATTERNS = (
    "do not know",
    "don't know",
    "not in the indexed",
    "not enough information",
)


def normalize(value: str | None) -> str:
    return re.sub(r"\s+", " ", value or "").strip().lower()


def answer_excerpt(answer: str, limit: int = 300) -> str:
    compact = " ".join((answer or "").split())
    if len(compact) <= limit:
        return compact

    return f"{compact[:limit].rstrip()}..."


def source_ids(sources: list[dict]) -> set[str]:
    return {
        source.get("source_id")
        for source in sources
        if source.get("source_id")
    }


def cited_source_ids(answer: str) -> set[str]:
    return set(re.findall(r"\[(S\d+)\]", answer or ""))


def evaluate_case(case: dict) -> dict:
    response = rag_service.answer_question(
        case["question"],
        history=[],
        session_id=f"crc-rag-eval-{uuid.uuid4()}",
        metadata_filter={"source_uri": "knowledge-base/crc-rag/"},
    )
    answer = response.get("answer", "")
    sources = response.get("sources", [])
    normalized_answer = normalize(answer)
    valid_ids = source_ids(sources)
    cited_ids = cited_source_ids(answer)
    missing_terms = [
        term
        for term in case.get("expected_terms", ())
        if normalize(term) not in normalized_answer
    ]
    source_mismatches = [
        source.get("source_uri")
        for source in sources
        if not str(source.get("source_uri") or "").startswith(CRC_RAG_SOURCE_PREFIX)
    ]
    checks = {
        "retrieval_source_correctness": bool(sources) and not source_mismatches,
        "source_presence": bool(sources),
        "citation_presence": bool(cited_ids),
        "citation_grounded": bool(cited_ids) and cited_ids.issubset(valid_ids),
        "basic_response_relevance": not missing_terms,
        "not_safe_no_answer": not any(
            pattern in normalized_answer for pattern in NO_ANSWER_PATTERNS
        ),
    }

    return {
        "id": case["id"],
        "question": case["question"],
        "passed": all(checks.values()),
        "checks": checks,
        "missing_terms": missing_terms,
        "source_mismatches": source_mismatches,
        "sources_returned": [
            {
                "source_id": source.get("source_id"),
                "source_uri": source.get("source_uri"),
                "file_name": source.get("file_name"),
                "heading": source.get("heading"),
                "score": source.get("score"),
                "vector_distance": source.get("vector_distance"),
            }
            for source in sources
        ],
        "valid_source_ids": sorted(valid_ids),
        "cited_source_ids": sorted(cited_ids),
        "answer_excerpt": answer_excerpt(answer),
    }


def build_markdown_report(report: dict) -> str:
    summary = report["summary"]
    lines = [
        "# CRC-RAG Evaluation Report",
        "",
        f"- Generated at: `{report['generated_at']}`",
        f"- Total cases: `{summary['total_cases']}`",
        f"- Passed cases: `{summary['passed_cases']}`",
        f"- Failed cases: `{summary['failed_cases']}`",
        f"- Pass rate: `{summary['pass_rate']}`",
        "",
        "## Results",
        "",
    ]

    for result in report["results"]:
        status = "PASS" if result["passed"] else "FAIL"
        top_source = result["sources_returned"][0] if result["sources_returned"] else {}
        lines.extend(
            [
                f"### {result['id']} - {status}",
                "",
                f"- Question: {result['question']}",
                f"- Top source: `{top_source.get('file_name')}`",
                f"- Top heading: `{top_source.get('heading')}`",
                f"- Checks: `{json.dumps(result['checks'], sort_keys=True)}`",
                f"- Missing terms: `{', '.join(result['missing_terms'])}`",
                f"- Cited source IDs: `{', '.join(result['cited_source_ids'])}`",
                "",
                "Answer excerpt:",
                "",
                result["answer_excerpt"],
                "",
            ]
        )

    return "\n".join(lines).rstrip() + "\n"


def main() -> None:
    results = [evaluate_case(case) for case in CRC_RAG_QUESTIONS]
    passed_cases = sum(1 for result in results if result["passed"])
    report = {
        "generated_at": datetime.now(UTC).isoformat(),
        "summary": {
            "total_cases": len(results),
            "passed_cases": passed_cases,
            "failed_cases": len(results) - passed_cases,
            "pass_rate": round(passed_cases / len(results), 4),
        },
        "results": results,
    }
    date_stamp = datetime.now(UTC).strftime("%Y%m%d")
    reports_dir = BACKEND_ROOT / "evals" / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)
    markdown_path = reports_dir / f"rag_eval_crc_rag_docs_{date_stamp}.md"
    json_path = reports_dir / f"rag_eval_crc_rag_docs_{date_stamp}.json"
    markdown_path.write_text(build_markdown_report(report), encoding="utf-8")
    json_path.write_text(
        json.dumps(report, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    for result in results:
        status = "PASS" if result["passed"] else "FAIL"
        print(f"{status} {result['id']}")

    print(
        "Pass rate: "
        f"{report['summary']['pass_rate']} "
        f"({passed_cases}/{len(results)})"
    )
    print(f"Markdown report saved to: {markdown_path.relative_to(BACKEND_ROOT)}")
    print(f"JSON report saved to: {json_path.relative_to(BACKEND_ROOT)}")

    if passed_cases != len(results):
        sys.exit(1)


if __name__ == "__main__":
    main()

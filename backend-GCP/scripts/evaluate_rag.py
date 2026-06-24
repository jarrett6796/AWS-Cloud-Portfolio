import argparse
import json
import re
import sys
import time
from datetime import UTC, datetime
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


DEFAULT_BASE_URL = "http://localhost:8080"
DEFAULT_REPORT_PATH = "rag_eval_report.json"


EVAL_DATASET = [
    {
        "id": "project_overview",
        "question": "What is this capstone project about?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": ["portfolio", "rag", "cloud", "aws", "gcp"],
        "forbidden_claims": [
            "bedrock knowledge base is currently implemented",
            "s3 vectors is currently implemented",
            "lambda rag backend is currently implemented",
        ],
    },
    {
        "id": "current_stack",
        "question": "What is the current deployed RAG backend stack?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": [
            "cloud run",
            "fastapi",
            "gemini",
            "firestore",
            "gcs",
        ],
        "forbidden_claims": [
            "amazon bedrock generates the current answer",
            "api gateway invokes the current rag backend",
            "lambda hosts the current rag backend",
        ],
    },
    {
        "id": "aws_path",
        "question": "What AWS path is still part of this capstone?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": ["visitor", "lambda", "api gateway", "dynamodb"],
        "forbidden_claims": [
            "aws bedrock is the active rag backend",
            "s3 vectors is already deployed",
        ],
    },
    {
        "id": "advanced_rag_status",
        "question": "What advanced RAG improvements have been completed?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": [
            "error",
            "logging",
            "idempotent",
            "markdown",
            "metadata",
            "citations",
            "history",
            "streaming",
        ],
        "forbidden_claims": [
            "managed vector search is complete",
            "agentic rag is complete",
            "graph rag is complete",
        ],
    },
    {
        "id": "frontend_integration",
        "question": "How does the frontend connect to the RAG backend?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": ["react", "vite", "ask-rag", "cloud run"],
        "forbidden_claims": [
            "the frontend calls bedrock directly",
            "the frontend calls firestore directly",
        ],
    },
]

EXTRA_EVAL_CASES = [
    {
        "id": "cloud_run_role",
        "question": "What role does Cloud Run play in the RAG backend?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": ["cloud run", "fastapi", "backend"],
        "forbidden_claims": ["lambda hosts the current rag backend"],
    },
    {
        "id": "vertex_generation",
        "question": "Which model generates answers for the current assistant?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": ["gemini", "2.5", "flash"],
        "forbidden_claims": ["bedrock generates the current answer"],
    },
    {
        "id": "vertex_embeddings",
        "question": "Which embedding model is used for document chunks?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": ["text-embedding-005", "embedding"],
        "forbidden_claims": ["s3 vectors"],
    },
    {
        "id": "firestore_chunks",
        "question": "Where are RAG document chunks stored?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": ["firestore", "document_chunks"],
        "forbidden_claims": ["dynamodb stores rag chunks"],
    },
    {
        "id": "firestore_memory",
        "question": "How is conversation memory stored?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": ["firestore", "conversations", "session_id"],
        "forbidden_claims": ["browser memory only"],
    },
    {
        "id": "streaming_endpoint",
        "question": "How does the backend stream RAG answers?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": ["ask-rag-stream", "metadata", "token", "done"],
        "forbidden_claims": ["websocket"],
    },
    {
        "id": "citation_validation",
        "question": "How does citation validation protect answers?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": ["citation", "source", "no-answer"],
        "forbidden_claims": ["allows uncited factual answers"],
    },
    {
        "id": "ingestion_security",
        "question": "How is document ingestion protected?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": ["ingest-docs", "x-admin-token", "ingestion_admin_token"],
        "forbidden_claims": ["public ingestion"],
    },
    {
        "id": "idempotent_ingestion",
        "question": "What makes ingestion rerunnable?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": ["deterministic", "chunk", "pruned"],
        "forbidden_claims": ["random duplicate chunks are expected"],
    },
    {
        "id": "metadata_filtering",
        "question": "What metadata filtering does the backend support?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": ["metadata", "filter", "file", "heading"],
        "forbidden_claims": ["metadata filtering is not implemented"],
    },
    {
        "id": "multi_query_status",
        "question": "What is the current multi-query retrieval status?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": ["multi-query", "optional", "dedupe"],
        "forbidden_claims": ["always enabled in production"],
    },
    {
        "id": "query_rewrite_status",
        "question": "How does query rewriting work in this backend?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": ["query", "rewrite", "retrieval"],
        "forbidden_claims": ["changes the saved user message"],
    },
    {
        "id": "rag_analytics",
        "question": "What RAG analytics are collected?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": ["analytics", "latency", "source", "no-answer"],
        "forbidden_claims": ["stores prompt text"],
    },
    {
        "id": "analytics_summary_endpoint",
        "question": "How is the RAG analytics summary endpoint protected?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": ["rag-analytics", "summary", "admin"],
        "forbidden_claims": ["public analytics endpoint"],
    },
    {
        "id": "current_limitations_vector",
        "question": "What is the biggest current retrieval scalability limitation?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": ["firestore", "scan", "vector"],
        "forbidden_claims": ["managed vector search is complete"],
    },
    {
        "id": "not_production_advanced",
        "question": "Is the current RAG backend production-grade Advanced RAG?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": ["intermediate", "not", "production"],
        "forbidden_claims": ["fully production-grade advanced rag"],
    },
    {
        "id": "visitor_counter",
        "question": "How does the AWS visitor counter path work?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": ["lambda", "api gateway", "dynamodb"],
        "forbidden_claims": ["cloud run serves the visitor counter"],
    },
    {
        "id": "hybrid_search_status",
        "question": "What is the current hybrid search status?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": ["optional", "hybrid", "keyword", "vector"],
        "forbidden_claims": ["bm25 is implemented"],
    },
    {
        "id": "reranking_status",
        "question": "What reranking does the backend currently have?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": ["optional", "reranking", "keyword"],
        "forbidden_claims": ["semantic reranker is complete"],
    },
    {
        "id": "safe_no_answer",
        "question": "What happens when retrieval has no useful context?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": ["do not know", "indexed", "documents"],
        "forbidden_claims": ["guesses without context"],
    },
    {
        "id": "backend_modularity",
        "question": "How is the backend code organized now?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": ["config", "services", "routes"],
        "forbidden_claims": ["all logic is still in main.py"],
    },
    {
        "id": "health_checks",
        "question": "What health endpoints does the backend expose?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": ["health", "healthz"],
        "forbidden_claims": ["no health checks"],
    },
    {
        "id": "structured_logging",
        "question": "What logging improvements exist for Cloud Run?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": ["structured", "logging", "request"],
        "forbidden_claims": ["no request logging"],
    },
    {
        "id": "gcs_ingestion_source",
        "question": "Where do source documents come from for ingestion?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": ["gcs", "cloud storage", "markdown"],
        "forbidden_claims": ["uploaded directly by public users"],
    },
    {
        "id": "phase_one_remaining",
        "question": "What remains before production-grade Advanced RAG?",
        "expected_source_files": ["CAPSTONE_PROJECT_STATE.md"],
        "required_keywords": ["managed vector", "semantic reranker", "evaluation"],
        "forbidden_claims": ["graphrag is complete"],
    },
]


def normalize_text(value):
    return re.sub(r"\s+", " ", value.lower()).strip()


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


def contains_all_keywords(answer, keywords):
    normalized_answer = normalize_text(answer)
    missing = [
        keyword
        for keyword in keywords
        if normalize_text(keyword) not in normalized_answer
    ]
    return len(missing) == 0, missing


def contains_no_forbidden_claims(answer, forbidden_claims):
    normalized_answer = normalize_text(answer)
    found = [
        claim
        for claim in forbidden_claims
        if normalize_text(claim) in normalized_answer
    ]
    return len(found) == 0, found


def sources_match(response_sources, expected_source_files):
    source_files = {
        source.get("file_name")
        for source in response_sources
        if source.get("file_name")
    }
    missing = [
        file_name
        for file_name in expected_source_files
        if file_name not in source_files
    ]
    return len(missing) == 0, sorted(source_files), missing


def is_grounded(answer, sources):
    has_sources = len(sources) > 0
    source_ids = [
        source.get("source_id")
        for source in sources
        if source.get("source_id")
    ]
    cited_source_ids = [
        source_id
        for source_id in source_ids
        if f"[{source_id}]" in answer
    ]
    return has_sources and len(cited_source_ids) > 0, cited_source_ids


def evaluate_case(base_url, case, timeout):
    try:
        response, status_code, duration_ms = call_ask_rag(
            base_url,
            case["question"],
            timeout,
        )
    except HTTPError as error:
        return {
            "id": case["id"],
            "question": case["question"],
            "error": f"HTTP {error.code}: {error.reason}",
            "overall_pass": False,
        }
    except URLError as error:
        return {
            "id": case["id"],
            "question": case["question"],
            "error": f"Connection error: {error.reason}",
            "overall_pass": False,
        }
    except TimeoutError:
        return {
            "id": case["id"],
            "question": case["question"],
            "error": "Request timed out",
            "overall_pass": False,
        }

    answer = response.get("answer", "")
    sources = response.get("sources", [])

    source_match, source_files, missing_sources = sources_match(
        sources,
        case["expected_source_files"],
    )
    keywords_present, missing_keywords = contains_all_keywords(
        answer,
        case["required_keywords"],
    )
    forbidden_absent, found_forbidden = contains_no_forbidden_claims(
        answer,
        case["forbidden_claims"],
    )
    grounded, cited_source_ids = is_grounded(answer, sources)

    checks = {
        "retrieval_source_match": source_match,
        "required_keywords_present": keywords_present,
        "forbidden_claims_absent": forbidden_absent,
        "grounded_answer": grounded,
    }

    return {
        "id": case["id"],
        "question": case["question"],
        "status_code": status_code,
        "duration_ms": duration_ms,
        "answer": answer,
        "sources": sources,
        "source_files": source_files,
        "missing_sources": missing_sources,
        "missing_keywords": missing_keywords,
        "found_forbidden_claims": found_forbidden,
        "cited_source_ids": cited_source_ids,
        **checks,
        "overall_pass": all(checks.values()),
    }


def build_markdown_report(report):
    lines = [
        "# RAG Evaluation Report",
        "",
        f"- Generated at: `{report['generated_at']}`",
        f"- Base URL: `{report['base_url']}`",
        f"- Total cases: `{report['summary']['total_cases']}`",
        f"- Passed cases: `{report['summary']['passed_cases']}`",
        f"- Accuracy: `{report['summary']['accuracy_percent']}%`",
        "",
        "## Results",
        "",
    ]

    for result in report["results"]:
        status = "PASS" if result.get("overall_pass") else "FAIL"
        lines.extend(
            [
                f"### {result['id']} — {status}",
                "",
                f"- Question: {result['question']}",
                f"- retrieval_source_match: `{result.get('retrieval_source_match', False)}`",
                f"- required_keywords_present: `{result.get('required_keywords_present', False)}`",
                f"- forbidden_claims_absent: `{result.get('forbidden_claims_absent', False)}`",
                f"- grounded_answer: `{result.get('grounded_answer', False)}`",
                f"- overall_pass: `{result.get('overall_pass', False)}`",
            ]
        )

        if result.get("error"):
            lines.append(f"- Error: `{result['error']}`")
        else:
            lines.extend(
                [
                    f"- Source files: `{', '.join(result.get('source_files', []))}`",
                    f"- Cited source IDs: `{', '.join(result.get('cited_source_ids', []))}`",
                    f"- Missing keywords: `{', '.join(result.get('missing_keywords', []))}`",
                    f"- Found forbidden claims: `{', '.join(result.get('found_forbidden_claims', []))}`",
                    "",
                    "Answer:",
                    "",
                    result.get("answer", ""),
                ]
            )

        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def save_report(report, output_path):
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    if path.suffix.lower() == ".md":
        path.write_text(build_markdown_report(report), encoding="utf-8")
        return

    path.write_text(json.dumps(report, indent=2), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Evaluate the RAG /ask-rag endpoint.")
    parser.add_argument(
        "--base-url",
        default=DEFAULT_BASE_URL,
        help="Base URL for the backend, for example http://localhost:8080.",
    )
    parser.add_argument(
        "--output",
        default=DEFAULT_REPORT_PATH,
        help="Report output path. Use .json or .md.",
    )
    parser.add_argument(
        "--timeout",
        default=30,
        type=int,
        help="HTTP request timeout in seconds.",
    )
    args = parser.parse_args()

    eval_cases = EVAL_DATASET + EXTRA_EVAL_CASES
    results = [
        evaluate_case(args.base_url, case, args.timeout)
        for case in eval_cases
    ]
    passed_cases = sum(1 for result in results if result.get("overall_pass"))
    total_cases = len(eval_cases)
    accuracy_percent = round((passed_cases / total_cases) * 100, 2)

    report = {
        "generated_at": datetime.now(UTC).isoformat(),
        "base_url": args.base_url,
        "summary": {
            "total_cases": total_cases,
            "passed_cases": passed_cases,
            "accuracy_percent": accuracy_percent,
        },
        "results": results,
    }

    save_report(report, args.output)

    for result in results:
        status = "PASS" if result.get("overall_pass") else "FAIL"
        print(f"{status} {result['id']}")

    print(f"Accuracy: {accuracy_percent}% ({passed_cases}/{total_cases})")
    print(f"Report saved to: {args.output}")

    if passed_cases != total_cases:
        sys.exit(1)


if __name__ == "__main__":
    main()

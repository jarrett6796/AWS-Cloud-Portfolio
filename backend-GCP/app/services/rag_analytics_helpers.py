import re


def build_rag_analytics_payload(
    question: str,
    answer: str,
    session_id: str,
    rag_context: dict,
    request_id: str | None,
    response_mode: str,
    duration_ms: float,
    no_answer_text: str,
    retrieval_backend_default: str,
    multi_query_enabled: bool,
    semantic_rerank_enabled: bool,
    parent_child_enabled: bool,
) -> dict:
    top_chunks = rag_context["top_chunks"]
    sources = rag_context["sources"]
    retrieval_queries = rag_context.get("retrieval_queries", [])
    metadata_filter = rag_context.get("metadata_filter", {})
    query_rewrite = rag_context["query_rewrite"]
    retrieval_backend = rag_context.get(
        "retrieval_backend",
        retrieval_backend_default,
    )

    source_file_names = sorted(
        {
            source["file_name"]
            for source in sources
            if source.get("file_name")
        }
    )
    max_score = max(
        (source.get("score") or 0 for source in sources),
        default=0,
    )

    return {
        "session_id": session_id,
        "request_id": request_id,
        "response_mode": response_mode,
        "question_length": len(question or ""),
        "answer_length": len(answer or ""),
        "duration_ms": duration_ms,
        "source_count": len(sources),
        "source_file_names": source_file_names,
        "max_score": max_score,
        "no_answer": is_no_answer(answer, no_answer_text),
        "citation_validation_blocked_answer": (
            bool(top_chunks) and answer == no_answer_text
        ),
        "retrieval_query_length": len(query_rewrite.retrieval_query or ""),
        "query_rewritten": query_rewrite.query_rewritten,
        "multi_query_enabled": multi_query_enabled,
        "retrieval_query_count": len(retrieval_queries),
        "metadata_filter_enabled": bool(metadata_filter),
        "metadata_filter_keys": sorted(metadata_filter.keys()),
        "retrieval_backend": retrieval_backend,
        "semantic_rerank_enabled": semantic_rerank_enabled,
        "semantic_rerank_applied": any(
            chunk.get("semantic_rerank_applied") for chunk in top_chunks
        ),
        "parent_child_enabled": parent_child_enabled,
        "parent_context_expanded_count": sum(
            1 for chunk in top_chunks if chunk.get("parent_context_expanded")
        ),
    }


def build_analytics_summary(
    analytics_records: list[dict],
    limit: int,
    retrieval_backend_default: str,
) -> dict:
    total_requests = len(analytics_records)
    total_latency = sum(
        coerce_float(record.get("duration_ms"))
        for record in analytics_records
    )
    total_sources = sum(
        coerce_int(record.get("source_count"))
        for record in analytics_records
    )
    no_answer_count = sum(
        1 for record in analytics_records if record.get("no_answer")
    )
    citation_block_count = sum(
        1
        for record in analytics_records
        if record.get("citation_validation_blocked_answer")
    )
    query_rewrite_count = sum(
        1 for record in analytics_records if record.get("query_rewritten")
    )
    multi_query_count = sum(
        1
        for record in analytics_records
        if coerce_int(record.get("retrieval_query_count")) > 1
    )
    metadata_filter_count = sum(
        1
        for record in analytics_records
        if record.get("metadata_filter_enabled")
    )
    retrieval_backend_counts = summarize_retrieval_backends(
        analytics_records,
        retrieval_backend_default,
    )
    streaming_count = sum(
        1
        for record in analytics_records
        if record.get("response_mode") == "stream"
    )
    source_usage = summarize_source_usage(analytics_records)

    return {
        "limit": limit,
        "record_count": total_requests,
        "average_duration_ms": safe_average(
            total_latency,
            total_requests,
        ),
        "average_source_count": safe_average(
            total_sources,
            total_requests,
        ),
        "no_answer_count": no_answer_count,
        "no_answer_rate": safe_rate(no_answer_count, total_requests),
        "citation_validation_block_count": citation_block_count,
        "citation_validation_block_rate": safe_rate(
            citation_block_count,
            total_requests,
        ),
        "query_rewrite_count": query_rewrite_count,
        "query_rewrite_rate": safe_rate(query_rewrite_count, total_requests),
        "multi_query_count": multi_query_count,
        "multi_query_rate": safe_rate(multi_query_count, total_requests),
        "metadata_filter_count": metadata_filter_count,
        "metadata_filter_rate": safe_rate(
            metadata_filter_count,
            total_requests,
        ),
        "retrieval_backend_counts": retrieval_backend_counts,
        "streaming_count": streaming_count,
        "streaming_rate": safe_rate(streaming_count, total_requests),
        "top_source_file_names": source_usage,
    }


def summarize_source_usage(analytics_records: list[dict]) -> list[dict]:
    source_counts = {}

    for record in analytics_records:
        for file_name in record.get("source_file_names") or []:
            if not file_name:
                continue

            source_counts[file_name] = source_counts.get(file_name, 0) + 1

    return [
        {
            "file_name": file_name,
            "count": count,
        }
        for file_name, count in sorted(
            source_counts.items(),
            key=lambda item: (-item[1], item[0]),
        )[:10]
    ]


def summarize_retrieval_backends(
    analytics_records: list[dict],
    retrieval_backend_default: str,
) -> dict:
    backend_counts = {}

    for record in analytics_records:
        backend = record.get("retrieval_backend") or retrieval_backend_default
        backend_counts[backend] = backend_counts.get(backend, 0) + 1

    return dict(sorted(backend_counts.items()))


def is_no_answer(answer: str, no_answer_text: str) -> bool:
    return normalize_answer_text(answer) == normalize_answer_text(no_answer_text)


def normalize_answer_text(answer: str) -> str:
    return re.sub(r"\s+", " ", answer or "").strip().lower()


def safe_average(total: float, count: int) -> float:
    if count <= 0:
        return 0

    return round(total / count, 2)


def safe_rate(count: int, total: int) -> float:
    if total <= 0:
        return 0

    return round(count / total, 4)


def coerce_float(value) -> float:
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0


def coerce_int(value) -> int:
    try:
        return int(value or 0)
    except (TypeError, ValueError):
        return 0

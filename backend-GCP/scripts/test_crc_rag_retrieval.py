import json
import sys
import uuid
from pathlib import Path


BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.services.rag_service import rag_service
from scripts.crc_rag_docs import CRC_RAG_QUESTIONS


def preview(text: str | None, limit: int = 220) -> str:
    compact = " ".join((text or "").split())
    if len(compact) <= limit:
        return compact

    return f"{compact[:limit].rstrip()}..."


def build_result(question_case: dict) -> dict:
    session_id = f"crc-rag-retrieval-{uuid.uuid4()}"
    context = rag_service._prepare_rag_context(
        question_case["question"],
        history=[],
        session_id=session_id,
        metadata_filter={"source_uri": "knowledge-base/crc-rag/"},
    )
    results = []

    for chunk in context["top_chunks"]:
        results.append(
            {
                "source_uri": chunk.get("source_uri"),
                "file_name": chunk.get("file_name"),
                "heading": chunk.get("heading"),
                "score": chunk.get("score"),
                "vector_score": chunk.get("vector_score"),
                "vector_distance": chunk.get("vector_distance"),
                "keyword_score": chunk.get("keyword_score"),
                "chunk_preview": preview(
                    chunk.get("child_chunk_text") or chunk.get("chunk_text")
                ),
            }
        )

    return {
        "question": question_case["question"],
        "retrieval_backend": context["retrieval_backend"],
        "retrieval_query": context["query_rewrite"].retrieval_query,
        "top_k_results": results,
    }


def main() -> None:
    output = [build_result(question_case) for question_case in CRC_RAG_QUESTIONS]
    print(json.dumps(output, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

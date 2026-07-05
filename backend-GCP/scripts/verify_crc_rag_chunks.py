import json
import sys
from pathlib import Path


BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.config.settings import settings
from app.services.firestore_service import firestore_service
from scripts.crc_rag_docs import CRC_RAG_FILES


def summarize_file(file_name: str) -> dict:
    docs = (
        firestore_service.client.collection(settings.firestore_chunks_collection)
        .where("file_name", "==", file_name)
        .stream()
    )
    count = 0
    sample = None

    for doc in docs:
        count += 1
        if sample is None:
            sample = doc.to_dict()

    sample = sample or {}
    return {
        "file_name": file_name,
        "chunk_count": count,
        "sample_heading": sample.get("heading"),
        "sample_source_uri": sample.get("source_uri"),
        "sample_project": sample.get("project"),
        "sample_doc_type": sample.get("doc_type"),
    }


def main() -> None:
    records = [summarize_file(file_name) for file_name in CRC_RAG_FILES]
    output = {
        "collection": settings.firestore_chunks_collection,
        "files": records,
        "total_crc_rag_chunks": sum(record["chunk_count"] for record in records),
    }
    print(json.dumps(output, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

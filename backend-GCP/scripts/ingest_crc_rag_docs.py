import json
import sys
from pathlib import Path


BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.config.settings import settings
from app.services.ingestion_service import ingestion_service
from scripts.crc_rag_docs import CRC_RAG_FILES


def main() -> None:
    result = ingestion_service.ingest_documents(CRC_RAG_FILES)
    output = {
        "bucket": settings.docs_bucket,
        "files": list(CRC_RAG_FILES),
        **result,
    }
    print(json.dumps(output, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

import os
from dataclasses import dataclass


def _split_csv(value: str) -> tuple[str, ...]:
    return tuple(item.strip() for item in value.split(",") if item.strip())


@dataclass(frozen=True)
class Settings:
    project_id: str | None = os.getenv("GOOGLE_CLOUD_PROJECT")
    location: str = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
    docs_bucket: str = os.getenv("DOCS_BUCKET", "cloud-resume-ai-rag-docs")
    cors_allowed_origins: tuple[str, ...] = _split_csv(
        os.getenv(
            "CORS_ALLOWED_ORIGINS",
            "http://localhost:5173,http://localhost:5174",
        )
    )
    direct_context_documents: tuple[str, ...] = _split_csv(
        os.getenv(
            "DIRECT_CONTEXT_DOCUMENTS",
            "PROJECT_STATE.md,Frontend_Development_Log.md",
        )
    )
    ingest_documents: tuple[str, ...] = _split_csv(
        os.getenv(
            "INGEST_DOCUMENTS",
            "PROJECT_STATE.md,Frontend_Development_Log.md",
        )
    )
    generation_model: str = "gemini-2.5-flash"
    embedding_model: str = "text-embedding-005"
    firestore_chunks_collection: str = "document_chunks"
    rag_top_k: int = int(os.getenv("RAG_TOP_K", "5"))
    rag_candidate_pool_size: int = int(os.getenv("RAG_CANDIDATE_POOL_SIZE", "20"))
    rag_score_threshold: float = float(os.getenv("RAG_SCORE_THRESHOLD", "0.2"))
    default_chunk_size: int = int(os.getenv("DEFAULT_CHUNK_SIZE", "500"))
    log_level: str = os.getenv("LOG_LEVEL", "INFO")


settings = Settings()

import os
from dataclasses import dataclass


def _split_csv(value: str) -> tuple[str, ...]:
    return tuple(item.strip() for item in value.split(",") if item.strip())


def _env_bool(name: str, default: str = "false") -> bool:
    return os.getenv(name, default).strip().lower() in {"1", "true", "yes", "on"}


DEFAULT_CORS_ALLOWED_ORIGINS = (
    "http://localhost:5173",
    "http://localhost:5174",
    "https://dvzu3s2gq6iw.cloudfront.net",
)


@dataclass(frozen=True)
class Settings:
    service_name: str = os.getenv("SERVICE_NAME", "gcp-rag-backend")
    app_version: str = os.getenv("APP_VERSION", "local")
    environment: str = os.getenv("ENVIRONMENT", "development")
    project_id: str | None = os.getenv("GOOGLE_CLOUD_PROJECT")
    location: str = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
    docs_bucket: str = os.getenv("DOCS_BUCKET", "cloud-resume-ai-rag-docs")
    cors_allowed_origins: tuple[str, ...] = _split_csv(
        os.getenv(
            "CORS_ALLOWED_ORIGINS",
            ",".join(DEFAULT_CORS_ALLOWED_ORIGINS),
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
    firestore_conversations_collection: str = "conversations"
    ingestion_admin_token: str | None = os.getenv("INGESTION_ADMIN_TOKEN")
    rag_top_k: int = int(os.getenv("RAG_TOP_K", "5"))
    rag_candidate_pool_size: int = int(os.getenv("RAG_CANDIDATE_POOL_SIZE", "20"))
    rag_score_threshold: float = float(os.getenv("RAG_SCORE_THRESHOLD", "0.2"))
    rag_hybrid_enabled: bool = _env_bool("RAG_HYBRID_ENABLED")
    rag_vector_score_weight: float = float(os.getenv("RAG_VECTOR_SCORE_WEIGHT", "0.8"))
    rag_rerank_enabled: bool = _env_bool("RAG_RERANK_ENABLED")
    rag_rerank_keyword_weight: float = float(
        os.getenv("RAG_RERANK_KEYWORD_WEIGHT", "0.1")
    )
    rag_query_rewrite_enabled: bool = _env_bool("RAG_QUERY_REWRITE_ENABLED")
    rag_query_rewrite_history_limit: int = int(
        os.getenv("RAG_QUERY_REWRITE_HISTORY_LIMIT", "6")
    )
    rag_query_rewrite_model: str = os.getenv(
        "RAG_QUERY_REWRITE_MODEL",
        "gemini-2.5-flash",
    )
    default_chunk_size: int = int(os.getenv("DEFAULT_CHUNK_SIZE", "500"))
    log_level: str = os.getenv("LOG_LEVEL", "INFO")

    def public_summary(self) -> dict:
        return {
            "service": self.service_name,
            "version": self.app_version,
            "environment": self.environment,
            "project_configured": bool(self.project_id),
            "location": self.location,
            "docs_bucket": self.docs_bucket,
            "generation_model": self.generation_model,
            "embedding_model": self.embedding_model,
            "firestore_chunks_collection": self.firestore_chunks_collection,
            "firestore_conversations_collection": (
                self.firestore_conversations_collection
            ),
            "ingestion_admin_token_configured": bool(self.ingestion_admin_token),
            "rag_top_k": self.rag_top_k,
            "rag_candidate_pool_size": self.rag_candidate_pool_size,
            "rag_score_threshold": self.rag_score_threshold,
            "rag_hybrid_enabled": self.rag_hybrid_enabled,
            "rag_rerank_enabled": self.rag_rerank_enabled,
            "query_rewrite_enabled": self.rag_query_rewrite_enabled,
            "query_rewrite_history_limit": self.rag_query_rewrite_history_limit,
            "query_rewrite_model": self.rag_query_rewrite_model,
            "direct_context_documents": list(self.direct_context_documents),
            "ingest_documents": list(self.ingest_documents),
        }

    def startup_warnings(self) -> list[str]:
        warnings = []

        if not self.project_id:
            warnings.append("GOOGLE_CLOUD_PROJECT is not set.")

        if not self.docs_bucket:
            warnings.append("DOCS_BUCKET is empty.")

        if not self.ingestion_admin_token:
            warnings.append("INGESTION_ADMIN_TOKEN is not set; /ingest-docs is blocked.")

        if self.rag_candidate_pool_size < self.rag_top_k:
            warnings.append("RAG_CANDIDATE_POOL_SIZE is smaller than RAG_TOP_K.")

        if not 0 <= self.rag_score_threshold <= 1:
            warnings.append("RAG_SCORE_THRESHOLD should be between 0 and 1.")

        if not 0 <= self.rag_vector_score_weight <= 1:
            warnings.append("RAG_VECTOR_SCORE_WEIGHT should be between 0 and 1.")

        if not 0 <= self.rag_rerank_keyword_weight <= 1:
            warnings.append("RAG_RERANK_KEYWORD_WEIGHT should be between 0 and 1.")

        if self.rag_query_rewrite_history_limit < 1:
            warnings.append("RAG_QUERY_REWRITE_HISTORY_LIMIT should be at least 1.")

        return warnings


settings = Settings()

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    project_id: str | None = os.getenv("GOOGLE_CLOUD_PROJECT")
    location: str = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
    docs_bucket: str = os.getenv("DOCS_BUCKET", "cloud-resume-ai-rag-docs")
    cors_allowed_origins: tuple[str, ...] = (
        "http://localhost:5173",
        "http://localhost:5174",
    )
    generation_model: str = "gemini-2.5-flash"
    embedding_model: str = "text-embedding-005"
    firestore_chunks_collection: str = "document_chunks"


settings = Settings()

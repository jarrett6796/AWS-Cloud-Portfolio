import logging

from google.cloud import firestore

from app.config.settings import settings
from app.errors import DatabaseServiceError


logger = logging.getLogger(__name__)


class FirestoreService:
    def __init__(self):
        self.client = firestore.Client(project=settings.project_id)

    def add_document_chunk(
        self,
        file_name: str,
        chunk_index: int,
        chunk_text: str,
        embedding: list[float],
    ) -> None:
        logger.info(
            "firestore_chunk_write_started",
            extra={
                "collection": settings.firestore_chunks_collection,
                "file_name": file_name,
                "chunk_index": chunk_index,
                "chunk_length": len(chunk_text),
                "embedding_dimensions": len(embedding),
            },
        )

        try:
            self.client.collection(settings.firestore_chunks_collection).add(
                {
                    "file_name": file_name,
                    "chunk_index": chunk_index,
                    "chunk_text": chunk_text,
                    "embedding": embedding,
                }
            )
        except Exception as error:
            logger.error(
                "firestore_chunk_write_failed",
                extra={
                    "collection": settings.firestore_chunks_collection,
                    "file_name": file_name,
                    "chunk_index": chunk_index,
                },
            )
            raise DatabaseServiceError(error) from error

        logger.info(
            "firestore_chunk_write_completed",
            extra={
                "collection": settings.firestore_chunks_collection,
                "file_name": file_name,
                "chunk_index": chunk_index,
            },
        )

    def stream_document_chunks(self):
        count = 0
        logger.info(
            "firestore_chunk_stream_started",
            extra={"collection": settings.firestore_chunks_collection},
        )

        try:
            for doc in self.client.collection(
                settings.firestore_chunks_collection
            ).stream():
                count += 1
                yield doc.to_dict()
        except Exception as error:
            logger.error(
                "firestore_chunk_stream_failed",
                extra={
                    "collection": settings.firestore_chunks_collection,
                    "documents_streamed": count,
                },
            )
            raise DatabaseServiceError(error) from error

        logger.info(
            "firestore_chunk_stream_completed",
            extra={
                "collection": settings.firestore_chunks_collection,
                "documents_streamed": count,
            },
        )


firestore_service = FirestoreService()

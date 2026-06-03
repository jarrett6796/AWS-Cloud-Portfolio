import logging
from hashlib import sha256

from google.cloud import firestore

from app.config.settings import settings
from app.errors import DatabaseServiceError


logger = logging.getLogger(__name__)


class FirestoreService:
    def __init__(self):
        self.client = firestore.Client(project=settings.project_id)

    def build_chunk_document_id(self, file_name: str, chunk_index: int) -> str:
        key = f"{file_name}:{chunk_index}".encode("utf-8")
        return sha256(key).hexdigest()

    def add_document_chunk(
        self,
        file_name: str,
        chunk_index: int,
        chunk_text: str,
        embedding: list[float],
    ) -> str:
        document_id = self.build_chunk_document_id(file_name, chunk_index)
        logger.info(
            "firestore_chunk_write_started",
            extra={
                "collection": settings.firestore_chunks_collection,
                "document_id": document_id,
                "file_name": file_name,
                "chunk_index": chunk_index,
                "chunk_length": len(chunk_text),
                "embedding_dimensions": len(embedding),
            },
        )

        try:
            self.client.collection(settings.firestore_chunks_collection).document(
                document_id
            ).set(
                {
                    "file_name": file_name,
                    "chunk_index": chunk_index,
                    "chunk_text": chunk_text,
                    "embedding": embedding,
                    "ingestion_key": document_id,
                    "updated_at": firestore.SERVER_TIMESTAMP,
                }
            )
        except Exception as error:
            logger.error(
                "firestore_chunk_write_failed",
                extra={
                    "collection": settings.firestore_chunks_collection,
                    "document_id": document_id,
                    "file_name": file_name,
                    "chunk_index": chunk_index,
                },
            )
            raise DatabaseServiceError(error) from error

        logger.info(
            "firestore_chunk_write_completed",
            extra={
                "collection": settings.firestore_chunks_collection,
                "document_id": document_id,
                "file_name": file_name,
                "chunk_index": chunk_index,
            },
        )
        return document_id

    def prune_document_chunks(
        self,
        file_name: str,
        expected_document_ids: set[str],
    ) -> int:
        pruned_count = 0
        logger.info(
            "firestore_chunk_prune_started",
            extra={
                "collection": settings.firestore_chunks_collection,
                "file_name": file_name,
                "expected_document_count": len(expected_document_ids),
            },
        )

        try:
            docs = self.client.collection(
                settings.firestore_chunks_collection
            ).where("file_name", "==", file_name).stream()

            for doc in docs:
                if doc.id in expected_document_ids:
                    continue

                doc.reference.delete()
                pruned_count += 1
        except Exception as error:
            logger.error(
                "firestore_chunk_prune_failed",
                extra={
                    "collection": settings.firestore_chunks_collection,
                    "file_name": file_name,
                    "pruned_count": pruned_count,
                },
            )
            raise DatabaseServiceError(error) from error

        logger.info(
            "firestore_chunk_prune_completed",
            extra={
                "collection": settings.firestore_chunks_collection,
                "file_name": file_name,
                "pruned_count": pruned_count,
            },
        )
        return pruned_count

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

import logging

from app.config.settings import settings
from app.errors import BackendServiceError, IngestionServiceError
from app.services.firestore_service import firestore_service
from app.services.gcs_service import gcs_service
from app.services.gemini_service import gemini_service
from app.services.vector_service import vector_service


logger = logging.getLogger(__name__)


class IngestionService:
    def ingest_documents(self, files: tuple[str, ...] = settings.ingest_documents):
        try:
            return self._ingest_documents(files)
        except BackendServiceError:
            raise
        except Exception as error:
            raise IngestionServiceError(error) from error

    def _ingest_documents(self, files: tuple[str, ...]):
        total_chunks = 0
        total_pruned = 0
        logger.info(
            "ingestion_started",
            extra={"files": list(files), "file_count": len(files)},
        )

        for file_name in files:
            text = gcs_service.read_text_file(file_name)
            chunks = vector_service.chunk_text(text)
            logger.info(
                "ingestion_file_chunked",
                extra={"file_name": file_name, "chunk_count": len(chunks)},
            )
            expected_document_ids = set()

            for index, chunk in enumerate(chunks):
                metadata = vector_service.build_chunk_metadata(chunk)
                embedding = gemini_service.embed_text(chunk)

                document_id = firestore_service.add_document_chunk(
                    file_name=file_name,
                    chunk_index=index,
                    chunk_text=chunk,
                    embedding=embedding,
                    metadata=metadata,
                )

                expected_document_ids.add(document_id)
                total_chunks += 1

            pruned_count = firestore_service.prune_document_chunks(
                file_name=file_name,
                expected_document_ids=expected_document_ids,
            )
            total_pruned += pruned_count
            logger.info(
                "ingestion_file_completed",
                extra={
                    "file_name": file_name,
                    "chunks_upserted": len(expected_document_ids),
                    "chunks_pruned": pruned_count,
                },
            )

        logger.info(
            "ingestion_completed",
            extra={
                "files": list(files),
                "chunks_created": total_chunks,
                "chunks_pruned": total_pruned,
            },
        )

        return {
            "status": "success",
            "chunks_created": total_chunks,
            "chunks_pruned": total_pruned,
        }


ingestion_service = IngestionService()

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

            for index, chunk in enumerate(chunks):
                embedding = gemini_service.embed_text(chunk)

                firestore_service.add_document_chunk(
                    file_name=file_name,
                    chunk_index=index,
                    chunk_text=chunk,
                    embedding=embedding,
                )

                total_chunks += 1

        logger.info(
            "ingestion_completed",
            extra={"files": list(files), "chunks_created": total_chunks},
        )

        return {
            "status": "success",
            "chunks_created": total_chunks,
        }


ingestion_service = IngestionService()

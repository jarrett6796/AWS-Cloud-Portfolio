from app.config.settings import settings
from app.services.firestore_service import firestore_service
from app.services.gcs_service import gcs_service
from app.services.gemini_service import gemini_service
from app.services.vector_service import vector_service


class IngestionService:
    def ingest_documents(self, files: tuple[str, ...] = settings.ingest_documents):
        total_chunks = 0

        for file_name in files:
            text = gcs_service.read_text_file(file_name)
            chunks = vector_service.chunk_text(text)

            for index, chunk in enumerate(chunks):
                embedding = gemini_service.embed_text(chunk)

                firestore_service.add_document_chunk(
                    file_name=file_name,
                    chunk_index=index,
                    chunk_text=chunk,
                    embedding=embedding,
                )

                total_chunks += 1

        return {
            "status": "success",
            "chunks_created": total_chunks,
        }


ingestion_service = IngestionService()

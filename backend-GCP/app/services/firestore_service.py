from google.cloud import firestore

from app.config.settings import settings
from app.errors import DatabaseServiceError


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
            raise DatabaseServiceError(error) from error

    def stream_document_chunks(self):
        try:
            for doc in self.client.collection(
                settings.firestore_chunks_collection
            ).stream():
                yield doc.to_dict()
        except Exception as error:
            raise DatabaseServiceError(error) from error


firestore_service = FirestoreService()

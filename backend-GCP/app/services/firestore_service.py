from google.cloud import firestore

from app.config.settings import settings


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
        self.client.collection(settings.firestore_chunks_collection).add(
            {
                "file_name": file_name,
                "chunk_index": chunk_index,
                "chunk_text": chunk_text,
                "embedding": embedding,
            }
        )

    def stream_document_chunks(self):
        return self.client.collection(settings.firestore_chunks_collection).stream()


firestore_service = FirestoreService()

from google.cloud import storage

from app.config.settings import settings


class GcsService:
    def __init__(self):
        self.client = storage.Client(project=settings.project_id)

    def read_text_file(self, file_name: str) -> str:
        bucket = self.client.bucket(settings.docs_bucket)
        blob = bucket.blob(file_name)
        return blob.download_as_text()


gcs_service = GcsService()

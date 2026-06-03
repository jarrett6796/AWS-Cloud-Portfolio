import logging

from google.cloud import storage

from app.config.settings import settings
from app.errors import StorageServiceError


logger = logging.getLogger(__name__)


class GcsService:
    def __init__(self):
        self.client = storage.Client(project=settings.project_id)

    def read_text_file(self, file_name: str) -> str:
        logger.info(
            "gcs_read_started",
            extra={"bucket": settings.docs_bucket, "file_name": file_name},
        )

        try:
            bucket = self.client.bucket(settings.docs_bucket)
            blob = bucket.blob(file_name)
            text = blob.download_as_text()
        except Exception as error:
            logger.error(
                "gcs_read_failed",
                extra={"bucket": settings.docs_bucket, "file_name": file_name},
            )
            raise StorageServiceError(error) from error

        logger.info(
            "gcs_read_completed",
            extra={
                "bucket": settings.docs_bucket,
                "file_name": file_name,
                "content_length": len(text),
            },
        )
        return text


gcs_service = GcsService()

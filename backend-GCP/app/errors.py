import logging

from fastapi import Request
from fastapi.responses import JSONResponse


logger = logging.getLogger(__name__)


class BackendServiceError(Exception):
    error_code = "backend_error"
    public_message = "Backend service request failed."
    status_code = 500

    def __init__(self, original_error: Exception | None = None):
        self.original_error = original_error
        super().__init__(self.public_message)


class ProviderServiceError(BackendServiceError):
    error_code = "provider_error"
    public_message = "AI provider request failed."
    status_code = 502


class StorageServiceError(BackendServiceError):
    error_code = "storage_error"
    public_message = "Document storage request failed."
    status_code = 503


class DatabaseServiceError(BackendServiceError):
    error_code = "database_error"
    public_message = "Database request failed."
    status_code = 503


class RagServiceError(BackendServiceError):
    error_code = "rag_error"
    public_message = "RAG request failed."
    status_code = 500


class IngestionServiceError(BackendServiceError):
    error_code = "ingestion_error"
    public_message = "Document ingestion request failed."
    status_code = 500


async def backend_service_error_handler(
    request: Request,
    exc: BackendServiceError,
) -> JSONResponse:
    request_id = getattr(request.state, "request_id", None)
    log_context = {
        "error_code": exc.error_code,
        "status_code": exc.status_code,
        "method": request.method,
        "path": request.url.path,
        "request_id": request_id,
    }

    if exc.original_error is not None:
        logger.error(
            "backend_service_error",
            extra=log_context,
            exc_info=(
                type(exc.original_error),
                exc.original_error,
                exc.original_error.__traceback__,
            ),
        )
    else:
        logger.error("backend_service_error", extra=log_context)

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.error_code,
            "message": exc.public_message,
            "request_id": request_id,
        },
        headers={"X-Request-ID": request_id} if request_id else None,
    )

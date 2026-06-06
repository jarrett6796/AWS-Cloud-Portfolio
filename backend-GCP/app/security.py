import hmac

from app.config.settings import settings
from app.errors import AdminAuthError


def require_ingestion_admin_token(provided_token: str | None) -> None:
    configured_token = settings.ingestion_admin_token

    if not configured_token or not provided_token:
        raise AdminAuthError()

    if not hmac.compare_digest(provided_token, configured_token):
        raise AdminAuthError()

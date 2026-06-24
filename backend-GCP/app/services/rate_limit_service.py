import logging
import time
from collections import defaultdict, deque

from app.config.settings import settings


logger = logging.getLogger(__name__)


class RateLimitService:
    def __init__(self):
        self._requests_by_key = defaultdict(deque)

    def is_allowed(self, key: str | None) -> bool:
        if not settings.rag_rate_limit_enabled:
            return True

        normalized_key = (key or "anonymous").strip() or "anonymous"
        now = time.monotonic()
        window_started_at = now - settings.rag_rate_limit_window_seconds
        requests = self._requests_by_key[normalized_key]

        while requests and requests[0] <= window_started_at:
            requests.popleft()

        if len(requests) >= settings.rag_rate_limit_requests:
            logger.warning(
                "rag_rate_limit_exceeded",
                extra={
                    "rate_limit_key": normalized_key,
                    "rate_limit_requests": settings.rag_rate_limit_requests,
                    "rate_limit_window_seconds": (
                        settings.rag_rate_limit_window_seconds
                    ),
                },
            )
            return False

        requests.append(now)
        return True

    def reset(self) -> None:
        self._requests_by_key.clear()


rate_limit_service = RateLimitService()

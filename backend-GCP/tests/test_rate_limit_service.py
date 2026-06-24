import unittest
from unittest.mock import patch

from app.services import rate_limit_service as rate_limit_module


class FakeSettings:
    rag_rate_limit_enabled = True
    rag_rate_limit_requests = 2
    rag_rate_limit_window_seconds = 60


class RateLimitServiceTest(unittest.TestCase):
    def setUp(self):
        self.service = rate_limit_module.RateLimitService()

    def test_allows_requests_within_window(self):
        with patch.object(rate_limit_module, "settings", FakeSettings):
            self.assertTrue(self.service.is_allowed("client-1"))
            self.assertTrue(self.service.is_allowed("client-1"))

    def test_blocks_requests_over_window_limit(self):
        with patch.object(rate_limit_module, "settings", FakeSettings):
            self.assertTrue(self.service.is_allowed("client-1"))
            self.assertTrue(self.service.is_allowed("client-1"))
            self.assertFalse(self.service.is_allowed("client-1"))

    def test_disabled_limiter_allows_requests(self):
        class DisabledSettings(FakeSettings):
            rag_rate_limit_enabled = False

        with patch.object(rate_limit_module, "settings", DisabledSettings):
            self.assertTrue(self.service.is_allowed("client-1"))


if __name__ == "__main__":
    unittest.main()

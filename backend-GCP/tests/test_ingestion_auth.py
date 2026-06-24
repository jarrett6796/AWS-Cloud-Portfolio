import importlib
import sys
import unittest
from types import ModuleType, SimpleNamespace
from unittest.mock import Mock, patch


def _load_rag_route(configured_token="test-admin-token"):
    fake_fastapi = ModuleType("fastapi")

    class FakeAPIRouter:
        def post(self, *_args, **_kwargs):
            def decorator(route_handler):
                return route_handler

            return decorator

        def get(self, *_args, **_kwargs):
            def decorator(route_handler):
                return route_handler

            return decorator

    def fake_header(default=None):
        return default

    class FakeHTTPException(Exception):
        def __init__(self, status_code, detail):
            super().__init__(detail)
            self.status_code = status_code
            self.detail = detail

    fake_fastapi.APIRouter = FakeAPIRouter
    fake_fastapi.Header = fake_header
    fake_fastapi.HTTPException = FakeHTTPException
    fake_fastapi.Request = object

    fake_responses = ModuleType("fastapi.responses")
    fake_responses.JSONResponse = object
    fake_responses.StreamingResponse = object

    fake_chat_schema = ModuleType("app.schemas.chat_schema")
    fake_chat_schema.ChatRequest = object
    fake_chat_schema.IngestResponse = object
    fake_chat_schema.RagResponse = object

    fake_ingestion_service = ModuleType("app.services.ingestion_service")
    fake_ingestion_service.ingestion_service = SimpleNamespace(
        ingest_documents=Mock(
            return_value={
                "status": "success",
                "chunks_created": 1,
                "chunks_pruned": 0,
            }
        )
    )

    fake_rag_service = ModuleType("app.services.rag_service")
    fake_rag_service.rag_service = SimpleNamespace(
        get_analytics_summary=Mock(
            return_value={
                "record_count": 1,
                "average_duration_ms": 42,
            }
        ),
        answer_question=Mock(return_value={"answer": "ok"}),
        stream_answer=Mock(return_value=iter([])),
    )

    fake_rate_limit_service = ModuleType("app.services.rate_limit_service")
    fake_rate_limit_service.rate_limit_service = SimpleNamespace(
        is_allowed=Mock(return_value=True),
    )

    import app.routes

    if hasattr(app.routes, "rag"):
        delattr(app.routes, "rag")

    sys.modules.pop("app.routes.rag", None)
    sys.modules.pop("app.security", None)

    with patch.dict(
        "sys.modules",
        {
            "fastapi": fake_fastapi,
            "fastapi.responses": fake_responses,
            "app.schemas.chat_schema": fake_chat_schema,
            "app.services.ingestion_service": fake_ingestion_service,
            "app.services.rag_service": fake_rag_service,
            "app.services.rate_limit_service": fake_rate_limit_service,
        },
    ):
        rag = importlib.import_module("app.routes.rag")

        object.__setattr__(
            rag.require_admin_token.__globals__["settings"],
            "ingestion_admin_token",
            configured_token,
        )

        return (
            rag,
            fake_ingestion_service.ingestion_service,
            fake_rag_service.rag_service,
            fake_rate_limit_service.rate_limit_service,
        )


class IngestionAuthTest(unittest.TestCase):
    def test_ingest_docs_rejects_missing_admin_token(self):
        rag, ingestion_service, _rag_service, _rate_limit_service = _load_rag_route()

        with self.assertRaises(Exception) as context:
            rag.ingest_docs(x_admin_token=None)

        self.assertEqual(context.exception.error_code, "admin_auth_error")
        ingestion_service.ingest_documents.assert_not_called()

    def test_ingest_docs_rejects_wrong_admin_token(self):
        rag, ingestion_service, _rag_service, _rate_limit_service = _load_rag_route()

        with self.assertRaises(Exception) as context:
            rag.ingest_docs(x_admin_token="wrong-token")

        self.assertEqual(context.exception.error_code, "admin_auth_error")
        ingestion_service.ingest_documents.assert_not_called()

    def test_ingest_docs_allows_matching_admin_token(self):
        rag, ingestion_service, _rag_service, _rate_limit_service = _load_rag_route()

        response = rag.ingest_docs(x_admin_token="test-admin-token")

        self.assertEqual(response["status"], "success")
        ingestion_service.ingest_documents.assert_called_once_with()

    def test_ingest_docs_is_blocked_when_admin_token_is_not_configured(self):
        rag, ingestion_service, _rag_service, _rate_limit_service = _load_rag_route(
            configured_token=None
        )

        with self.assertRaises(Exception) as context:
            rag.ingest_docs(x_admin_token="test-admin-token")

        self.assertEqual(context.exception.error_code, "admin_auth_error")
        ingestion_service.ingest_documents.assert_not_called()

    def test_analytics_summary_rejects_missing_admin_token(self):
        rag, _ingestion_service, rag_service, _rate_limit_service = _load_rag_route()

        with self.assertRaises(Exception) as context:
            rag.rag_analytics_summary(x_admin_token=None)

        self.assertEqual(context.exception.error_code, "admin_auth_error")
        rag_service.get_analytics_summary.assert_not_called()

    def test_analytics_summary_allows_matching_admin_token(self):
        rag, _ingestion_service, rag_service, _rate_limit_service = _load_rag_route()

        response = rag.rag_analytics_summary(limit=25, x_admin_token="test-admin-token")

        self.assertEqual(response["record_count"], 1)
        rag_service.get_analytics_summary.assert_called_once_with(limit=25)

    def test_ask_rag_allows_request_under_rate_limit(self):
        rag, _ingestion_service, rag_service, rate_limit_service = _load_rag_route()
        request = SimpleNamespace(
            client=SimpleNamespace(host="203.0.113.10"),
            state=SimpleNamespace(request_id="request-1"),
        )
        chat_request = SimpleNamespace(
            question="What is the backend?",
            history=[],
            session_id="session-1",
            metadata_filter=None,
        )

        response = rag.ask_rag(chat_request, request)

        self.assertEqual(response["answer"], "ok")
        rate_limit_service.is_allowed.assert_called_once_with("203.0.113.10")
        rag_service.answer_question.assert_called_once()

    def test_ask_rag_rejects_request_over_rate_limit(self):
        rag, _ingestion_service, rag_service, rate_limit_service = _load_rag_route()
        rate_limit_service.is_allowed.return_value = False
        request = SimpleNamespace(client=None, state=SimpleNamespace(request_id="request-2"))
        chat_request = SimpleNamespace(
            question="What is the backend?",
            history=[],
            session_id="session-2",
            metadata_filter=None,
        )

        with self.assertRaises(Exception) as context:
            rag.ask_rag(chat_request, request)

        self.assertEqual(context.exception.status_code, 429)
        self.assertEqual(
            context.exception.detail,
            "Rate limit exceeded. Please try again later.",
        )
        rate_limit_service.is_allowed.assert_called_once_with("session-2")
        rag_service.answer_question.assert_not_called()


if __name__ == "__main__":
    unittest.main()

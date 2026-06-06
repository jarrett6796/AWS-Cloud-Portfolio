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

    def fake_header(default=None):
        return default

    fake_fastapi.APIRouter = FakeAPIRouter
    fake_fastapi.Header = fake_header
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
    fake_rag_service.rag_service = SimpleNamespace()

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
        },
    ):
        rag = importlib.import_module("app.routes.rag")

        object.__setattr__(
            rag.require_ingestion_admin_token.__globals__["settings"],
            "ingestion_admin_token",
            configured_token,
        )

        return rag, fake_ingestion_service.ingestion_service


class IngestionAuthTest(unittest.TestCase):
    def test_ingest_docs_rejects_missing_admin_token(self):
        rag, ingestion_service = _load_rag_route()

        with self.assertRaises(Exception) as context:
            rag.ingest_docs(x_admin_token=None)

        self.assertEqual(context.exception.error_code, "admin_auth_error")
        ingestion_service.ingest_documents.assert_not_called()

    def test_ingest_docs_rejects_wrong_admin_token(self):
        rag, ingestion_service = _load_rag_route()

        with self.assertRaises(Exception) as context:
            rag.ingest_docs(x_admin_token="wrong-token")

        self.assertEqual(context.exception.error_code, "admin_auth_error")
        ingestion_service.ingest_documents.assert_not_called()

    def test_ingest_docs_allows_matching_admin_token(self):
        rag, ingestion_service = _load_rag_route()

        response = rag.ingest_docs(x_admin_token="test-admin-token")

        self.assertEqual(response["status"], "success")
        ingestion_service.ingest_documents.assert_called_once_with()

    def test_ingest_docs_is_blocked_when_admin_token_is_not_configured(self):
        rag, ingestion_service = _load_rag_route(configured_token=None)

        with self.assertRaises(Exception) as context:
            rag.ingest_docs(x_admin_token="test-admin-token")

        self.assertEqual(context.exception.error_code, "admin_auth_error")
        ingestion_service.ingest_documents.assert_not_called()


if __name__ == "__main__":
    unittest.main()

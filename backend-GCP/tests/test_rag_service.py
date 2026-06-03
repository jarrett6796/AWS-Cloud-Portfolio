import unittest
from types import ModuleType, SimpleNamespace
from unittest.mock import patch


def _load_rag_service():
    fake_errors = ModuleType("app.errors")
    fake_errors.BackendServiceError = Exception
    fake_errors.RagServiceError = Exception

    fake_firestore_service = ModuleType("app.services.firestore_service")
    fake_firestore_service.firestore_service = SimpleNamespace()

    fake_gemini_service = ModuleType("app.services.gemini_service")
    fake_gemini_service.gemini_service = SimpleNamespace()

    fake_vector_service = ModuleType("app.services.vector_service")
    fake_vector_service.vector_service = SimpleNamespace()

    with patch.dict(
        "sys.modules",
        {
            "app.errors": fake_errors,
            "app.services.firestore_service": fake_firestore_service,
            "app.services.gemini_service": fake_gemini_service,
            "app.services.vector_service": fake_vector_service,
        },
    ):
        from app.services.rag_service import RagService

        return RagService


class RagServiceTest(unittest.TestCase):
    def setUp(self):
        self.rag_service = _load_rag_service()()

    def test_add_source_ids_uses_stable_ordered_labels(self):
        chunks = [
            {"file_name": "PROJECT_STATE.md", "chunk_index": 0},
            {"file_name": "PROJECT_STATE.md", "chunk_index": 1},
        ]

        labeled_chunks = self.rag_service._add_source_ids(chunks)

        self.assertEqual(labeled_chunks[0]["source_id"], "S1")
        self.assertEqual(labeled_chunks[1]["source_id"], "S2")

    def test_build_context_uses_source_ids_and_metadata(self):
        context = self.rag_service._build_context(
            [
                {
                    "source_id": "S1",
                    "file_name": "PROJECT_STATE.md",
                    "chunk_index": 2,
                    "heading": "Architecture",
                    "score": 0.91,
                    "chunk_text": "Cloud Run hosts the FastAPI backend.",
                }
            ]
        )

        self.assertEqual(
            context,
            "[S1] File: PROJECT_STATE.md | Chunk: 2 | Heading: Architecture | Score: 0.91\nCloud Run hosts the FastAPI backend.",
        )

    def test_build_prompt_requires_source_id_citations(self):
        prompt = self.rag_service._build_prompt(
            question="Where does the backend run?",
            context="[S1] File: PROJECT_STATE.md\nCloud Run hosts the backend.",
        )

        self.assertIn("Every factual claim", prompt)
        self.assertIn("[S1] or [S2]", prompt)
        self.assertIn("Do not cite sources that are not listed", prompt)

    def test_build_history_context_keeps_recent_conversation(self):
        messages = [
            SimpleNamespace(role="user", content="What is the backend?"),
            SimpleNamespace(role="assistant", content="It runs on Cloud Run."),
        ]

        history_context = self.rag_service._build_history_context(messages)

        self.assertEqual(
            history_context,
            "user: What is the backend?\nassistant: It runs on Cloud Run.",
        )

    def test_build_prompt_marks_history_as_non_factual_source(self):
        prompt = self.rag_service._build_prompt(
            question="What about ingestion?",
            context="[S1] File: PROJECT_STATE.md\nIngestion is idempotent.",
            conversation_context="user: What about the backend?",
        )

        self.assertIn("<recent_conversation>", prompt)
        self.assertIn("Do not use conversation history as a factual source", prompt)

    def test_build_sources_preserves_debug_metadata(self):
        sources = self.rag_service._build_sources(
            [
                {
                    "file_name": "CAPSTONE_PROJECT_STATE.md",
                    "chunk_index": 1,
                    "source_id": "S1",
                    "score": 0.9,
                    "vector_score": 0.8,
                    "keyword_score": 0.7,
                    "rerank_score": None,
                    "content_hash": "abc",
                    "heading": "Current Stack",
                    "char_count": 123,
                }
            ]
        )

        self.assertEqual(
            sources[0],
            {
                "file_name": "CAPSTONE_PROJECT_STATE.md",
                "chunk_index": 1,
                "source_id": "S1",
                "score": 0.9,
                "vector_score": 0.8,
                "keyword_score": 0.7,
                "rerank_score": None,
                "content_hash": "abc",
                "heading": "Current Stack",
                "char_count": 123,
            },
        )

    def test_format_sse_outputs_event_and_json_data(self):
        event = self.rag_service._format_sse("token", {"text": "Hello"})

        self.assertEqual(event, 'event: token\ndata: {"text": "Hello"}\n\n')


if __name__ == "__main__":
    unittest.main()

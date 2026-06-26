import unittest
from types import SimpleNamespace

from app.services.rag_analytics_helpers import (
    build_analytics_summary,
    build_rag_analytics_payload,
)


class RagAnalyticsHelpersTest(unittest.TestCase):
    def test_build_rag_analytics_payload_keeps_metadata_only_contract(self):
        payload = build_rag_analytics_payload(
            question="What is the backend?",
            answer="The backend runs on Cloud Run. [S1]",
            session_id="session-1",
            rag_context={
                "top_chunks": [{"semantic_rerank_applied": True}],
                "sources": [
                    {"file_name": "B.md", "score": 0.5},
                    {"file_name": "A.md", "score": 0.9},
                ],
                "retrieval_queries": ["backend", "cloud run"],
                "metadata_filter": {"file_name": "A.md"},
                "query_rewrite": SimpleNamespace(
                    retrieval_query="backend cloud run",
                    query_rewritten=True,
                ),
                "retrieval_backend": "local",
            },
            request_id="request-1",
            response_mode="sync",
            duration_ms=12.34,
            no_answer_text="I do not know based on the indexed project documents.",
            retrieval_backend_default="local",
            multi_query_enabled=True,
            semantic_rerank_enabled=True,
            parent_child_enabled=False,
        )

        self.assertEqual(payload["source_file_names"], ["A.md", "B.md"])
        self.assertEqual(payload["max_score"], 0.9)
        self.assertEqual(payload["retrieval_query_count"], 2)
        self.assertTrue(payload["query_rewritten"])
        self.assertTrue(payload["metadata_filter_enabled"])
        self.assertNotIn("question", payload)
        self.assertNotIn("answer", payload)
        self.assertNotIn("prompt", payload)

    def test_build_analytics_summary_handles_empty_and_backend_counts(self):
        summary = build_analytics_summary(
            [
                {
                    "duration_ms": "100",
                    "source_count": "2",
                    "source_file_names": ["A.md"],
                    "retrieval_query_count": 2,
                    "query_rewritten": True,
                    "response_mode": "stream",
                    "retrieval_backend": "firestore_vector",
                },
                {
                    "duration_ms": None,
                    "source_count": None,
                    "source_file_names": [],
                },
            ],
            limit=100,
            retrieval_backend_default="local",
        )

        self.assertEqual(summary["record_count"], 2)
        self.assertEqual(summary["average_duration_ms"], 50)
        self.assertEqual(summary["average_source_count"], 1)
        self.assertEqual(summary["multi_query_rate"], 0.5)
        self.assertEqual(summary["streaming_rate"], 0.5)
        self.assertEqual(
            summary["retrieval_backend_counts"],
            {"firestore_vector": 1, "local": 1},
        )


if __name__ == "__main__":
    unittest.main()

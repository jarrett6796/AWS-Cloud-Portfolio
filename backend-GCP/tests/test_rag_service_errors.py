from rag_test_helpers import BaseRagServiceTest


class RagServiceErrorFallbackTest(BaseRagServiceTest):
    def test_analytics_write_failure_does_not_break_answer(self):
        def fail_analytics_write(_analytics):
            raise RuntimeError("analytics unavailable")

        self.firestore.save_rag_analytics = fail_analytics_write

        with self.assertLogs("app.services.rag_service", level="WARNING"):
            result = self.rag_service.answer_question(
                "What about the backend?",
                session_id="session-analytics-failure",
            )

        self.assertEqual(result["answer"], "The backend uses Cloud Run FastAPI. [S1]")

    def test_multi_query_failure_falls_back_to_original_query(self):
        self.settings.rag_multi_query_enabled = True
        self.gemini.multi_query_error = RuntimeError("multi-query timeout")

        with self.assertLogs("app.services.rag_service", level="WARNING"):
            result = self.rag_service.answer_question(
                "Explain the backend.",
                session_id="session-multi-query-fallback",
            )

        self.assertEqual(self.gemini.embedded_texts, ["Explain the backend."])
        self.assertEqual(result["answer"], "The backend uses Cloud Run FastAPI. [S1]")

    def test_semantic_reranker_failure_falls_back_to_original_order(self):
        self.settings.rag_semantic_rerank_enabled = True
        self.settings.rag_semantic_rerank_top_n = 2
        self.settings.rag_semantic_rerank_keep_k = 2
        self.gemini.semantic_rerank_error = RuntimeError("rerank timeout")

        with self.assertLogs("app.services.rag_service", level="WARNING"):
            result = self.rag_service.answer_question(
                "What about the backend?",
                session_id="session-semantic-rerank-fallback",
            )

        self.assertEqual(result["sources"][0]["file_name"], "CAPSTONE_PROJECT_STATE.md")
        self.assertFalse(result["sources"][0]["semantic_rerank_applied"])
        self.assertFalse(
            self.firestore.analytics_records[0]["semantic_rerank_applied"]
        )

    def test_answer_question_replaces_uncited_generated_answer(self):
        self.gemini.answer_response = "The backend runs on Cloud Run."

        with self.assertLogs("app.services.rag_service", level="WARNING"):
            result = self.rag_service.answer_question(
                "What is the backend?",
                session_id="session-uncited-answer",
            )

        self.assertEqual(
            result["answer"],
            "I do not know based on the indexed project documents.",
        )
        self.assertEqual(self.firestore.saved_messages[1]["content"], result["answer"])
        self.assertTrue(
            self.firestore.analytics_records[0]["citation_validation_blocked_answer"]
        )

    def test_firestore_vector_failure_falls_back_to_local_scan(self):
        self.settings.rag_vector_search_backend = "firestore_vector"
        self.settings.rag_vector_search_fallback_enabled = True
        self.firestore.vector_search_error = RuntimeError("missing vector index")

        with self.assertLogs("app.services.rag_service", level="WARNING"):
            result = self.rag_service.answer_question(
                "What about the backend?",
                session_id="session-vector-fallback",
            )

        self.assertEqual(len(self.firestore.vector_search_calls), 1)
        self.assertEqual(result["sources"][0]["file_name"], "CAPSTONE_PROJECT_STATE.md")
        self.assertEqual(
            self.firestore.analytics_records[0]["retrieval_backend"],
            "firestore_vector_fallback",
        )

from rag_test_helpers import BaseRagServiceTest


class RagServiceQueryRewriteTest(BaseRagServiceTest):
    def test_parse_multi_query_response_cleans_numbered_and_bulleted_lines(self):
        queries = self.module.parse_multi_query_response(
            """
            1. Cloud Run backend retrieval
            - React frontend deployment
            * Firestore chat memory
            """
        )

        self.assertEqual(
            queries,
            [
                "Cloud Run backend retrieval",
                "React frontend deployment",
                "Firestore chat memory",
            ],
        )

    def test_dedupe_queries_preserves_first_case_insensitive_match(self):
        queries = self.rag_service._dedupe_queries(
            [
                "Cloud Run backend",
                "cloud run backend",
                "React frontend",
                "",
            ]
        )

        self.assertEqual(queries, ["Cloud Run backend", "React frontend"])

    def test_query_rewriting_disabled_uses_original_question_and_no_audit(self):
        result = self.rag_service.answer_question(
            "What about the backend?",
            session_id="session-1",
            request_id="request-1",
        )

        self.assertEqual(self.gemini.embedded_texts, ["What about the backend?"])
        self.assertEqual(self.firestore.audit_messages, [])
        self.assertEqual(self.firestore.saved_messages[0]["role"], "user")
        self.assertEqual(
            self.firestore.saved_messages[0]["content"],
            "What about the backend?",
        )
        self.assertEqual(result["retrieval_query"], "What about the backend?")
        self.assertFalse(result["query_rewritten"])

    def test_query_rewriting_enabled_uses_rewritten_query_and_stores_audit(self):
        self.settings.rag_query_rewrite_enabled = True
        self.firestore.stored_history = [
            {"role": "user", "content": "Explain my RAG architecture."},
            {"role": "assistant", "content": "It uses Cloud Run and Firestore."},
        ]
        self.gemini.rewrite_response = (
            "What backend architecture is used in the GCP RAG capstone project?"
        )

        result = self.rag_service.answer_question(
            "What about the backend?",
            session_id="session-2",
            request_id="request-2",
        )

        self.assertEqual(
            self.gemini.embedded_texts,
            ["What backend architecture is used in the GCP RAG capstone project?"],
        )
        self.assertEqual(self.firestore.saved_messages[0]["role"], "user")
        self.assertEqual(
            self.firestore.saved_messages[0]["content"],
            "What about the backend?",
        )
        self.assertEqual(
            self.firestore.audit_messages,
            [
                {
                    "session_id": "session-2",
                    "role": "system",
                    "event_type": "query_rewrite",
                    "original_question": "What about the backend?",
                    "rewritten_query": (
                        "What backend architecture is used in the GCP RAG capstone project?"
                    ),
                    "rewrite_used": True,
                    "request_id": "request-2",
                }
            ],
        )
        self.assertTrue(result["query_rewritten"])

    def test_standalone_question_does_not_store_unnecessary_audit(self):
        self.settings.rag_query_rewrite_enabled = True
        self.gemini.rewrite_response = "Explain my GCP RAG architecture."

        result = self.rag_service.answer_question(
            "Explain my GCP RAG architecture.",
            session_id="session-3",
        )

        self.assertEqual(
            self.gemini.embedded_texts,
            ["Explain my GCP RAG architecture."],
        )
        self.assertEqual(self.firestore.audit_messages, [])
        self.assertFalse(result["query_rewritten"])

    def test_rewrite_failure_falls_back_to_original_question(self):
        self.settings.rag_query_rewrite_enabled = True
        self.gemini.rewrite_error = RuntimeError("rewrite timeout")

        with self.assertLogs("app.services.rag_service", level="WARNING"):
            result = self.rag_service.answer_question(
                "How does it work?",
                session_id="session-4",
            )

        self.assertEqual(self.gemini.embedded_texts, ["How does it work?"])
        self.assertEqual(self.firestore.audit_messages, [])
        self.assertEqual(result["answer"], "The backend uses Cloud Run FastAPI. [S1]")
        self.assertFalse(result["query_rewritten"])

    def test_rewriter_uses_user_assistant_history_not_system_audit_records(self):
        self.settings.rag_query_rewrite_enabled = True
        self.firestore.stored_history = [
            {"role": "user", "content": "Explain my RAG architecture."},
            {
                "role": "system",
                "event_type": "query_rewrite",
                "rewritten_query": "Internal audit text that should be hidden.",
            },
            {"role": "assistant", "content": "It uses Cloud Run."},
        ]
        self.gemini.rewrite_response = "How does Cloud Run work in this RAG project?"

        self.rag_service.answer_question(
            "How does it work?",
            session_id="session-5",
        )

        rewrite_prompt = self.gemini.generated_prompts[0]["contents"]
        self.assertIn("user: Explain my RAG architecture.", rewrite_prompt)
        self.assertIn("assistant: It uses Cloud Run.", rewrite_prompt)
        self.assertNotIn("Internal audit text", rewrite_prompt)

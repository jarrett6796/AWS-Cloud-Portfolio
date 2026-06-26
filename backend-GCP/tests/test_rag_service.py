from types import SimpleNamespace

from rag_test_helpers import BaseRagServiceTest


class RagServiceTest(BaseRagServiceTest):
    def test_add_source_ids_uses_stable_ordered_labels(self):
        chunks = [
            {"file_name": "PROJECT_STATE.md", "chunk_index": 0},
            {"file_name": "PROJECT_STATE.md", "chunk_index": 1},
        ]

        labeled_chunks = self.rag_service._add_source_ids(chunks)

        self.assertEqual(labeled_chunks[0]["source_id"], "S1")
        self.assertEqual(labeled_chunks[1]["source_id"], "S2")

    def test_build_context_uses_source_ids_and_metadata(self):
        context = self.module.build_context(
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
        prompt = self.module.build_rag_prompt(
            question="Where does the backend run?",
            context="[S1] File: PROJECT_STATE.md\nCloud Run hosts the backend.",
        )

        self.assertIn("Every factual claim", prompt)
        self.assertIn("[S1] or [S2]", prompt)
        self.assertIn("Do not cite sources that are not listed", prompt)

    def test_validate_grounded_answer_allows_valid_source_citation(self):
        answer = self.rag_service._validate_grounded_answer(
            "The backend runs on Cloud Run. [S1]",
            [{"source_id": "S1"}],
        )

        self.assertEqual(answer, "The backend runs on Cloud Run. [S1]")

    def test_validate_grounded_answer_replaces_missing_citation(self):
        with self.assertLogs("app.services.rag_service", level="WARNING"):
            answer = self.rag_service._validate_grounded_answer(
                "The backend runs on Cloud Run.",
                [{"source_id": "S1"}],
            )

        self.assertEqual(
            answer,
            "I do not know based on the indexed project documents.",
        )

    def test_validate_grounded_answer_replaces_invalid_citation(self):
        with self.assertLogs("app.services.rag_service", level="WARNING"):
            answer = self.rag_service._validate_grounded_answer(
                "The backend runs on Cloud Run. [S99]",
                [{"source_id": "S1"}],
            )

        self.assertEqual(
            answer,
            "I do not know based on the indexed project documents.",
        )

    def test_validate_grounded_answer_allows_no_answer_without_citation(self):
        answer = self.rag_service._validate_grounded_answer(
            "I do not know based on the indexed project documents.",
            [{"source_id": "S1"}],
        )

        self.assertEqual(
            answer,
            "I do not know based on the indexed project documents.",
        )

    def test_validate_grounded_answer_replaces_no_answer_with_uncited_claims(self):
        with self.assertLogs("app.services.rag_service", level="WARNING"):
            answer = self.rag_service._validate_grounded_answer(
                (
                    "I do not know based on the indexed project documents. "
                    "However, semantic reranking is implemented and active."
                ),
                [{"source_id": "S1"}],
            )

        self.assertEqual(
            answer,
            "I do not know based on the indexed project documents.",
        )

    def test_build_history_context_keeps_recent_user_and_assistant_conversation(self):
        messages = [
            SimpleNamespace(role="user", content="What is the backend?"),
            SimpleNamespace(role="system", content="audit message"),
            SimpleNamespace(role="assistant", content="It runs on Cloud Run."),
        ]

        history_context = self.module.build_history_context(messages)

        self.assertEqual(
            history_context,
            "user: What is the backend?\nassistant: It runs on Cloud Run.",
        )

    def test_build_prompt_marks_history_as_non_factual_source(self):
        prompt = self.module.build_rag_prompt(
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
                    "project": "aws-gcp-rag-capstone",
                    "doc_type": "state",
                    "file_name": "CAPSTONE_PROJECT_STATE.md",
                    "chunk_index": 1,
                    "source_id": "S1",
                    "score": 0.9,
                    "vector_score": 0.8,
                    "vector_distance": 0.2,
                    "keyword_score": 0.7,
                    "rerank_score": None,
                    "content_hash": "abc",
                    "heading": "Current Stack",
                    "section_path": "Current Stack",
                    "source_uri": "gs://cloud-resume-ai-rag-docs/CAPSTONE_PROJECT_STATE.md",
                    "version_id": "v1",
                    "char_count": 123,
                }
            ]
        )

        self.assertEqual(
            sources[0],
            {
                "project": "aws-gcp-rag-capstone",
                "doc_type": "state",
                "file_name": "CAPSTONE_PROJECT_STATE.md",
                "chunk_index": 1,
                "source_id": "S1",
                "score": 0.9,
                "vector_score": 0.8,
                "vector_distance": 0.2,
                "keyword_score": 0.7,
                "rerank_score": None,
                "content_hash": "abc",
                "heading": "Current Stack",
                "section_path": "Current Stack",
                "source_uri": "gs://cloud-resume-ai-rag-docs/CAPSTONE_PROJECT_STATE.md",
                "version_id": "v1",
                "char_count": 123,
                "parent_id": None,
                "child_id": None,
                "parent_heading": None,
                "parent_section_path": None,
                "parent_chunk_summary": None,
                "parent_context_expanded": False,
                "parent_context_token_count": None,
                "semantic_rerank_applied": False,
                "semantic_rerank_position": None,
            },
        )

    def test_get_analytics_summary_aggregates_recent_metadata_records(self):
        self.firestore.analytics_records = [
            {
                "duration_ms": 100,
                "source_count": 2,
                "source_file_names": ["CAPSTONE_PROJECT_STATE.md"],
                "no_answer": False,
                "citation_validation_blocked_answer": False,
                "query_rewritten": True,
                "retrieval_query_count": 2,
                "metadata_filter_enabled": False,
                "response_mode": "sync",
            },
            {
                "duration_ms": 50,
                "source_count": 0,
                "source_file_names": [],
                "no_answer": True,
                "citation_validation_blocked_answer": True,
                "query_rewritten": False,
                "retrieval_query_count": 1,
                "metadata_filter_enabled": True,
                "response_mode": "stream",
            },
        ]

        summary = self.rag_service.get_analytics_summary(limit=1000)

        self.assertEqual(self.firestore.loaded_analytics_limit, 500)
        self.assertEqual(summary["record_count"], 2)
        self.assertEqual(summary["average_duration_ms"], 75)
        self.assertEqual(summary["average_source_count"], 1)
        self.assertEqual(summary["no_answer_rate"], 0.5)
        self.assertEqual(summary["citation_validation_block_rate"], 0.5)
        self.assertEqual(summary["query_rewrite_rate"], 0.5)
        self.assertEqual(summary["multi_query_rate"], 0.5)
        self.assertEqual(summary["metadata_filter_rate"], 0.5)
        self.assertEqual(summary["streaming_rate"], 0.5)
        self.assertEqual(
            summary["top_source_file_names"],
            [{"file_name": "CAPSTONE_PROJECT_STATE.md", "count": 1}],
        )

    def test_get_analytics_summary_handles_empty_records(self):
        summary = self.rag_service.get_analytics_summary(limit=0)

        self.assertEqual(self.firestore.loaded_analytics_limit, 100)
        self.assertEqual(summary["record_count"], 0)
        self.assertEqual(summary["average_duration_ms"], 0)
        self.assertEqual(summary["no_answer_rate"], 0)

    def test_answer_question_saves_metadata_only_rag_analytics(self):
        result = self.rag_service.answer_question(
            "What about the backend?",
            session_id="session-analytics",
            request_id="request-analytics",
        )

        self.assertEqual(len(self.firestore.analytics_records), 1)
        analytics = self.firestore.analytics_records[0]
        self.assertEqual(analytics["session_id"], "session-analytics")
        self.assertEqual(analytics["request_id"], "request-analytics")
        self.assertEqual(analytics["response_mode"], "sync")
        self.assertEqual(analytics["question_length"], len("What about the backend?"))
        self.assertEqual(analytics["answer_length"], len(result["answer"]))
        self.assertEqual(analytics["source_count"], len(result["sources"]))
        self.assertEqual(analytics["retrieval_query_count"], 1)
        self.assertFalse(analytics["query_rewritten"])
        self.assertFalse(analytics["metadata_filter_enabled"])
        self.assertEqual(analytics["retrieval_backend"], "local")
        self.assertFalse(analytics["no_answer"])
        self.assertNotIn("question", analytics)
        self.assertNotIn("answer", analytics)
        self.assertNotIn("prompt", analytics)

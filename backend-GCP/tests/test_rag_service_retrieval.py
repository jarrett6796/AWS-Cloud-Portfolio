from rag_test_helpers import BaseRagServiceTest


class RagServiceRetrievalTest(BaseRagServiceTest):
    def test_normalize_metadata_filter_ignores_empty_and_unknown_values(self):
        metadata_filter = self.rag_service._normalize_metadata_filter(
            {
                "file_name": " CAPSTONE_PROJECT_STATE.md ",
                "project": "aws-gcp-rag-capstone",
                "doc_type": " state ",
                "section_path": " Architecture ",
                "source_uri": " rag-docs ",
                "version_id": " abc123 ",
                "heading": "",
                "unknown": "ignored",
            }
        )

        self.assertEqual(
            metadata_filter,
            {
                "project": "aws-gcp-rag-capstone",
                "doc_type": "state",
                "file_name": "CAPSTONE_PROJECT_STATE.md",
                "section_path": "Architecture",
                "source_uri": "rag-docs",
                "version_id": "abc123",
            },
        )

    def test_metadata_matches_filters_by_supported_metadata_fields(self):
        chunk = {
            "project": "aws-gcp-rag-capstone",
            "doc_type": "state",
            "file_name": "CAPSTONE_PROJECT_STATE.md",
            "heading": "Current Architecture",
            "section_path": "Overview > Current Architecture",
            "source_uri": "gs://cloud-resume-ai-rag-docs/CAPSTONE_PROJECT_STATE.md",
            "version_id": "abc123",
        }

        self.assertTrue(
            self.rag_service._metadata_matches(
                chunk,
                {
                    "project": "aws-gcp-rag-capstone",
                    "doc_type": "state",
                    "file_name": "CAPSTONE_PROJECT_STATE.md",
                    "heading": "architecture",
                    "section_path": "overview",
                    "source_uri": "rag-docs",
                    "version_id": "abc123",
                },
            )
        )
        self.assertFalse(
            self.rag_service._metadata_matches(
                chunk,
                {"file_name": "Other.md"},
            )
        )
        self.assertFalse(
            self.rag_service._metadata_matches(
                chunk,
                {"section_path": "deployment"},
            )
        )
        self.assertFalse(
            self.rag_service._metadata_matches(
                chunk,
                {"doc_type": "implementation"},
            )
        )

    def test_multi_query_enabled_embeds_variants_and_dedupes_chunks(self):
        self.settings.rag_multi_query_enabled = True
        self.settings.rag_multi_query_count = 3
        self.gemini.multi_query_response = (
            "React frontend deployment\nCloud Run backend architecture"
        )

        result = self.rag_service.answer_question(
            "Explain the architecture.",
            session_id="session-multi-query",
        )

        self.assertEqual(
            self.gemini.embedded_texts,
            [
                "Explain the architecture.",
                "React frontend deployment",
                "Cloud Run backend architecture",
            ],
        )
        source_keys = {
            (source["file_name"], source["chunk_index"])
            for source in result["sources"]
        }
        self.assertEqual(len(result["sources"]), len(source_keys))
        self.assertEqual(len(result["sources"]), 2)

    def test_semantic_reranker_reorders_candidates_before_source_ids(self):
        self.settings.rag_semantic_rerank_enabled = True
        self.settings.rag_semantic_rerank_top_n = 2
        self.settings.rag_semantic_rerank_keep_k = 2
        self.gemini.semantic_rerank_response = "C2\nC1"
        self.gemini.answer_response = "The frontend uses React and Vite. [S1]"

        result = self.rag_service.answer_question(
            "What is the frontend?",
            session_id="session-semantic-rerank",
        )

        semantic_prompt = self.gemini.generated_prompts[0]["contents"]
        self.assertIn("Rank the retrieved chunks", semantic_prompt)
        self.assertIn("ID: C1", semantic_prompt)
        self.assertIn("ID: C2", semantic_prompt)
        self.assertEqual(
            result["sources"][0]["file_name"],
            "REACT_Frontend_Development_Log.md",
        )
        self.assertEqual(result["sources"][0]["source_id"], "S1")
        self.assertTrue(result["sources"][0]["semantic_rerank_applied"])
        self.assertEqual(result["sources"][0]["semantic_rerank_position"], 1)
        self.assertTrue(
            self.firestore.analytics_records[0]["semantic_rerank_applied"]
        )
        self.assertNotIn("prompt", self.firestore.analytics_records[0])

    def test_parent_context_expansion_uses_parent_text_without_changing_source_id(self):
        self.settings.rag_parent_child_enabled = True
        self.settings.rag_parent_context_max_tokens = 8

        result = self.rag_service.answer_question(
            "What about the backend?",
            session_id="session-parent-context",
        )

        answer_prompt = self.gemini.generated_prompts[-1]["contents"]
        self.assertIn("# Current Architecture The backend uses Cloud", answer_prompt)
        self.assertIn("[S1] File: CAPSTONE_PROJECT_STATE.md", answer_prompt)
        self.assertEqual(result["sources"][0]["source_id"], "S1")
        self.assertEqual(result["sources"][0]["parent_id"], "parent-backend")
        self.assertTrue(result["sources"][0]["parent_context_expanded"])
        self.assertEqual(result["sources"][0]["parent_context_token_count"], 8)
        self.assertEqual(
            self.firestore.analytics_records[0]["parent_context_expanded_count"],
            1,
        )

    def test_answer_question_returns_no_answer_when_no_chunks_are_selected(self):
        self.firestore.document_chunks = []

        result = self.rag_service.answer_question(
            "What is the backend?",
            session_id="session-no-context",
        )

        self.assertEqual(
            result["answer"],
            "I do not know based on the indexed project documents.",
        )
        self.assertEqual(result["sources"], [])
        self.assertEqual(len(self.gemini.generated_prompts), 0)
        self.assertEqual(self.firestore.saved_messages[1]["content"], result["answer"])
        self.assertTrue(self.firestore.analytics_records[0]["no_answer"])
        self.assertFalse(
            self.firestore.analytics_records[0]["citation_validation_blocked_answer"]
        )

    def test_answer_question_filters_retrieval_by_file_name(self):
        result = self.rag_service.answer_question(
            "What is the frontend?",
            session_id="session-filter-file",
            metadata_filter={"file_name": "REACT_Frontend_Development_Log.md"},
        )

        self.assertEqual(len(result["sources"]), 1)
        self.assertEqual(
            result["sources"][0]["file_name"],
            "REACT_Frontend_Development_Log.md",
        )

    def test_answer_question_filters_retrieval_by_doc_type(self):
        result = self.rag_service.answer_question(
            "What is the frontend?",
            session_id="session-filter-doc-type",
            metadata_filter={"doc_type": "development_log"},
        )

        self.assertEqual(len(result["sources"]), 1)
        self.assertEqual(result["sources"][0]["doc_type"], "development_log")

    def test_answer_question_filters_retrieval_by_section_path(self):
        result = self.rag_service.answer_question(
            "What is the backend?",
            session_id="session-filter-section-path",
            metadata_filter={"section_path": "current architecture"},
        )

        self.assertEqual(len(result["sources"]), 1)
        self.assertEqual(
            result["sources"][0]["section_path"],
            "Current Architecture",
        )

    def test_answer_question_filters_retrieval_by_source_uri(self):
        result = self.rag_service.answer_question(
            "What is the frontend?",
            session_id="session-filter-source-uri",
            metadata_filter={"source_uri": "react_frontend"},
        )

        self.assertEqual(len(result["sources"]), 1)
        self.assertEqual(
            result["sources"][0]["file_name"],
            "REACT_Frontend_Development_Log.md",
        )

    def test_answer_question_filters_retrieval_by_version_id(self):
        result = self.rag_service.answer_question(
            "What is the backend?",
            session_id="session-filter-version-id",
            metadata_filter={"version_id": "v1"},
        )

        self.assertEqual(len(result["sources"]), 1)
        self.assertEqual(result["sources"][0]["version_id"], "v1")

    def test_answer_question_returns_no_answer_when_filter_removes_all_chunks(self):
        result = self.rag_service.answer_question(
            "What is the backend?",
            session_id="session-filter-empty",
            metadata_filter={"file_name": "Missing.md"},
        )

        self.assertEqual(result["sources"], [])
        self.assertEqual(
            result["answer"],
            "I do not know based on the indexed project documents.",
        )
        self.assertEqual(len(self.gemini.generated_prompts), 0)

    def test_firestore_vector_backend_uses_vector_search_and_records_analytics(self):
        self.settings.rag_vector_search_backend = "firestore_vector"

        result = self.rag_service.answer_question(
            "What about the backend?",
            session_id="session-vector",
            metadata_filter={"project": "aws-gcp-rag-capstone"},
        )

        self.assertEqual(len(self.firestore.vector_search_calls), 1)
        self.assertEqual(
            self.firestore.vector_search_calls[0]["metadata_filter"],
            {"project": "aws-gcp-rag-capstone"},
        )
        self.assertEqual(result["sources"][0]["file_name"], "CAPSTONE_PROJECT_STATE.md")
        self.assertEqual(
            self.firestore.analytics_records[0]["retrieval_backend"],
            "firestore_vector",
        )

    def test_analytics_summary_counts_retrieval_backends(self):
        self.firestore.analytics_records = [
            {"retrieval_backend": "local"},
            {"retrieval_backend": "firestore_vector"},
            {"retrieval_backend": "firestore_vector"},
        ]

        summary = self.rag_service.get_analytics_summary()

        self.assertEqual(
            summary["retrieval_backend_counts"],
            {"firestore_vector": 2, "local": 1},
        )

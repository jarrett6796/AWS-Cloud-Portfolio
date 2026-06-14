import unittest

from app.config.settings import Settings


class SettingsTest(unittest.TestCase):
    def test_public_summary_hides_project_id_value(self):
        settings = Settings(project_id="real-project-id")

        summary = settings.public_summary()

        self.assertTrue(summary["project_configured"])
        self.assertNotIn("project_id", summary)

    def test_public_summary_includes_rag_analytics_collection(self):
        settings = Settings(firestore_rag_analytics_collection="rag_metrics")

        summary = settings.public_summary()

        self.assertEqual(
            summary["firestore_rag_analytics_collection"],
            "rag_metrics",
        )

    def test_startup_warnings_flags_missing_project(self):
        settings = Settings(project_id=None)

        warnings = settings.startup_warnings()

        self.assertIn("GOOGLE_CLOUD_PROJECT is not set.", warnings)

    def test_default_cors_origins_include_production_frontend(self):
        settings = Settings()

        self.assertIn(
            "https://dvzu3s2gq6iw.cloudfront.net",
            settings.cors_allowed_origins,
        )

    def test_public_summary_reports_admin_token_as_boolean_only(self):
        settings = Settings(ingestion_admin_token="secret-token")

        summary = settings.public_summary()

        self.assertTrue(summary["ingestion_admin_token_configured"])
        self.assertNotIn("ingestion_admin_token", summary)
        self.assertNotIn("secret-token", str(summary))

    def test_public_summary_includes_query_rewrite_config(self):
        settings = Settings(
            rag_query_rewrite_enabled=True,
            rag_query_rewrite_history_limit=4,
            rag_query_rewrite_model="gemini-2.5-flash",
            rag_multi_query_enabled=True,
            rag_multi_query_count=3,
            rag_multi_query_model="gemini-2.5-flash",
        )

        summary = settings.public_summary()

        self.assertTrue(summary["query_rewrite_enabled"])
        self.assertEqual(summary["query_rewrite_history_limit"], 4)
        self.assertEqual(summary["query_rewrite_model"], "gemini-2.5-flash")
        self.assertTrue(summary["multi_query_enabled"])
        self.assertEqual(summary["multi_query_count"], 3)
        self.assertEqual(summary["multi_query_model"], "gemini-2.5-flash")

    def test_public_summary_includes_chunking_config(self):
        settings = Settings(
            default_chunk_size=256,
            default_chunk_overlap_tokens=32,
        )

        summary = settings.public_summary()

        self.assertEqual(summary["default_chunk_size"], 256)
        self.assertEqual(summary["default_chunk_overlap_tokens"], 32)

    def test_startup_warnings_flags_missing_ingestion_admin_token(self):
        settings = Settings(ingestion_admin_token=None)

        warnings = settings.startup_warnings()

        self.assertIn(
            "INGESTION_ADMIN_TOKEN is not set; /ingest-docs is blocked.",
            warnings,
        )

    def test_startup_warnings_flags_invalid_retrieval_config(self):
        settings = Settings(
            project_id="project",
            rag_top_k=5,
            rag_candidate_pool_size=3,
            rag_score_threshold=1.2,
            rag_vector_score_weight=-0.1,
            rag_rerank_keyword_weight=1.1,
            rag_query_rewrite_history_limit=0,
            rag_multi_query_count=0,
            default_chunk_size=0,
            default_chunk_overlap_tokens=1,
        )

        warnings = settings.startup_warnings()

        self.assertIn("RAG_CANDIDATE_POOL_SIZE is smaller than RAG_TOP_K.", warnings)
        self.assertIn("RAG_SCORE_THRESHOLD should be between 0 and 1.", warnings)
        self.assertIn("RAG_VECTOR_SCORE_WEIGHT should be between 0 and 1.", warnings)
        self.assertIn("RAG_RERANK_KEYWORD_WEIGHT should be between 0 and 1.", warnings)
        self.assertIn(
            "RAG_QUERY_REWRITE_HISTORY_LIMIT should be at least 1.",
            warnings,
        )
        self.assertIn("RAG_MULTI_QUERY_COUNT should be at least 1.", warnings)
        self.assertIn("DEFAULT_CHUNK_SIZE should be at least 1.", warnings)
        self.assertIn(
            "DEFAULT_CHUNK_OVERLAP_TOKENS should be smaller than DEFAULT_CHUNK_SIZE.",
            warnings,
        )

    def test_startup_warnings_flags_negative_chunk_overlap(self):
        settings = Settings(
            project_id="project",
            default_chunk_size=100,
            default_chunk_overlap_tokens=-1,
        )

        warnings = settings.startup_warnings()

        self.assertIn(
            "DEFAULT_CHUNK_OVERLAP_TOKENS should not be negative.",
            warnings,
        )


if __name__ == "__main__":
    unittest.main()

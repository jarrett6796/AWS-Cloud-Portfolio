import unittest

from app.config.settings import Settings


class SettingsTest(unittest.TestCase):
    def test_public_summary_hides_project_id_value(self):
        settings = Settings(project_id="real-project-id")

        summary = settings.public_summary()

        self.assertTrue(summary["project_configured"])
        self.assertNotIn("project_id", summary)

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
        )

        warnings = settings.startup_warnings()

        self.assertIn("RAG_CANDIDATE_POOL_SIZE is smaller than RAG_TOP_K.", warnings)
        self.assertIn("RAG_SCORE_THRESHOLD should be between 0 and 1.", warnings)
        self.assertIn("RAG_VECTOR_SCORE_WEIGHT should be between 0 and 1.", warnings)
        self.assertIn("RAG_RERANK_KEYWORD_WEIGHT should be between 0 and 1.", warnings)


if __name__ == "__main__":
    unittest.main()

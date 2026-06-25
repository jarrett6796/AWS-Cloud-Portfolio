import unittest

from app.services.vector_service import VectorService


class VectorServiceTest(unittest.TestCase):
    def setUp(self):
        self.vector_service = VectorService()

    def test_chunk_text_preserves_markdown_sections_when_size_requires_split(self):
        text = """# Overview
This is the overview.

## Architecture
This is the architecture.

## Deployment
This is the deployment.
"""

        chunks = self.vector_service.chunk_text(
            text,
            chunk_size=6,
            chunk_overlap_tokens=0,
        )

        self.assertEqual(
            chunks,
            [
                "# Overview\nThis is the overview.",
                "## Architecture\nThis is the architecture.",
                "## Deployment\nThis is the deployment.",
            ],
        )

    def test_chunk_text_combines_small_sections(self):
        text = """# A
One.

# B
Two.
"""

        chunks = self.vector_service.chunk_text(
            text,
            chunk_size=10,
            chunk_overlap_tokens=0,
        )

        self.assertEqual(chunks, ["# A\nOne.\n\n# B\nTwo."])

    def test_chunk_text_splits_oversized_paragraphs(self):
        text = "# Long\n" + "one two three four five six seven"

        chunks = self.vector_service.chunk_text(
            text,
            chunk_size=4,
            chunk_overlap_tokens=0,
        )

        self.assertEqual(
            chunks,
            [
                "# Long one two",
                "three four five six",
                "seven",
            ],
        )

    def test_chunk_text_adds_token_overlap_for_oversized_paragraphs(self):
        text = "one two three four five six seven eight"

        chunks = self.vector_service.chunk_text(
            text,
            chunk_size=4,
            chunk_overlap_tokens=2,
        )

        self.assertEqual(
            chunks,
            [
                "one two three four",
                "three four five six",
                "five six seven eight",
            ],
        )

    def test_chunk_text_bounds_overlap_below_chunk_size(self):
        text = "one two three four five"

        chunks = self.vector_service.chunk_text(
            text,
            chunk_size=3,
            chunk_overlap_tokens=10,
        )

        self.assertEqual(
            chunks,
            [
                "one two three",
                "two three four",
                "three four five",
            ],
        )

    def test_build_chunk_metadata_extracts_heading_and_character_count(self):
        metadata = self.vector_service.build_chunk_metadata(
            "## Architecture\nThis section explains the backend.",
            file_name="GCP_RAG_PROJECT_STATE.md",
        )

        self.assertEqual(metadata["char_count"], 50)
        self.assertEqual(metadata["doc_type"], "architecture")
        self.assertEqual(metadata["heading"], "Architecture")
        self.assertEqual(metadata["project"], "aws-gcp-rag-capstone")
        self.assertEqual(metadata["section_path"], "Architecture")
        self.assertEqual(
            metadata["source_uri"],
            "gs://cloud-resume-ai-rag-docs/GCP_RAG_PROJECT_STATE.md",
        )
        self.assertEqual(len(metadata["content_hash"]), 64)
        self.assertEqual(metadata["version_id"], metadata["content_hash"][:16])

    def test_build_chunk_metadata_allows_missing_heading(self):
        metadata = self.vector_service.build_chunk_metadata("No heading here.")

        self.assertEqual(metadata["char_count"], 16)
        self.assertEqual(metadata["heading"], None)
        self.assertEqual(metadata["section_path"], None)
        self.assertEqual(metadata["doc_type"], "state")

    def test_build_chunk_metadata_preserves_heading_hierarchy(self):
        metadata = self.vector_service.build_chunk_metadata(
            "# Overview\nIntro\n\n## Troubleshooting\nFixes",
            file_name="Troubleshooting.md",
        )

        self.assertEqual(metadata["heading"], "Overview")
        self.assertEqual(metadata["section_path"], "Overview > Troubleshooting")
        self.assertEqual(metadata["doc_type"], "troubleshooting")

    def test_build_parent_child_chunks_adds_parent_metadata(self):
        text = """# Overview
Intro.

## Architecture
Cloud Run hosts FastAPI and Firestore stores chunks.
"""

        records = self.vector_service.build_parent_child_chunks(
            text,
            file_name="GCP_RAG_PROJECT_STATE.md",
            chunk_size=6,
            chunk_overlap_tokens=0,
        )

        self.assertEqual(len(records), 3)
        first_metadata = records[0]["metadata"]
        second_metadata = records[1]["metadata"]
        self.assertIn("parent_id", first_metadata)
        self.assertIn("child_id", first_metadata)
        self.assertEqual(first_metadata["parent_heading"], "Overview")
        self.assertEqual(first_metadata["parent_section_path"], "Overview")
        self.assertEqual(second_metadata["parent_heading"], "Architecture")
        self.assertEqual(second_metadata["parent_section_path"], "Architecture")
        self.assertIn("Cloud Run hosts FastAPI", second_metadata["parent_context"])
        self.assertIn("Architecture", second_metadata["parent_chunk_summary"])

    def test_select_relevant_chunks_filters_by_threshold_and_top_k(self):
        chunks = [
            {"score": 0.91, "chunk_index": 1},
            {"score": 0.50, "chunk_index": 2},
            {"score": 0.19, "chunk_index": 3},
            {"score": 0.85, "chunk_index": 4},
        ]

        selected = self.vector_service.select_relevant_chunks(
            chunks,
            top_k=2,
            candidate_pool_size=4,
            score_threshold=0.5,
        )

        self.assertEqual(
            selected,
            [
                {"score": 0.91, "chunk_index": 1},
                {"score": 0.85, "chunk_index": 4},
            ],
        )

    def test_select_relevant_chunks_respects_candidate_pool_size(self):
        chunks = [
            {"score": 0.91, "chunk_index": 1},
            {"score": 0.89, "chunk_index": 2},
            {"score": 0.88, "chunk_index": 3},
        ]

        selected = self.vector_service.select_relevant_chunks(
            chunks,
            top_k=3,
            candidate_pool_size=2,
            score_threshold=0,
        )

        self.assertEqual(
            selected,
            [
                {"score": 0.91, "chunk_index": 1},
                {"score": 0.89, "chunk_index": 2},
            ],
        )

    def test_keyword_score_uses_query_overlap(self):
        score = self.vector_service.keyword_score(
            query="cloud run deployment",
            chunk_text="This section explains Cloud Run service deployment.",
            heading="GCP Backend",
        )

        self.assertEqual(score, 1)

    def test_keyword_score_uses_heading_text(self):
        score = self.vector_service.keyword_score(
            query="firestore chunks",
            chunk_text="This section explains document metadata.",
            heading="Firestore Chunks",
        )

        self.assertEqual(score, 1)

    def test_hybrid_score_combines_vector_and_keyword_scores(self):
        score = self.vector_service.hybrid_score(
            vector_score=0.75,
            keyword_score=0.25,
            vector_weight=0.8,
        )

        self.assertAlmostEqual(score, 0.65)

    def test_rerank_score_adds_keyword_boost(self):
        score = self.vector_service.rerank_score(
            score=0.60,
            keyword_score=0.50,
            keyword_weight=0.2,
        )

        self.assertAlmostEqual(score, 0.70)

    def test_select_relevant_chunks_can_rerank_filtered_candidates(self):
        chunks = [
            {"score": 0.80, "keyword_score": 0, "chunk_index": 1},
            {"score": 0.75, "keyword_score": 1, "chunk_index": 2},
            {"score": 0.40, "keyword_score": 1, "chunk_index": 3},
        ]

        selected = self.vector_service.select_relevant_chunks(
            chunks,
            top_k=2,
            candidate_pool_size=3,
            score_threshold=0.5,
            rerank_enabled=True,
            rerank_keyword_weight=0.1,
        )

        self.assertEqual(
            selected,
            [
                {
                    "score": 0.75,
                    "keyword_score": 1,
                    "chunk_index": 2,
                    "rerank_score": 0.85,
                },
                {
                    "score": 0.80,
                    "keyword_score": 0,
                    "chunk_index": 1,
                    "rerank_score": 0.80,
                },
            ],
        )

    def test_select_relevant_chunks_does_not_rerank_by_default(self):
        chunks = [
            {"score": 0.80, "keyword_score": 0, "chunk_index": 1},
            {"score": 0.75, "keyword_score": 1, "chunk_index": 2},
        ]

        selected = self.vector_service.select_relevant_chunks(
            chunks,
            top_k=2,
            candidate_pool_size=2,
            score_threshold=0,
        )

        self.assertEqual(selected, chunks)


if __name__ == "__main__":
    unittest.main()

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
            "## Architecture\nThis section explains the backend."
        )

        self.assertEqual(
            metadata,
            {
                "char_count": 50,
                "heading": "Architecture",
            },
        )

    def test_build_chunk_metadata_allows_missing_heading(self):
        metadata = self.vector_service.build_chunk_metadata("No heading here.")

        self.assertEqual(
            metadata,
            {
                "char_count": 16,
                "heading": None,
            },
        )

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

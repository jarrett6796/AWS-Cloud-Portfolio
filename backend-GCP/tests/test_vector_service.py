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

        chunks = self.vector_service.chunk_text(text, chunk_size=70)

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

        chunks = self.vector_service.chunk_text(text, chunk_size=50)

        self.assertEqual(chunks, ["# A\nOne.\n\n# B\nTwo."])

    def test_chunk_text_splits_oversized_paragraphs(self):
        text = "# Long\n" + ("a" * 25)

        chunks = self.vector_service.chunk_text(text, chunk_size=10)

        self.assertEqual(chunks, ["# Long\naaa", "aaaaaaaaaa", "aaaaaaaaaa", "aa"])

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


if __name__ == "__main__":
    unittest.main()

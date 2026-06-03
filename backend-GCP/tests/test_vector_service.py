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


if __name__ == "__main__":
    unittest.main()

import unittest
from types import SimpleNamespace

from app.services.rag_prompt_builder import (
    build_context,
    build_history_context,
    build_rag_prompt,
    build_semantic_rerank_prompt,
)


class RagPromptBuilderTest(unittest.TestCase):
    def test_build_context_preserves_source_metadata_format(self):
        context = build_context(
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

    def test_build_history_context_uses_visible_recent_messages(self):
        history_context = build_history_context(
            [
                SimpleNamespace(role="system", content="hidden audit"),
                SimpleNamespace(role="user", content="What is the backend?"),
                SimpleNamespace(role="assistant", content="It runs on Cloud Run."),
            ]
        )

        self.assertEqual(
            history_context,
            "user: What is the backend?\nassistant: It runs on Cloud Run.",
        )

    def test_build_rag_prompt_keeps_citation_contract(self):
        prompt = build_rag_prompt(
            question="Where does the backend run?",
            context="[S1] File: PROJECT_STATE.md\nCloud Run hosts the backend.",
        )

        self.assertIn(
            "Every factual claim from the retrieved context must include a citation using the source ID format, such as [S1] or [S2].",
            prompt,
        )
        self.assertIn(
            "If the answer is not in the context, say you do not know based on the indexed project documents.",
            prompt,
        )
        self.assertIn(
            "Do not cite sources that are not listed in the retrieved context.",
            prompt,
        )

    def test_build_rag_prompt_includes_static_language_instruction(self):
        language_instruction = (
            "Answer in the same language as the user's question, even if the retrieved context or conversation history is in a different language."
        )
        english_prompt = build_rag_prompt(
            question="Where does the backend run?",
            context="[S1] File: PROJECT_STATE.md\nCloud Run hosts the backend.",
        )
        traditional_chinese_prompt = build_rag_prompt(
            question="後端部署在哪裡？",
            context="[S1] File: PROJECT_STATE.md\nCloud Run hosts the backend.",
        )

        self.assertIn(language_instruction, english_prompt)
        self.assertIn(language_instruction, traditional_chinese_prompt)

    def test_build_semantic_rerank_prompt_uses_compact_chunk_ids(self):
        prompt = build_semantic_rerank_prompt(
            "frontend architecture",
            [
                {
                    "file_name": "Frontend.md",
                    "heading": "UI",
                    "section_path": "Architecture > UI",
                    "chunk_text": "React and Vite render the frontend.",
                }
            ],
        )

        self.assertIn("Rank the retrieved chunks", prompt)
        self.assertIn("ID: C1", prompt)
        self.assertIn("Preview: React and Vite render the frontend.", prompt)


if __name__ == "__main__":
    unittest.main()

import unittest
import sys
from types import ModuleType
from unittest.mock import patch


class FakeBaseModel:
    def __init__(self, **kwargs):
        for field, default in self.__class__.__dict__.items():
            if field.startswith("_") or callable(default):
                continue
            setattr(self, field, default)

        for key, value in kwargs.items():
            setattr(self, key, value)

    def model_dump(self):
        return {
            field: getattr(self, field)
            for field in self.__class__.__annotations__
        }


def _fake_field(default_factory=None, default=None):
    if default_factory:
        return default_factory()

    return default


class ChatSchemaTest(unittest.TestCase):
    def test_source_metadata_preserves_phase4_fields(self):
        fake_pydantic = ModuleType("pydantic")
        fake_pydantic.BaseModel = FakeBaseModel
        fake_pydantic.Field = _fake_field

        sys.modules.pop("app.schemas.chat_schema", None)
        with patch.dict("sys.modules", {"pydantic": fake_pydantic}):
            from app.schemas.chat_schema import SourceMetadata

        source = SourceMetadata(
            source_id="S1",
            file_name="CAPSTONE_PROJECT_STATE.md",
            chunk_index=1,
            score=0.9,
            parent_id="parent-1",
            child_id="child-1",
            parent_heading="Architecture",
            parent_section_path="Overview > Architecture",
            parent_chunk_summary="Architecture summary",
            parent_context_expanded=True,
            parent_context_token_count=42,
            semantic_rerank_applied=True,
            semantic_rerank_position=1,
        )

        data = source.model_dump()

        self.assertEqual(data["parent_id"], "parent-1")
        self.assertEqual(data["child_id"], "child-1")
        self.assertEqual(data["parent_heading"], "Architecture")
        self.assertEqual(data["parent_section_path"], "Overview > Architecture")
        self.assertEqual(data["parent_chunk_summary"], "Architecture summary")
        self.assertTrue(data["parent_context_expanded"])
        self.assertEqual(data["parent_context_token_count"], 42)
        self.assertTrue(data["semantic_rerank_applied"])
        self.assertEqual(data["semantic_rerank_position"], 1)


if __name__ == "__main__":
    unittest.main()

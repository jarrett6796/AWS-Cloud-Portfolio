import sys
import unittest
from enum import Enum
from types import ModuleType, SimpleNamespace
from unittest.mock import patch


class FakeDistanceMeasure(Enum):
    EUCLIDEAN = 1
    COSINE = 2
    DOT_PRODUCT = 3


class FakeVector:
    def __init__(self, value):
        self.value = tuple(value)


class FakeDocument:
    def __init__(self, data):
        self._data = data

    def to_dict(self):
        return dict(self._data)


class FakeVectorQuery:
    def __init__(self, documents):
        self.documents = documents

    def stream(self):
        return [FakeDocument(document) for document in self.documents]


class FakeCollection:
    def __init__(self):
        self.filters = []
        self.find_nearest_call = None
        self.last_document_id = None
        self.last_set_record = None
        self.documents = [
            {
                "file_name": "CAPSTONE_PROJECT_STATE.md",
                "chunk_index": 1,
                "chunk_text": "Cloud Run and Firestore.",
                "embedding": [1.0, 0.0],
                "_vector_distance": 0.12,
            }
        ]

    def document(self, _document_id):
        self.last_document_id = _document_id

        def set_record(record):
            self.last_set_record = record

        return SimpleNamespace(set=set_record)

    def where(self, field, operator, value):
        self.filters.append((field, operator, value))
        return self

    def find_nearest(
        self,
        vector_field,
        query_vector,
        limit,
        distance_measure,
        distance_result_field=None,
    ):
        self.find_nearest_call = {
            "vector_field": vector_field,
            "query_vector": query_vector,
            "limit": limit,
            "distance_measure": distance_measure,
            "distance_result_field": distance_result_field,
        }
        return FakeVectorQuery(self.documents)


class FakeClient:
    def __init__(self):
        self.collection_ref = FakeCollection()

    def collection(self, _name):
        return self.collection_ref


def _load_firestore_service_module():
    fake_errors = ModuleType("app.errors")
    fake_errors.DatabaseServiceError = Exception

    fake_firestore = ModuleType("google.cloud.firestore")
    fake_firestore.SERVER_TIMESTAMP = object()
    fake_firestore.Client = lambda project=None: FakeClient()

    fake_google = ModuleType("google")
    fake_cloud = ModuleType("google.cloud")
    fake_cloud.firestore = fake_firestore

    fake_vector = ModuleType("google.cloud.firestore_v1.vector")
    fake_vector.Vector = FakeVector

    fake_base_vector_query = ModuleType(
        "google.cloud.firestore_v1.base_vector_query"
    )
    fake_base_vector_query.DistanceMeasure = FakeDistanceMeasure

    sys.modules.pop("app.services.firestore_service", None)
    with patch.dict(
        "sys.modules",
        {
            "google": fake_google,
            "google.cloud": fake_cloud,
            "google.cloud.firestore": fake_firestore,
            "google.cloud.firestore_v1.vector": fake_vector,
            "google.cloud.firestore_v1.base_vector_query": fake_base_vector_query,
            "app.errors": fake_errors,
        },
    ):
        import app.services.firestore_service as firestore_service_module

        return firestore_service_module


class FirestoreServiceTest(unittest.TestCase):
    def setUp(self):
        self.module = _load_firestore_service_module()
        self.module.settings = SimpleNamespace(
            project_id="project",
            docs_bucket="cloud-resume-ai-rag-docs",
            firestore_chunks_collection="document_chunks",
            rag_firestore_vector_field="embedding",
            rag_vector_search_distance_measure="COSINE",
        )
        self.service = self.module.FirestoreService()

    def test_search_document_chunks_by_vector_applies_exact_filters(self):
        chunks = self.service.search_document_chunks_by_vector(
            query_embedding=[1.0, 0.0],
            limit=20,
            metadata_filter={
                "project": "aws-gcp-rag-capstone",
                "doc_type": "state",
                "heading": "ignored server side",
            },
        )

        collection = self.service.client.collection_ref
        self.assertEqual(
            collection.filters,
            [
                ("doc_type", "==", "state"),
                ("project", "==", "aws-gcp-rag-capstone"),
            ],
        )
        self.assertEqual(collection.find_nearest_call["vector_field"], "embedding")
        self.assertEqual(collection.find_nearest_call["limit"], 20)
        self.assertEqual(
            collection.find_nearest_call["distance_measure"],
            FakeDistanceMeasure.COSINE,
        )
        self.assertEqual(
            collection.find_nearest_call["distance_result_field"],
            "_vector_distance",
        )
        self.assertEqual(chunks[0]["vector_distance"], 0.12)
        self.assertNotIn("_vector_distance", chunks[0])

    def test_add_document_chunk_writes_firestore_vector_type(self):
        document_id = self.service.add_document_chunk(
            file_name="CAPSTONE_PROJECT_STATE.md",
            chunk_index=0,
            chunk_text="Cloud Run",
            embedding=[1.0, 0.0],
            metadata={
                "parent_id": "parent-1",
                "child_id": "child-1",
                "parent_heading": "Architecture",
                "parent_section_path": "Overview > Architecture",
                "parent_chunk_summary": "Architecture summary",
                "parent_context": "# Architecture\nCloud Run",
            },
        )

        self.assertEqual(
            document_id,
            self.service.build_chunk_document_id("CAPSTONE_PROJECT_STATE.md", 0),
        )
        record = self.service.client.collection_ref.last_set_record
        self.assertIsInstance(record["embedding"], FakeVector)
        self.assertEqual(record["embedding"].value, (1.0, 0.0))
        self.assertEqual(record["parent_id"], "parent-1")
        self.assertEqual(record["child_id"], "child-1")
        self.assertEqual(record["parent_heading"], "Architecture")
        self.assertEqual(record["parent_section_path"], "Overview > Architecture")
        self.assertEqual(record["parent_chunk_summary"], "Architecture summary")
        self.assertEqual(record["parent_context"], "# Architecture\nCloud Run")


if __name__ == "__main__":
    unittest.main()

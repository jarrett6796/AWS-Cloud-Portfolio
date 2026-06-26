import sys
import unittest
from types import ModuleType, SimpleNamespace
from unittest.mock import patch


def _load_rag_service_module():
    fake_errors = ModuleType("app.errors")
    fake_errors.BackendServiceError = Exception
    fake_errors.RagServiceError = Exception

    fake_firestore_service = ModuleType("app.services.firestore_service")
    fake_firestore_service.firestore_service = SimpleNamespace()

    fake_gemini_service = ModuleType("app.services.gemini_service")
    fake_gemini_service.gemini_service = SimpleNamespace()

    fake_vector_service = ModuleType("app.services.vector_service")
    fake_vector_service.vector_service = SimpleNamespace()

    sys.modules.pop("app.services.rag_service", None)
    with patch.dict(
        "sys.modules",
        {
            "app.errors": fake_errors,
            "app.services.firestore_service": fake_firestore_service,
            "app.services.gemini_service": fake_gemini_service,
            "app.services.vector_service": fake_vector_service,
        },
    ):
        import app.services.rag_service as rag_service_module

        return rag_service_module


class FakeSettings:
    rag_top_k = 5
    rag_candidate_pool_size = 20
    rag_score_threshold = 0.2
    rag_hybrid_enabled = False
    rag_vector_score_weight = 0.8
    rag_rerank_enabled = False
    rag_rerank_keyword_weight = 0.1
    rag_query_rewrite_enabled = False
    rag_query_rewrite_history_limit = 6
    rag_query_rewrite_model = "gemini-2.5-flash"
    rag_multi_query_enabled = False
    rag_multi_query_count = 3
    rag_multi_query_model = "gemini-2.5-flash"
    rag_vector_search_backend = "local"
    rag_vector_search_limit = 20
    rag_vector_search_fallback_enabled = True
    rag_semantic_rerank_enabled = False
    rag_semantic_rerank_model = "gemini-2.5-flash"
    rag_semantic_rerank_top_n = 10
    rag_semantic_rerank_keep_k = 5
    rag_semantic_rerank_fallback_enabled = True
    rag_parent_child_enabled = False
    rag_parent_context_max_tokens = 1200
    rag_parent_context_fallback_enabled = True


class FakeFirestoreService:
    def __init__(self, stored_history=None, document_chunks=None):
        self.stored_history = stored_history or []
        self.document_chunks = document_chunks
        self.vector_search_error = None
        self.vector_search_calls = []
        self.saved_messages = []
        self.audit_messages = []
        self.analytics_records = []
        self.loaded_limits = []

    def create_session_id(self):
        return "generated-session"

    def load_recent_messages(self, session_id, limit=6):
        self.loaded_limits.append((session_id, limit))
        return self.stored_history

    def stream_document_chunks(self):
        if self.document_chunks is not None:
            return iter(self.document_chunks)

        return iter(
            [
                {
                    "project": "aws-gcp-rag-capstone",
                    "doc_type": "state",
                    "file_name": "CAPSTONE_PROJECT_STATE.md",
                    "chunk_index": 1,
                    "chunk_text": "The backend uses Cloud Run and Firestore.",
                    "embedding": [1.0, 0.0],
                    "heading": "Current Architecture",
                    "section_path": "Current Architecture",
                    "source_uri": "gs://cloud-resume-ai-rag-docs/CAPSTONE_PROJECT_STATE.md",
                    "version_id": "v1",
                    "parent_id": "parent-backend",
                    "child_id": "child-backend",
                    "parent_heading": "Current Architecture",
                    "parent_section_path": "Current Architecture",
                    "parent_chunk_summary": "Backend architecture summary",
                    "parent_context": (
                        "# Current Architecture\n"
                        "The backend uses Cloud Run and Firestore. "
                        "It exposes FastAPI RAG endpoints."
                    ),
                },
                {
                    "project": "aws-gcp-rag-capstone",
                    "doc_type": "development_log",
                    "file_name": "REACT_Frontend_Development_Log.md",
                    "chunk_index": 2,
                    "chunk_text": "The frontend uses React and Vite.",
                    "embedding": [0.5, 0.5],
                    "heading": "Frontend State",
                    "section_path": "Frontend State",
                    "source_uri": "gs://cloud-resume-ai-rag-docs/REACT_Frontend_Development_Log.md",
                    "version_id": "v2",
                }
            ]
        )

    def search_document_chunks_by_vector(
        self,
        query_embedding,
        limit,
        metadata_filter=None,
    ):
        self.vector_search_calls.append(
            {
                "query_embedding": query_embedding,
                "limit": limit,
                "metadata_filter": metadata_filter or {},
            }
        )
        if self.vector_search_error:
            raise self.vector_search_error

        return list(self.stream_document_chunks())

    def save_message(self, session_id, role, content, request_id=None):
        self.saved_messages.append(
            {
                "session_id": session_id,
                "role": role,
                "content": content,
                "request_id": request_id,
            }
        )

    def save_query_rewrite_audit_message(
        self,
        session_id,
        original_question,
        rewritten_query,
        rewrite_used,
        request_id=None,
    ):
        self.audit_messages.append(
            {
                "session_id": session_id,
                "role": "system",
                "event_type": "query_rewrite",
                "original_question": original_question,
                "rewritten_query": rewritten_query,
                "rewrite_used": rewrite_used,
                "request_id": request_id,
            }
        )

    def save_rag_analytics(self, analytics):
        self.analytics_records.append(analytics)
        return "analytics-1"

    def load_recent_rag_analytics(self, limit=100):
        self.loaded_analytics_limit = limit
        return self.analytics_records[:limit]


class FakeGeminiService:
    def __init__(
        self,
        rewrite_response=None,
        rewrite_error=None,
        multi_query_response=None,
        multi_query_error=None,
        semantic_rerank_response=None,
        semantic_rerank_error=None,
        answer_response=None,
        stream_tokens=None,
    ):
        self.rewrite_response = rewrite_response
        self.rewrite_error = rewrite_error
        self.multi_query_response = multi_query_response
        self.multi_query_error = multi_query_error
        self.semantic_rerank_response = semantic_rerank_response
        self.semantic_rerank_error = semantic_rerank_error
        self.answer_response = answer_response
        self.stream_tokens = stream_tokens
        self.embedded_texts = []
        self.generated_prompts = []

    def generate_text(
        self,
        contents,
        temperature,
        max_output_tokens,
        model=None,
    ):
        self.generated_prompts.append(
            {
                "contents": contents,
                "temperature": temperature,
                "max_output_tokens": max_output_tokens,
                "model": model,
            }
        )

        if max_output_tokens == 120:
            if self.rewrite_error:
                raise self.rewrite_error
            return self.rewrite_response or ""

        if max_output_tokens == 180:
            if self.multi_query_error:
                raise self.multi_query_error
            return self.multi_query_response or ""

        if max_output_tokens == 200:
            if self.semantic_rerank_error:
                raise self.semantic_rerank_error
            return self.semantic_rerank_response or ""

        return self.answer_response or "The backend uses Cloud Run FastAPI. [S1]"

    def stream_text(self, contents, temperature, max_output_tokens):
        for token in self.stream_tokens or ["The backend ", "uses Cloud Run. [S1]"]:
            yield token

    def embed_text(self, text):
        self.embedded_texts.append(text)
        if "frontend" in text.lower() or "react" in text.lower():
            return [0.5, 0.5]
        return [1.0, 0.0]


class FakeVectorService:
    def cosine_similarity(self, query_embedding, chunk_embedding):
        return sum(
            query_value * chunk_value
            for query_value, chunk_value in zip(query_embedding, chunk_embedding)
        )

    def keyword_score(self, query, chunk_text, heading=None):
        return 0.5 if "backend" in query.lower() else 0.0

    def hybrid_score(self, vector_score, keyword_score, vector_weight):
        return (vector_score * vector_weight) + (keyword_score * (1 - vector_weight))

    def select_relevant_chunks(
        self,
        scored_chunks,
        top_k,
        candidate_pool_size,
        score_threshold,
        rerank_enabled,
        rerank_keyword_weight,
    ):
        return scored_chunks[:top_k]




class BaseRagServiceTest(unittest.TestCase):
    def setUp(self):
        self.module = _load_rag_service_module()
        self.settings = FakeSettings()
        self.firestore = FakeFirestoreService()
        self.gemini = FakeGeminiService()
        self.vector = FakeVectorService()
        self.module.settings = self.settings
        self.module.firestore_service = self.firestore
        self.module.gemini_service = self.gemini
        self.module.vector_service = self.vector
        self.rag_service = self.module.RagService()

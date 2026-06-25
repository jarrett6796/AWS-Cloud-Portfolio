import json
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


class RagServiceTest(unittest.TestCase):
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

    def test_add_source_ids_uses_stable_ordered_labels(self):
        chunks = [
            {"file_name": "PROJECT_STATE.md", "chunk_index": 0},
            {"file_name": "PROJECT_STATE.md", "chunk_index": 1},
        ]

        labeled_chunks = self.rag_service._add_source_ids(chunks)

        self.assertEqual(labeled_chunks[0]["source_id"], "S1")
        self.assertEqual(labeled_chunks[1]["source_id"], "S2")

    def test_build_context_uses_source_ids_and_metadata(self):
        context = self.rag_service._build_context(
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

    def test_build_prompt_requires_source_id_citations(self):
        prompt = self.rag_service._build_prompt(
            question="Where does the backend run?",
            context="[S1] File: PROJECT_STATE.md\nCloud Run hosts the backend.",
        )

        self.assertIn("Every factual claim", prompt)
        self.assertIn("[S1] or [S2]", prompt)
        self.assertIn("Do not cite sources that are not listed", prompt)

    def test_validate_grounded_answer_allows_valid_source_citation(self):
        answer = self.rag_service._validate_grounded_answer(
            "The backend runs on Cloud Run. [S1]",
            [{"source_id": "S1"}],
        )

        self.assertEqual(answer, "The backend runs on Cloud Run. [S1]")

    def test_validate_grounded_answer_replaces_missing_citation(self):
        with self.assertLogs("app.services.rag_service", level="WARNING"):
            answer = self.rag_service._validate_grounded_answer(
                "The backend runs on Cloud Run.",
                [{"source_id": "S1"}],
            )

        self.assertEqual(
            answer,
            "I do not know based on the indexed project documents.",
        )

    def test_validate_grounded_answer_replaces_invalid_citation(self):
        with self.assertLogs("app.services.rag_service", level="WARNING"):
            answer = self.rag_service._validate_grounded_answer(
                "The backend runs on Cloud Run. [S99]",
                [{"source_id": "S1"}],
            )

        self.assertEqual(
            answer,
            "I do not know based on the indexed project documents.",
        )

    def test_validate_grounded_answer_allows_no_answer_without_citation(self):
        answer = self.rag_service._validate_grounded_answer(
            "I do not know based on the indexed project documents.",
            [{"source_id": "S1"}],
        )

        self.assertEqual(
            answer,
            "I do not know based on the indexed project documents.",
        )

    def test_build_history_context_keeps_recent_user_and_assistant_conversation(self):
        messages = [
            SimpleNamespace(role="user", content="What is the backend?"),
            SimpleNamespace(role="system", content="audit message"),
            SimpleNamespace(role="assistant", content="It runs on Cloud Run."),
        ]

        history_context = self.rag_service._build_history_context(messages)

        self.assertEqual(
            history_context,
            "user: What is the backend?\nassistant: It runs on Cloud Run.",
        )

    def test_build_prompt_marks_history_as_non_factual_source(self):
        prompt = self.rag_service._build_prompt(
            question="What about ingestion?",
            context="[S1] File: PROJECT_STATE.md\nIngestion is idempotent.",
            conversation_context="user: What about the backend?",
        )

        self.assertIn("<recent_conversation>", prompt)
        self.assertIn("Do not use conversation history as a factual source", prompt)

    def test_build_sources_preserves_debug_metadata(self):
        sources = self.rag_service._build_sources(
            [
                {
                    "project": "aws-gcp-rag-capstone",
                    "doc_type": "state",
                    "file_name": "CAPSTONE_PROJECT_STATE.md",
                    "chunk_index": 1,
                    "source_id": "S1",
                    "score": 0.9,
                    "vector_score": 0.8,
                    "vector_distance": 0.2,
                    "keyword_score": 0.7,
                    "rerank_score": None,
                    "content_hash": "abc",
                    "heading": "Current Stack",
                    "section_path": "Current Stack",
                    "source_uri": "gs://cloud-resume-ai-rag-docs/CAPSTONE_PROJECT_STATE.md",
                    "version_id": "v1",
                    "char_count": 123,
                }
            ]
        )

        self.assertEqual(
            sources[0],
            {
                "project": "aws-gcp-rag-capstone",
                "doc_type": "state",
                "file_name": "CAPSTONE_PROJECT_STATE.md",
                "chunk_index": 1,
                "source_id": "S1",
                "score": 0.9,
                "vector_score": 0.8,
                "vector_distance": 0.2,
                "keyword_score": 0.7,
                "rerank_score": None,
                "content_hash": "abc",
                "heading": "Current Stack",
                "section_path": "Current Stack",
                "source_uri": "gs://cloud-resume-ai-rag-docs/CAPSTONE_PROJECT_STATE.md",
                "version_id": "v1",
                "char_count": 123,
                "parent_id": None,
                "child_id": None,
                "parent_heading": None,
                "parent_section_path": None,
                "parent_chunk_summary": None,
                "parent_context_expanded": False,
                "parent_context_token_count": None,
                "semantic_rerank_applied": False,
                "semantic_rerank_position": None,
            },
        )

    def test_normalize_metadata_filter_ignores_empty_and_unknown_values(self):
        metadata_filter = self.rag_service._normalize_metadata_filter(
            {
                "file_name": " CAPSTONE_PROJECT_STATE.md ",
                "project": "aws-gcp-rag-capstone",
                "doc_type": " state ",
                "section_path": " Architecture ",
                "source_uri": " rag-docs ",
                "version_id": " abc123 ",
                "heading": "",
                "unknown": "ignored",
            }
        )

        self.assertEqual(
            metadata_filter,
            {
                "project": "aws-gcp-rag-capstone",
                "doc_type": "state",
                "file_name": "CAPSTONE_PROJECT_STATE.md",
                "section_path": "Architecture",
                "source_uri": "rag-docs",
                "version_id": "abc123",
            },
        )

    def test_metadata_matches_filters_by_supported_metadata_fields(self):
        chunk = {
            "project": "aws-gcp-rag-capstone",
            "doc_type": "state",
            "file_name": "CAPSTONE_PROJECT_STATE.md",
            "heading": "Current Architecture",
            "section_path": "Overview > Current Architecture",
            "source_uri": "gs://cloud-resume-ai-rag-docs/CAPSTONE_PROJECT_STATE.md",
            "version_id": "abc123",
        }

        self.assertTrue(
            self.rag_service._metadata_matches(
                chunk,
                {
                    "project": "aws-gcp-rag-capstone",
                    "doc_type": "state",
                    "file_name": "CAPSTONE_PROJECT_STATE.md",
                    "heading": "architecture",
                    "section_path": "overview",
                    "source_uri": "rag-docs",
                    "version_id": "abc123",
                },
            )
        )
        self.assertFalse(
            self.rag_service._metadata_matches(
                chunk,
                {"file_name": "Other.md"},
            )
        )
        self.assertFalse(
            self.rag_service._metadata_matches(
                chunk,
                {"section_path": "deployment"},
            )
        )
        self.assertFalse(
            self.rag_service._metadata_matches(
                chunk,
                {"doc_type": "implementation"},
            )
        )

    def test_parse_multi_query_response_cleans_numbered_and_bulleted_lines(self):
        queries = self.rag_service._parse_multi_query_response(
            """
            1. Cloud Run backend retrieval
            - React frontend deployment
            * Firestore chat memory
            """
        )

        self.assertEqual(
            queries,
            [
                "Cloud Run backend retrieval",
                "React frontend deployment",
                "Firestore chat memory",
            ],
        )

    def test_dedupe_queries_preserves_first_case_insensitive_match(self):
        queries = self.rag_service._dedupe_queries(
            [
                "Cloud Run backend",
                "cloud run backend",
                "React frontend",
                "",
            ]
        )

        self.assertEqual(queries, ["Cloud Run backend", "React frontend"])

    def test_format_sse_outputs_event_and_json_data(self):
        event = self.rag_service._format_sse("token", {"text": "Hello"})

        self.assertEqual(event, 'event: token\ndata: {"text": "Hello"}\n\n')

    def test_get_analytics_summary_aggregates_recent_metadata_records(self):
        self.firestore.analytics_records = [
            {
                "duration_ms": 100,
                "source_count": 2,
                "source_file_names": ["CAPSTONE_PROJECT_STATE.md"],
                "no_answer": False,
                "citation_validation_blocked_answer": False,
                "query_rewritten": True,
                "retrieval_query_count": 2,
                "metadata_filter_enabled": False,
                "response_mode": "sync",
            },
            {
                "duration_ms": 50,
                "source_count": 0,
                "source_file_names": [],
                "no_answer": True,
                "citation_validation_blocked_answer": True,
                "query_rewritten": False,
                "retrieval_query_count": 1,
                "metadata_filter_enabled": True,
                "response_mode": "stream",
            },
        ]

        summary = self.rag_service.get_analytics_summary(limit=1000)

        self.assertEqual(self.firestore.loaded_analytics_limit, 500)
        self.assertEqual(summary["record_count"], 2)
        self.assertEqual(summary["average_duration_ms"], 75)
        self.assertEqual(summary["average_source_count"], 1)
        self.assertEqual(summary["no_answer_rate"], 0.5)
        self.assertEqual(summary["citation_validation_block_rate"], 0.5)
        self.assertEqual(summary["query_rewrite_rate"], 0.5)
        self.assertEqual(summary["multi_query_rate"], 0.5)
        self.assertEqual(summary["metadata_filter_rate"], 0.5)
        self.assertEqual(summary["streaming_rate"], 0.5)
        self.assertEqual(
            summary["top_source_file_names"],
            [{"file_name": "CAPSTONE_PROJECT_STATE.md", "count": 1}],
        )

    def test_get_analytics_summary_handles_empty_records(self):
        summary = self.rag_service.get_analytics_summary(limit=0)

        self.assertEqual(self.firestore.loaded_analytics_limit, 100)
        self.assertEqual(summary["record_count"], 0)
        self.assertEqual(summary["average_duration_ms"], 0)
        self.assertEqual(summary["no_answer_rate"], 0)

    def test_query_rewriting_disabled_uses_original_question_and_no_audit(self):
        result = self.rag_service.answer_question(
            "What about the backend?",
            session_id="session-1",
            request_id="request-1",
        )

        self.assertEqual(self.gemini.embedded_texts, ["What about the backend?"])
        self.assertEqual(self.firestore.audit_messages, [])
        self.assertEqual(self.firestore.saved_messages[0]["role"], "user")
        self.assertEqual(
            self.firestore.saved_messages[0]["content"],
            "What about the backend?",
        )
        self.assertEqual(result["retrieval_query"], "What about the backend?")
        self.assertFalse(result["query_rewritten"])

    def test_answer_question_saves_metadata_only_rag_analytics(self):
        result = self.rag_service.answer_question(
            "What about the backend?",
            session_id="session-analytics",
            request_id="request-analytics",
        )

        self.assertEqual(len(self.firestore.analytics_records), 1)
        analytics = self.firestore.analytics_records[0]
        self.assertEqual(analytics["session_id"], "session-analytics")
        self.assertEqual(analytics["request_id"], "request-analytics")
        self.assertEqual(analytics["response_mode"], "sync")
        self.assertEqual(analytics["question_length"], len("What about the backend?"))
        self.assertEqual(analytics["answer_length"], len(result["answer"]))
        self.assertEqual(analytics["source_count"], len(result["sources"]))
        self.assertEqual(analytics["retrieval_query_count"], 1)
        self.assertFalse(analytics["query_rewritten"])
        self.assertFalse(analytics["metadata_filter_enabled"])
        self.assertEqual(analytics["retrieval_backend"], "local")
        self.assertFalse(analytics["no_answer"])
        self.assertNotIn("question", analytics)
        self.assertNotIn("answer", analytics)
        self.assertNotIn("prompt", analytics)

    def test_analytics_write_failure_does_not_break_answer(self):
        def fail_analytics_write(_analytics):
            raise RuntimeError("analytics unavailable")

        self.firestore.save_rag_analytics = fail_analytics_write

        with self.assertLogs("app.services.rag_service", level="WARNING"):
            result = self.rag_service.answer_question(
                "What about the backend?",
                session_id="session-analytics-failure",
            )

        self.assertEqual(result["answer"], "The backend uses Cloud Run FastAPI. [S1]")

    def test_query_rewriting_enabled_uses_rewritten_query_and_stores_audit(self):
        self.settings.rag_query_rewrite_enabled = True
        self.firestore.stored_history = [
            {"role": "user", "content": "Explain my RAG architecture."},
            {"role": "assistant", "content": "It uses Cloud Run and Firestore."},
        ]
        self.gemini.rewrite_response = (
            "What backend architecture is used in the GCP RAG capstone project?"
        )

        result = self.rag_service.answer_question(
            "What about the backend?",
            session_id="session-2",
            request_id="request-2",
        )

        self.assertEqual(
            self.gemini.embedded_texts,
            ["What backend architecture is used in the GCP RAG capstone project?"],
        )
        self.assertEqual(self.firestore.saved_messages[0]["role"], "user")
        self.assertEqual(
            self.firestore.saved_messages[0]["content"],
            "What about the backend?",
        )
        self.assertEqual(
            self.firestore.audit_messages,
            [
                {
                    "session_id": "session-2",
                    "role": "system",
                    "event_type": "query_rewrite",
                    "original_question": "What about the backend?",
                    "rewritten_query": (
                        "What backend architecture is used in the GCP RAG capstone project?"
                    ),
                    "rewrite_used": True,
                    "request_id": "request-2",
                }
            ],
        )
        self.assertTrue(result["query_rewritten"])

    def test_standalone_question_does_not_store_unnecessary_audit(self):
        self.settings.rag_query_rewrite_enabled = True
        self.gemini.rewrite_response = "Explain my GCP RAG architecture."

        result = self.rag_service.answer_question(
            "Explain my GCP RAG architecture.",
            session_id="session-3",
        )

        self.assertEqual(
            self.gemini.embedded_texts,
            ["Explain my GCP RAG architecture."],
        )
        self.assertEqual(self.firestore.audit_messages, [])
        self.assertFalse(result["query_rewritten"])

    def test_rewrite_failure_falls_back_to_original_question(self):
        self.settings.rag_query_rewrite_enabled = True
        self.gemini.rewrite_error = RuntimeError("rewrite timeout")

        with self.assertLogs("app.services.rag_service", level="WARNING"):
            result = self.rag_service.answer_question(
                "How does it work?",
                session_id="session-4",
            )

        self.assertEqual(self.gemini.embedded_texts, ["How does it work?"])
        self.assertEqual(self.firestore.audit_messages, [])
        self.assertEqual(result["answer"], "The backend uses Cloud Run FastAPI. [S1]")
        self.assertFalse(result["query_rewritten"])

    def test_multi_query_enabled_embeds_variants_and_dedupes_chunks(self):
        self.settings.rag_multi_query_enabled = True
        self.settings.rag_multi_query_count = 3
        self.gemini.multi_query_response = (
            "React frontend deployment\nCloud Run backend architecture"
        )

        result = self.rag_service.answer_question(
            "Explain the architecture.",
            session_id="session-multi-query",
        )

        self.assertEqual(
            self.gemini.embedded_texts,
            [
                "Explain the architecture.",
                "React frontend deployment",
                "Cloud Run backend architecture",
            ],
        )
        source_keys = {
            (source["file_name"], source["chunk_index"])
            for source in result["sources"]
        }
        self.assertEqual(len(result["sources"]), len(source_keys))
        self.assertEqual(len(result["sources"]), 2)

    def test_multi_query_failure_falls_back_to_original_query(self):
        self.settings.rag_multi_query_enabled = True
        self.gemini.multi_query_error = RuntimeError("multi-query timeout")

        with self.assertLogs("app.services.rag_service", level="WARNING"):
            result = self.rag_service.answer_question(
                "Explain the backend.",
                session_id="session-multi-query-fallback",
            )

        self.assertEqual(self.gemini.embedded_texts, ["Explain the backend."])
        self.assertEqual(result["answer"], "The backend uses Cloud Run FastAPI. [S1]")

    def test_semantic_reranker_reorders_candidates_before_source_ids(self):
        self.settings.rag_semantic_rerank_enabled = True
        self.settings.rag_semantic_rerank_top_n = 2
        self.settings.rag_semantic_rerank_keep_k = 2
        self.gemini.semantic_rerank_response = "C2\nC1"
        self.gemini.answer_response = "The frontend uses React and Vite. [S1]"

        result = self.rag_service.answer_question(
            "What is the frontend?",
            session_id="session-semantic-rerank",
        )

        semantic_prompt = self.gemini.generated_prompts[0]["contents"]
        self.assertIn("Rank the retrieved chunks", semantic_prompt)
        self.assertIn("ID: C1", semantic_prompt)
        self.assertIn("ID: C2", semantic_prompt)
        self.assertEqual(
            result["sources"][0]["file_name"],
            "REACT_Frontend_Development_Log.md",
        )
        self.assertEqual(result["sources"][0]["source_id"], "S1")
        self.assertTrue(result["sources"][0]["semantic_rerank_applied"])
        self.assertEqual(result["sources"][0]["semantic_rerank_position"], 1)
        self.assertTrue(
            self.firestore.analytics_records[0]["semantic_rerank_applied"]
        )
        self.assertNotIn("prompt", self.firestore.analytics_records[0])

    def test_semantic_reranker_failure_falls_back_to_original_order(self):
        self.settings.rag_semantic_rerank_enabled = True
        self.settings.rag_semantic_rerank_top_n = 2
        self.settings.rag_semantic_rerank_keep_k = 2
        self.gemini.semantic_rerank_error = RuntimeError("rerank timeout")

        with self.assertLogs("app.services.rag_service", level="WARNING"):
            result = self.rag_service.answer_question(
                "What about the backend?",
                session_id="session-semantic-rerank-fallback",
            )

        self.assertEqual(result["sources"][0]["file_name"], "CAPSTONE_PROJECT_STATE.md")
        self.assertFalse(result["sources"][0]["semantic_rerank_applied"])
        self.assertFalse(
            self.firestore.analytics_records[0]["semantic_rerank_applied"]
        )

    def test_parent_context_expansion_uses_parent_text_without_changing_source_id(self):
        self.settings.rag_parent_child_enabled = True
        self.settings.rag_parent_context_max_tokens = 8

        result = self.rag_service.answer_question(
            "What about the backend?",
            session_id="session-parent-context",
        )

        answer_prompt = self.gemini.generated_prompts[-1]["contents"]
        self.assertIn("# Current Architecture The backend uses Cloud", answer_prompt)
        self.assertIn("[S1] File: CAPSTONE_PROJECT_STATE.md", answer_prompt)
        self.assertEqual(result["sources"][0]["source_id"], "S1")
        self.assertEqual(result["sources"][0]["parent_id"], "parent-backend")
        self.assertTrue(result["sources"][0]["parent_context_expanded"])
        self.assertEqual(result["sources"][0]["parent_context_token_count"], 8)
        self.assertEqual(
            self.firestore.analytics_records[0]["parent_context_expanded_count"],
            1,
        )

    def test_answer_question_returns_no_answer_when_no_chunks_are_selected(self):
        self.firestore.document_chunks = []

        result = self.rag_service.answer_question(
            "What is the backend?",
            session_id="session-no-context",
        )

        self.assertEqual(
            result["answer"],
            "I do not know based on the indexed project documents.",
        )
        self.assertEqual(result["sources"], [])
        self.assertEqual(len(self.gemini.generated_prompts), 0)
        self.assertEqual(self.firestore.saved_messages[1]["content"], result["answer"])
        self.assertTrue(self.firestore.analytics_records[0]["no_answer"])
        self.assertFalse(
            self.firestore.analytics_records[0]["citation_validation_blocked_answer"]
        )

    def test_answer_question_replaces_uncited_generated_answer(self):
        self.gemini.answer_response = "The backend runs on Cloud Run."

        with self.assertLogs("app.services.rag_service", level="WARNING"):
            result = self.rag_service.answer_question(
                "What is the backend?",
                session_id="session-uncited-answer",
            )

        self.assertEqual(
            result["answer"],
            "I do not know based on the indexed project documents.",
        )
        self.assertEqual(self.firestore.saved_messages[1]["content"], result["answer"])
        self.assertTrue(
            self.firestore.analytics_records[0]["citation_validation_blocked_answer"]
        )

    def test_answer_question_filters_retrieval_by_file_name(self):
        result = self.rag_service.answer_question(
            "What is the frontend?",
            session_id="session-filter-file",
            metadata_filter={"file_name": "REACT_Frontend_Development_Log.md"},
        )

        self.assertEqual(len(result["sources"]), 1)
        self.assertEqual(
            result["sources"][0]["file_name"],
            "REACT_Frontend_Development_Log.md",
        )

    def test_answer_question_filters_retrieval_by_doc_type(self):
        result = self.rag_service.answer_question(
            "What is the frontend?",
            session_id="session-filter-doc-type",
            metadata_filter={"doc_type": "development_log"},
        )

        self.assertEqual(len(result["sources"]), 1)
        self.assertEqual(result["sources"][0]["doc_type"], "development_log")

    def test_answer_question_filters_retrieval_by_section_path(self):
        result = self.rag_service.answer_question(
            "What is the backend?",
            session_id="session-filter-section-path",
            metadata_filter={"section_path": "current architecture"},
        )

        self.assertEqual(len(result["sources"]), 1)
        self.assertEqual(
            result["sources"][0]["section_path"],
            "Current Architecture",
        )

    def test_answer_question_filters_retrieval_by_source_uri(self):
        result = self.rag_service.answer_question(
            "What is the frontend?",
            session_id="session-filter-source-uri",
            metadata_filter={"source_uri": "react_frontend"},
        )

        self.assertEqual(len(result["sources"]), 1)
        self.assertEqual(
            result["sources"][0]["file_name"],
            "REACT_Frontend_Development_Log.md",
        )

    def test_answer_question_filters_retrieval_by_version_id(self):
        result = self.rag_service.answer_question(
            "What is the backend?",
            session_id="session-filter-version-id",
            metadata_filter={"version_id": "v1"},
        )

        self.assertEqual(len(result["sources"]), 1)
        self.assertEqual(result["sources"][0]["version_id"], "v1")

    def test_answer_question_returns_no_answer_when_filter_removes_all_chunks(self):
        result = self.rag_service.answer_question(
            "What is the backend?",
            session_id="session-filter-empty",
            metadata_filter={"file_name": "Missing.md"},
        )

        self.assertEqual(result["sources"], [])
        self.assertEqual(
            result["answer"],
            "I do not know based on the indexed project documents.",
        )
        self.assertEqual(len(self.gemini.generated_prompts), 0)

    def test_rewriter_uses_user_assistant_history_not_system_audit_records(self):
        self.settings.rag_query_rewrite_enabled = True
        self.firestore.stored_history = [
            {"role": "user", "content": "Explain my RAG architecture."},
            {
                "role": "system",
                "event_type": "query_rewrite",
                "rewritten_query": "Internal audit text that should be hidden.",
            },
            {"role": "assistant", "content": "It uses Cloud Run."},
        ]
        self.gemini.rewrite_response = "How does Cloud Run work in this RAG project?"

        self.rag_service.answer_question(
            "How does it work?",
            session_id="session-5",
        )

        rewrite_prompt = self.gemini.generated_prompts[0]["contents"]
        self.assertIn("user: Explain my RAG architecture.", rewrite_prompt)
        self.assertIn("assistant: It uses Cloud Run.", rewrite_prompt)
        self.assertNotIn("Internal audit text", rewrite_prompt)

    def test_streaming_emits_metadata_token_and_done_with_rewrite_fields(self):
        self.settings.rag_query_rewrite_enabled = True
        self.gemini.rewrite_response = "What backend architecture is used?"

        events = list(
            self.rag_service.stream_answer(
                "What about the backend?",
                session_id="session-6",
            )
        )

        metadata_event = events[0]
        self.assertTrue(metadata_event.startswith("event: metadata"))
        metadata = json.loads(metadata_event.split("data: ", 1)[1])
        self.assertEqual(metadata["question"], "What about the backend?")
        self.assertEqual(metadata["retrieval_query"], "What backend architecture is used?")
        self.assertTrue(metadata["query_rewritten"])
        self.assertTrue(any(event.startswith("event: token") for event in events))
        self.assertTrue(events[-1].startswith("event: done"))

    def test_streaming_filters_metadata_sources_by_heading(self):
        events = list(
            self.rag_service.stream_answer(
                "What is the frontend?",
                session_id="session-stream-filter-heading",
                metadata_filter={"heading": "frontend"},
            )
        )

        metadata = json.loads(events[0].split("data: ", 1)[1])
        self.assertEqual(len(metadata["sources"]), 1)
        self.assertEqual(
            metadata["sources"][0]["heading"],
            "Frontend State",
        )
        self.assertEqual(self.firestore.analytics_records[0]["response_mode"], "stream")
        self.assertTrue(self.firestore.analytics_records[0]["metadata_filter_enabled"])

    def test_streaming_replaces_uncited_generated_answer_before_saving(self):
        self.gemini.stream_tokens = ["The backend runs on Cloud Run."]

        with self.assertLogs("app.services.rag_service", level="WARNING"):
            events = list(
                self.rag_service.stream_answer(
                    "What is the backend?",
                    session_id="session-stream-uncited",
                )
            )

        token_text = "".join(
            json.loads(event.split("data: ", 1)[1])["text"]
            for event in events
            if event.startswith("event: token")
        )
        self.assertEqual(
            token_text,
            "I do not know based on the indexed project documents.",
        )
        self.assertEqual(self.firestore.saved_messages[1]["content"], token_text)

    def test_firestore_vector_backend_uses_vector_search_and_records_analytics(self):
        self.settings.rag_vector_search_backend = "firestore_vector"

        result = self.rag_service.answer_question(
            "What about the backend?",
            session_id="session-vector",
            metadata_filter={"project": "aws-gcp-rag-capstone"},
        )

        self.assertEqual(len(self.firestore.vector_search_calls), 1)
        self.assertEqual(
            self.firestore.vector_search_calls[0]["metadata_filter"],
            {"project": "aws-gcp-rag-capstone"},
        )
        self.assertEqual(result["sources"][0]["file_name"], "CAPSTONE_PROJECT_STATE.md")
        self.assertEqual(
            self.firestore.analytics_records[0]["retrieval_backend"],
            "firestore_vector",
        )

    def test_firestore_vector_failure_falls_back_to_local_scan(self):
        self.settings.rag_vector_search_backend = "firestore_vector"
        self.settings.rag_vector_search_fallback_enabled = True
        self.firestore.vector_search_error = RuntimeError("missing vector index")

        with self.assertLogs("app.services.rag_service", level="WARNING"):
            result = self.rag_service.answer_question(
                "What about the backend?",
                session_id="session-vector-fallback",
            )

        self.assertEqual(len(self.firestore.vector_search_calls), 1)
        self.assertEqual(result["sources"][0]["file_name"], "CAPSTONE_PROJECT_STATE.md")
        self.assertEqual(
            self.firestore.analytics_records[0]["retrieval_backend"],
            "firestore_vector_fallback",
        )

    def test_analytics_summary_counts_retrieval_backends(self):
        self.firestore.analytics_records = [
            {"retrieval_backend": "local"},
            {"retrieval_backend": "firestore_vector"},
            {"retrieval_backend": "firestore_vector"},
        ]

        summary = self.rag_service.get_analytics_summary()

        self.assertEqual(
            summary["retrieval_backend_counts"],
            {"firestore_vector": 2, "local": 1},
        )


if __name__ == "__main__":
    unittest.main()

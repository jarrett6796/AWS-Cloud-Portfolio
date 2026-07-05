import logging
import json
import re
import time
from dataclasses import dataclass

from app.config.settings import settings
from app.errors import BackendServiceError, RagServiceError
from app.services.firestore_service import firestore_service
from app.services.gemini_service import gemini_service
from app.services.rag_analytics_helpers import (
    build_analytics_summary,
    build_rag_analytics_payload,
    is_no_answer,
)
from app.services.rag_prompt_builder import (
    build_context,
    build_history_context,
    build_multi_query_prompt,
    build_query_rewrite_prompt,
    build_rag_prompt,
    build_semantic_rerank_prompt,
    parse_multi_query_response,
)
from app.services.rag_policy import evaluate_policy
from app.services.rag_router import (
    ROUTE_CLARIFY,
    ROUTE_DIRECT,
    ROUTE_REFUSE,
    route_query,
)
from app.services.vector_service import vector_service


logger = logging.getLogger(__name__)
_SOURCE_CITATION_GROUP_PATTERN = re.compile(r"\[([^\[\]]*)\]")
_SOURCE_ID_PATTERN = re.compile(r"S\d+")
_NO_ANSWER_TEXT = "I do not know based on the indexed project documents."
_EXACT_METADATA_FILTER_FIELDS = {"project", "doc_type", "file_name", "version_id"}
_TEXT_METADATA_FILTER_FIELDS = {"heading", "section_path", "source_uri"}
_SUPPORTED_METADATA_FILTER_FIELDS = (
    _EXACT_METADATA_FILTER_FIELDS | _TEXT_METADATA_FILTER_FIELDS
)
_RETRIEVAL_BACKEND_LOCAL = "local"
_RETRIEVAL_BACKEND_FIRESTORE_VECTOR = "firestore_vector"
_RETRIEVAL_BACKEND_FIRESTORE_VECTOR_FALLBACK = "firestore_vector_fallback"


def _extract_cited_source_ids(answer: str) -> set[str]:
    cited_source_ids = set()

    for citation_group in _SOURCE_CITATION_GROUP_PATTERN.findall(answer or ""):
        cited_source_ids.update(_SOURCE_ID_PATTERN.findall(citation_group))

    return cited_source_ids


@dataclass(frozen=True)
class QueryRewriteResult:
    original_question: str
    retrieval_query: str
    query_rewritten: bool
    rewrite_used: bool


class RagService:
    def get_analytics_summary(self, limit: int = 100) -> dict:
        safe_limit = min(max(int(limit or 100), 1), 500)
        analytics_records = firestore_service.load_recent_rag_analytics(
            limit=safe_limit,
        )
        return build_analytics_summary(
            analytics_records,
            safe_limit,
            _RETRIEVAL_BACKEND_LOCAL,
        )

    def answer_question(
        self,
        question: str,
        history=None,
        session_id=None,
        metadata_filter=None,
        request_id=None,
    ):
        try:
            start_time = time.perf_counter()
            active_session_id = session_id or firestore_service.create_session_id()
            policy_response = self._apply_policy_route_precheck(
                question,
                history or [],
                active_session_id,
            )
            if policy_response is not None:
                return policy_response

            rag_context = self._prepare_rag_context(
                question,
                history or [],
                active_session_id,
                metadata_filter=metadata_filter,
            )
            if rag_context["has_retrieval_context"]:
                answer = gemini_service.generate_text(
                    contents=rag_context["prompt"],
                    temperature=0.2,
                    max_output_tokens=800,
                )
                answer = self._validate_grounded_answer(
                    answer,
                    rag_context["top_chunks"],
                    request_id=request_id,
                )
            else:
                answer = _NO_ANSWER_TEXT
            firestore_service.save_message(
                active_session_id,
                "user",
                question,
                request_id=request_id,
            )
            self._save_query_rewrite_audit_if_used(
                active_session_id,
                rag_context["query_rewrite"],
                request_id=request_id,
            )
            firestore_service.save_message(
                active_session_id,
                "assistant",
                answer,
                request_id=request_id,
            )
            self._save_rag_analytics(
                question=question,
                answer=answer,
                session_id=active_session_id,
                rag_context=rag_context,
                request_id=request_id,
                response_mode="sync",
                duration_ms=self._elapsed_ms(start_time),
            )

            logger.info(
                "rag_answer_completed",
                extra={
                    "session_id": active_session_id,
                    "request_id": request_id,
                    "question_length": len(question),
                    "answer_length": len(answer or ""),
                    "source_count": len(rag_context["top_chunks"]),
                },
            )

            return {
                "question": question,
                "answer": answer,
                "session_id": active_session_id,
                "sources": rag_context["sources"],
                "retrieval_query": rag_context["query_rewrite"].retrieval_query,
                "query_rewritten": rag_context["query_rewrite"].query_rewritten,
            }
        except BackendServiceError:
            raise
        except Exception as error:
            raise RagServiceError(error) from error

    def _apply_policy_route_precheck(
        self,
        question: str,
        history,
        session_id: str,
    ) -> dict | None:
        has_conversation_context = bool(self._filter_visible_history(history))
        route_decision = route_query(
            question,
            has_conversation_context=has_conversation_context,
        )

        if route_decision.route not in {ROUTE_REFUSE, ROUTE_DIRECT, ROUTE_CLARIFY}:
            return None

        policy_decision = evaluate_policy(
            question,
            has_conversation_context=has_conversation_context,
        )
        return self._build_policy_response(
            question=question,
            answer=policy_decision.user_message or _NO_ANSWER_TEXT,
            session_id=session_id,
        )

    def _build_policy_response(
        self,
        question: str,
        answer: str,
        session_id: str,
    ) -> dict:
        return {
            "question": question,
            "answer": answer,
            "session_id": session_id,
            "sources": [],
            "retrieval_query": question,
            "query_rewritten": False,
        }

    def stream_answer(
        self,
        question: str,
        history=None,
        session_id=None,
        metadata_filter=None,
        request_id=None,
    ):
        try:
            start_time = time.perf_counter()
            active_session_id = session_id or firestore_service.create_session_id()
            policy_response = self._apply_policy_route_precheck(
                question,
                history or [],
                active_session_id,
            )
            if policy_response is not None:
                yield from self._stream_policy_route_response(policy_response)
                return

            rag_context = self._prepare_rag_context(
                question,
                history or [],
                active_session_id,
                metadata_filter=metadata_filter,
            )

            yield self._format_sse(
                "metadata",
                {
                    "question": question,
                    "retrieval_query": rag_context["query_rewrite"].retrieval_query,
                    "query_rewritten": rag_context["query_rewrite"].query_rewritten,
                    "session_id": active_session_id,
                    "sources": rag_context["sources"],
                },
            )

            answer_parts = []
            if rag_context["has_retrieval_context"]:
                for token in gemini_service.stream_text(
                    contents=rag_context["prompt"],
                    temperature=0.2,
                    max_output_tokens=800,
                ):
                    answer_parts.append(token)

                answer = self._validate_grounded_answer(
                    "".join(answer_parts),
                    rag_context["top_chunks"],
                    request_id=request_id,
                )
            else:
                answer = _NO_ANSWER_TEXT

            for token in self._chunk_answer_for_sse(answer):
                yield self._format_sse("token", {"text": token})

            firestore_service.save_message(
                active_session_id,
                "user",
                question,
                request_id=request_id,
            )
            self._save_query_rewrite_audit_if_used(
                active_session_id,
                rag_context["query_rewrite"],
                request_id=request_id,
            )
            firestore_service.save_message(
                active_session_id,
                "assistant",
                answer,
                request_id=request_id,
            )
            self._save_rag_analytics(
                question=question,
                answer=answer,
                session_id=active_session_id,
                rag_context=rag_context,
                request_id=request_id,
                response_mode="stream",
                duration_ms=self._elapsed_ms(start_time),
            )
            yield self._format_sse("done", {"status": "complete"})
        except BackendServiceError as error:
            yield self._format_sse(
                "error",
                {
                    "error": error.error_code,
                    "message": error.public_message,
                },
            )
        except Exception as error:
            logger.error("rag_stream_failed")
            wrapped_error = RagServiceError(error)
            yield self._format_sse(
                "error",
                {
                    "error": wrapped_error.error_code,
                    "message": wrapped_error.public_message,
                },
            )

    def _stream_policy_route_response(self, policy_response: dict):
        yield self._format_sse(
            "metadata",
            {
                "question": policy_response["question"],
                "retrieval_query": policy_response["retrieval_query"],
                "query_rewritten": policy_response["query_rewritten"],
                "session_id": policy_response["session_id"],
                "sources": policy_response["sources"],
            },
        )

        for token in self._chunk_answer_for_sse(policy_response["answer"]):
            yield self._format_sse("token", {"text": token})

        yield self._format_sse("done", {"status": "complete"})

    def _prepare_rag_context(
        self,
        question: str,
        history,
        session_id: str,
        metadata_filter=None,
    ):
        history_limit = max(
            6,
            settings.rag_query_rewrite_history_limit,
        )
        stored_history = firestore_service.load_recent_messages(
            session_id,
            limit=history_limit,
        )
        visible_stored_history = self._filter_visible_history(stored_history)
        fallback_history = self._filter_visible_history(history)
        active_history = visible_stored_history or fallback_history
        query_rewrite = self._rewrite_query_if_needed(question, active_history)
        normalized_metadata_filter = self._normalize_metadata_filter(metadata_filter)
        logger.info(
            "rag_answer_started",
            extra={
                "session_id": session_id,
                "question_length": len(question),
                "history_turn_count": len(active_history),
                "stored_history_turn_count": len(stored_history),
                "fallback_history_turn_count": 0 if stored_history else len(history),
                "top_k": settings.rag_top_k,
                "candidate_pool_size": settings.rag_candidate_pool_size,
                "score_threshold": settings.rag_score_threshold,
                "hybrid_enabled": settings.rag_hybrid_enabled,
                "vector_score_weight": settings.rag_vector_score_weight,
                "rerank_enabled": settings.rag_rerank_enabled,
                "rerank_keyword_weight": settings.rag_rerank_keyword_weight,
                "semantic_rerank_enabled": settings.rag_semantic_rerank_enabled,
                "semantic_rerank_top_n": settings.rag_semantic_rerank_top_n,
                "semantic_rerank_keep_k": settings.rag_semantic_rerank_keep_k,
                "parent_child_enabled": settings.rag_parent_child_enabled,
                "parent_context_max_tokens": settings.rag_parent_context_max_tokens,
                "query_rewrite_enabled": settings.rag_query_rewrite_enabled,
                "query_rewritten": query_rewrite.query_rewritten,
                "retrieval_query_length": len(query_rewrite.retrieval_query),
                "metadata_filter_enabled": bool(normalized_metadata_filter),
                "metadata_filter_keys": sorted(normalized_metadata_filter.keys()),
            },
        )

        retrieval_query = query_rewrite.retrieval_query
        retrieval_queries = self._build_retrieval_queries(retrieval_query, active_history)
        query_embeddings = [
            {
                "query": candidate_query,
                "embedding": gemini_service.embed_text(candidate_query),
            }
            for candidate_query in retrieval_queries
        ]
        logger.info(
            "rag_multi_query_prepared",
            extra={
                "multi_query_enabled": settings.rag_multi_query_enabled,
                "retrieval_query_count": len(retrieval_queries),
            },
        )

        scored_chunks, retrieval_backend, filtered_document_count = (
            self._retrieve_scored_chunks(
                query_embeddings,
                normalized_metadata_filter,
            )
        )

        retrieval_top_k = self._retrieval_top_k()
        top_chunks = vector_service.select_relevant_chunks(
            scored_chunks,
            top_k=retrieval_top_k,
            candidate_pool_size=settings.rag_candidate_pool_size,
            score_threshold=settings.rag_score_threshold,
            rerank_enabled=settings.rag_rerank_enabled,
            rerank_keyword_weight=settings.rag_rerank_keyword_weight,
        )
        top_chunks = self._semantic_rerank_chunks(
            query=retrieval_query,
            chunks=top_chunks,
        )
        top_chunks = self._add_source_ids(top_chunks)
        top_chunks = self._expand_parent_context(top_chunks)
        logger.info(
            "rag_retrieval_completed",
            extra={
                "candidate_count": len(scored_chunks),
                "top_k": settings.rag_top_k,
                "retrieval_top_k": retrieval_top_k,
                "candidate_pool_size": settings.rag_candidate_pool_size,
                "score_threshold": settings.rag_score_threshold,
                "hybrid_enabled": settings.rag_hybrid_enabled,
                "vector_score_weight": settings.rag_vector_score_weight,
                "rerank_enabled": settings.rag_rerank_enabled,
                "rerank_keyword_weight": settings.rag_rerank_keyword_weight,
                "semantic_rerank_enabled": settings.rag_semantic_rerank_enabled,
                "semantic_rerank_top_n": settings.rag_semantic_rerank_top_n,
                "semantic_rerank_keep_k": settings.rag_semantic_rerank_keep_k,
                "semantic_rerank_applied": any(
                    chunk.get("semantic_rerank_applied") for chunk in top_chunks
                ),
                "parent_child_enabled": settings.rag_parent_child_enabled,
                "parent_context_expanded_count": sum(
                    1 for chunk in top_chunks if chunk.get("parent_context_expanded")
                ),
                "source_count": len(top_chunks),
                "metadata_filter_enabled": bool(normalized_metadata_filter),
                "documents_filtered_by_metadata": filtered_document_count,
                "multi_query_enabled": settings.rag_multi_query_enabled,
                "retrieval_query_count": len(retrieval_queries),
                "deduped_candidate_count": len(scored_chunks),
                "retrieval_backend": retrieval_backend,
            },
        )

        context = build_context(top_chunks)
        conversation_context = build_history_context(active_history)
        prompt = build_rag_prompt(question, context, conversation_context)
        sources = self._build_sources(top_chunks)

        return {
            "prompt": prompt,
            "sources": sources,
            "top_chunks": top_chunks,
            "has_retrieval_context": bool(top_chunks),
            "metadata_filter": normalized_metadata_filter,
            "query_rewrite": query_rewrite,
            "retrieval_queries": retrieval_queries,
            "retrieval_backend": retrieval_backend,
        }

    def _retrieval_top_k(self) -> int:
        if not settings.rag_semantic_rerank_enabled:
            return settings.rag_top_k

        return max(
            settings.rag_top_k,
            settings.rag_semantic_rerank_top_n,
            settings.rag_semantic_rerank_keep_k,
        )

    def _semantic_rerank_chunks(self, query: str, chunks: list[dict]) -> list[dict]:
        if not settings.rag_semantic_rerank_enabled:
            return chunks[: settings.rag_top_k]

        candidate_limit = max(settings.rag_semantic_rerank_top_n, 1)
        keep_k = max(settings.rag_semantic_rerank_keep_k, 1)
        candidate_chunks = chunks[:candidate_limit]

        if len(candidate_chunks) <= 1:
            return candidate_chunks[:keep_k]

        try:
            prompt = build_semantic_rerank_prompt(query, candidate_chunks)
            response = gemini_service.generate_text(
                contents=prompt,
                temperature=0,
                max_output_tokens=200,
                model=settings.rag_semantic_rerank_model,
            )
            ordered_ids = self._parse_semantic_rerank_response(response)
            reranked_chunks = self._apply_semantic_rerank_order(
                candidate_chunks,
                ordered_ids,
            )
        except Exception:
            if not settings.rag_semantic_rerank_fallback_enabled:
                raise

            logger.warning(
                "rag_semantic_rerank_failed",
                extra={
                    "candidate_count": len(candidate_chunks),
                    "keep_k": keep_k,
                    "fallback_enabled": True,
                    "model": settings.rag_semantic_rerank_model,
                },
                exc_info=True,
            )
            return candidate_chunks[:keep_k]

        logger.info(
            "rag_semantic_rerank_completed",
            extra={
                "candidate_count": len(candidate_chunks),
                "ordered_id_count": len(ordered_ids),
                "keep_k": keep_k,
                "model": settings.rag_semantic_rerank_model,
            },
        )
        return [
            {
                **chunk,
                "semantic_rerank_applied": True,
                "semantic_rerank_position": index,
            }
            for index, chunk in enumerate(reranked_chunks[:keep_k], start=1)
        ]

    def _parse_semantic_rerank_response(self, response: str) -> list[str]:
        ordered_ids = []

        for match in re.findall(r"\bC\d+\b", response or "", flags=re.IGNORECASE):
            chunk_id = match.upper()
            if chunk_id not in ordered_ids:
                ordered_ids.append(chunk_id)

        return ordered_ids

    def _apply_semantic_rerank_order(
        self,
        chunks: list[dict],
        ordered_ids: list[str],
    ) -> list[dict]:
        chunks_by_id = {
            f"C{index}": chunk
            for index, chunk in enumerate(chunks, start=1)
        }
        reranked_chunks = [
            chunks_by_id[chunk_id]
            for chunk_id in ordered_ids
            if chunk_id in chunks_by_id
        ]
        selected_chunk_ids = set(ordered_ids)
        reranked_chunks.extend(
            chunk
            for index, chunk in enumerate(chunks, start=1)
            if f"C{index}" not in selected_chunk_ids
        )
        return reranked_chunks

    def _expand_parent_context(self, chunks: list[dict]) -> list[dict]:
        if not settings.rag_parent_child_enabled:
            return chunks

        try:
            return [
                self._expand_chunk_parent_context(chunk)
                for chunk in chunks
            ]
        except Exception:
            if not settings.rag_parent_context_fallback_enabled:
                raise

            logger.warning(
                "rag_parent_context_expansion_failed",
                extra={
                    "source_count": len(chunks),
                    "fallback_enabled": True,
                    "max_tokens": settings.rag_parent_context_max_tokens,
                },
                exc_info=True,
            )
            return chunks

    def _expand_chunk_parent_context(self, chunk: dict) -> dict:
        parent_context = chunk.get("parent_context")

        if not parent_context or not chunk.get("parent_id"):
            return chunk

        expanded_context = self._limit_tokens(
            parent_context,
            settings.rag_parent_context_max_tokens,
        )

        if not expanded_context:
            return chunk

        return {
            **chunk,
            "chunk_text": expanded_context,
            "child_chunk_text": chunk.get("chunk_text"),
            "parent_context_expanded": True,
            "parent_context_token_count": len(expanded_context.split()),
        }

    def _limit_tokens(self, text: str, max_tokens: int) -> str:
        tokens = (text or "").split()

        if len(tokens) <= max_tokens:
            return text

        return " ".join(tokens[:max_tokens])

    def _retrieve_scored_chunks(
        self,
        query_embeddings: list[dict],
        metadata_filter: dict,
    ) -> tuple[list[dict], str, int]:
        if settings.rag_vector_search_backend == _RETRIEVAL_BACKEND_FIRESTORE_VECTOR:
            try:
                return (
                    self._retrieve_scored_chunks_firestore_vector(
                        query_embeddings,
                        metadata_filter,
                    ),
                    _RETRIEVAL_BACKEND_FIRESTORE_VECTOR,
                    0,
                )
            except Exception:
                if not settings.rag_vector_search_fallback_enabled:
                    raise

                logger.warning(
                    "rag_firestore_vector_search_fallback_started",
                    extra={
                        "retrieval_query_count": len(query_embeddings),
                        "metadata_filter_enabled": bool(metadata_filter),
                    },
                    exc_info=True,
                )
                scored_chunks, filtered_document_count = (
                    self._retrieve_scored_chunks_local(
                        query_embeddings,
                        metadata_filter,
                    )
                )
                return (
                    scored_chunks,
                    _RETRIEVAL_BACKEND_FIRESTORE_VECTOR_FALLBACK,
                    filtered_document_count,
                )

        scored_chunks, filtered_document_count = self._retrieve_scored_chunks_local(
            query_embeddings,
            metadata_filter,
        )
        return scored_chunks, _RETRIEVAL_BACKEND_LOCAL, filtered_document_count

    def _retrieve_scored_chunks_firestore_vector(
        self,
        query_embeddings: list[dict],
        metadata_filter: dict,
    ) -> list[dict]:
        scored_chunks_by_key = {}
        search_limit = max(
            settings.rag_vector_search_limit,
            settings.rag_candidate_pool_size,
            settings.rag_top_k,
        )

        for query_index, query_data in enumerate(query_embeddings):
            candidate_chunks = firestore_service.search_document_chunks_by_vector(
                query_embedding=query_data["embedding"],
                limit=search_limit,
                metadata_filter=metadata_filter,
            )

            for data in candidate_chunks:
                if not self._metadata_matches(data, metadata_filter):
                    continue

                scored_chunk = self._score_chunk(
                    data,
                    query_data=query_data,
                    query_index=query_index,
                )
                chunk_key = (
                    scored_chunk["file_name"],
                    scored_chunk["chunk_index"],
                )
                existing_chunk = scored_chunks_by_key.get(chunk_key)

                if (
                    existing_chunk is None
                    or scored_chunk["score"] > existing_chunk["score"]
                ):
                    scored_chunks_by_key[chunk_key] = scored_chunk

        return list(scored_chunks_by_key.values())

    def _retrieve_scored_chunks_local(
        self,
        query_embeddings: list[dict],
        metadata_filter: dict,
    ) -> tuple[list[dict], int]:
        scored_chunks_by_key = {}
        filtered_document_count = 0

        for data in firestore_service.stream_document_chunks():
            if not self._metadata_matches(data, metadata_filter):
                filtered_document_count += 1
                continue

            for query_index, query_data in enumerate(query_embeddings):
                scored_chunk = self._score_chunk(
                    data,
                    query_data=query_data,
                    query_index=query_index,
                )
                chunk_key = (
                    scored_chunk["file_name"],
                    scored_chunk["chunk_index"],
                )
                existing_chunk = scored_chunks_by_key.get(chunk_key)

                if (
                    existing_chunk is None
                    or scored_chunk["score"] > existing_chunk["score"]
                ):
                    scored_chunks_by_key[chunk_key] = scored_chunk

        return list(scored_chunks_by_key.values()), filtered_document_count

    def _score_chunk(
        self,
        data: dict,
        query_data: dict,
        query_index: int,
    ) -> dict:
        candidate_query = query_data["query"]
        vector_score = vector_service.cosine_similarity(
            query_data["embedding"],
            data["embedding"],
        )
        keyword_score = vector_service.keyword_score(
            query=candidate_query,
            chunk_text=data["chunk_text"],
            heading=data.get("heading"),
        )
        score = vector_score

        if settings.rag_hybrid_enabled:
            score = vector_service.hybrid_score(
                vector_score=vector_score,
                keyword_score=keyword_score,
                vector_weight=settings.rag_vector_score_weight,
            )

        return {
            "score": score,
            "vector_score": vector_score,
            "keyword_score": keyword_score,
            "vector_distance": data.get("vector_distance"),
            "project": data.get("project"),
            "doc_type": data.get("doc_type"),
            "file_name": data["file_name"],
            "chunk_index": data["chunk_index"],
            "chunk_text": data["chunk_text"],
            "content_hash": data.get("content_hash"),
            "heading": data.get("heading"),
            "section_path": data.get("section_path"),
            "source_uri": data.get("source_uri"),
            "version_id": data.get("version_id"),
            "char_count": data.get("char_count"),
            "parent_id": data.get("parent_id"),
            "child_id": data.get("child_id"),
            "parent_heading": data.get("parent_heading"),
            "parent_section_path": data.get("parent_section_path"),
            "parent_chunk_summary": data.get("parent_chunk_summary"),
            "parent_context": data.get("parent_context"),
            "retrieval_query_index": query_index,
        }

    def _save_rag_analytics(
        self,
        question: str,
        answer: str,
        session_id: str,
        rag_context: dict,
        request_id: str | None,
        response_mode: str,
        duration_ms: float,
    ) -> None:
        analytics = build_rag_analytics_payload(
            question=question,
            answer=answer,
            session_id=session_id,
            rag_context=rag_context,
            request_id=request_id,
            response_mode=response_mode,
            duration_ms=duration_ms,
            no_answer_text=_NO_ANSWER_TEXT,
            retrieval_backend_default=_RETRIEVAL_BACKEND_LOCAL,
            multi_query_enabled=settings.rag_multi_query_enabled,
            semantic_rerank_enabled=settings.rag_semantic_rerank_enabled,
            parent_child_enabled=settings.rag_parent_child_enabled,
        )

        try:
            firestore_service.save_rag_analytics(analytics)
        except Exception:
            logger.warning(
                "rag_analytics_write_failed",
                extra={
                    "session_id": session_id,
                    "request_id": request_id,
                    "response_mode": response_mode,
                },
                exc_info=True,
            )

    def _elapsed_ms(self, start_time: float) -> float:
        return round((time.perf_counter() - start_time) * 1000, 2)

    def _build_retrieval_queries(self, retrieval_query: str, history) -> list[str]:
        normalized_retrieval_query = retrieval_query.strip()

        if not normalized_retrieval_query:
            return [retrieval_query]

        if (
            not settings.rag_multi_query_enabled
            or settings.rag_multi_query_count <= 1
        ):
            logger.info(
                "rag_multi_query_skipped",
                extra={
                    "multi_query_enabled": settings.rag_multi_query_enabled,
                    "configured_query_count": settings.rag_multi_query_count,
                    "retrieval_query_count": 1,
                },
            )
            return [retrieval_query]

        try:
            prompt = build_multi_query_prompt(
                retrieval_query=normalized_retrieval_query,
                conversation_context=build_history_context(history),
                query_count=settings.rag_multi_query_count,
            )
            generated_queries = gemini_service.generate_text(
                contents=prompt,
                temperature=0,
                max_output_tokens=180,
                model=settings.rag_multi_query_model,
            )
        except Exception:
            logger.warning(
                "rag_multi_query_generation_failed",
                extra={
                    "retrieval_query_length": len(retrieval_query),
                    "history_turn_count": len(history),
                    "configured_query_count": settings.rag_multi_query_count,
                },
                exc_info=True,
            )
            return [retrieval_query]

        queries = parse_multi_query_response(generated_queries)
        queries.insert(0, normalized_retrieval_query)
        retrieval_queries = self._dedupe_queries(queries)[: settings.rag_multi_query_count]
        logger.info(
            "rag_multi_query_completed",
            extra={
                "multi_query_enabled": True,
                "configured_query_count": settings.rag_multi_query_count,
                "generated_query_count": len(queries) - 1,
                "retrieval_query_count": len(retrieval_queries),
            },
        )
        return retrieval_queries

    def _dedupe_queries(self, queries: list[str]) -> list[str]:
        deduped_queries = []
        seen_queries = set()

        for query in queries:
            normalized_query = query.strip()
            query_key = normalized_query.lower()

            if not normalized_query or query_key in seen_queries:
                continue

            seen_queries.add(query_key)
            deduped_queries.append(normalized_query)

        return deduped_queries

    def _normalize_metadata_filter(self, metadata_filter) -> dict:
        if metadata_filter is None:
            return {}

        if hasattr(metadata_filter, "model_dump"):
            raw_filter = metadata_filter.model_dump(exclude_none=True)
        elif isinstance(metadata_filter, dict):
            raw_filter = {
                key: value
                for key, value in metadata_filter.items()
                if value is not None
            }
        else:
            raw_filter = {
                "file_name": getattr(metadata_filter, "file_name", None),
                "heading": getattr(metadata_filter, "heading", None),
            }
            raw_filter = {
                key: value
                for key, value in raw_filter.items()
                if value is not None
            }

        return {
            key: str(value).strip()
            for key, value in raw_filter.items()
            if key in _SUPPORTED_METADATA_FILTER_FIELDS and str(value).strip()
        }

    def _metadata_matches(self, chunk: dict, metadata_filter: dict) -> bool:
        if not metadata_filter:
            return True

        for field in _EXACT_METADATA_FILTER_FIELDS:
            expected = metadata_filter.get(field)
            if expected and str(chunk.get(field) or "") != expected:
                return False

        for field in _TEXT_METADATA_FILTER_FIELDS:
            expected = metadata_filter.get(field)
            if not expected:
                continue

            chunk_value = str(chunk.get(field) or "").lower()
            if expected.lower() not in chunk_value:
                return False

        return True

    def _rewrite_query_if_needed(self, question: str, history) -> QueryRewriteResult:
        original_question = question.strip()

        if not settings.rag_query_rewrite_enabled:
            logger.info(
                "rag_query_rewrite_skipped",
                extra={
                    "rewrite_enabled": False,
                    "rewrite_used": False,
                    "question_length": len(question),
                },
            )
            return QueryRewriteResult(
                original_question=question,
                retrieval_query=question,
                query_rewritten=False,
                rewrite_used=False,
            )

        if not original_question:
            logger.info(
                "rag_query_rewrite_skipped",
                extra={
                    "rewrite_enabled": True,
                    "rewrite_used": False,
                    "reason": "empty_question",
                },
            )
            return QueryRewriteResult(
                original_question=question,
                retrieval_query=question,
                query_rewritten=False,
                rewrite_used=False,
            )

        try:
            rewrite_history = history[-settings.rag_query_rewrite_history_limit :]
            prompt = build_query_rewrite_prompt(
                question=original_question,
                conversation_context=build_history_context(rewrite_history),
            )
            rewritten_query = gemini_service.generate_text(
                contents=prompt,
                temperature=0,
                max_output_tokens=120,
                model=settings.rag_query_rewrite_model,
            ).strip()
            rewritten_query = self._clean_rewritten_query(rewritten_query)
        except Exception:
            logger.warning(
                "rag_query_rewrite_failed",
                extra={
                    "question_length": len(question),
                    "history_turn_count": len(history),
                    "rewrite_enabled": True,
                    "rewrite_used": False,
                },
                exc_info=True,
            )
            return QueryRewriteResult(
                original_question=question,
                retrieval_query=question,
                query_rewritten=False,
                rewrite_used=False,
            )

        if not rewritten_query:
            logger.info(
                "rag_query_rewrite_skipped",
                extra={
                    "rewrite_enabled": True,
                    "rewrite_used": False,
                    "reason": "empty_rewrite",
                    "question_length": len(question),
                },
            )
            return QueryRewriteResult(
                original_question=question,
                retrieval_query=question,
                query_rewritten=False,
                rewrite_used=False,
            )

        query_rewritten = rewritten_query != original_question
        logger.info(
            "rag_query_rewrite_completed",
            extra={
                "rewrite_enabled": True,
                "rewrite_used": query_rewritten,
                "query_rewritten": query_rewritten,
                "question_length": len(question),
                "retrieval_query_length": len(
                    rewritten_query if query_rewritten else question
                ),
                "history_turn_count": len(history),
            },
        )
        return QueryRewriteResult(
            original_question=question,
            retrieval_query=rewritten_query if query_rewritten else question,
            query_rewritten=query_rewritten,
            rewrite_used=query_rewritten,
        )

    def _save_query_rewrite_audit_if_used(
        self,
        session_id: str,
        query_rewrite: QueryRewriteResult,
        request_id: str | None = None,
    ) -> None:
        if not query_rewrite.rewrite_used:
            return

        firestore_service.save_query_rewrite_audit_message(
            session_id=session_id,
            original_question=query_rewrite.original_question,
            rewritten_query=query_rewrite.retrieval_query,
            rewrite_used=query_rewrite.rewrite_used,
            request_id=request_id,
        )

    def _clean_rewritten_query(self, rewritten_query: str) -> str:
        return rewritten_query.strip().strip('"').strip("'").strip()

    def _filter_visible_history(self, history) -> list:
        visible_history = []

        for message in history or []:
            role = (
                message.get("role")
                if isinstance(message, dict)
                else getattr(message, "role", "")
            )
            if role in {"user", "assistant"}:
                visible_history.append(message)

        return visible_history

    def _build_sources(self, chunks):
        return [
            {
                "project": chunk.get("project"),
                "doc_type": chunk.get("doc_type"),
                "file_name": chunk["file_name"],
                "chunk_index": chunk["chunk_index"],
                "source_id": chunk.get("source_id"),
                "score": chunk["score"],
                "vector_score": chunk.get("vector_score"),
                "vector_distance": chunk.get("vector_distance"),
                "keyword_score": chunk.get("keyword_score"),
                "rerank_score": chunk.get("rerank_score"),
                "content_hash": chunk.get("content_hash"),
                "heading": chunk.get("heading"),
                "section_path": chunk.get("section_path"),
                "source_uri": chunk.get("source_uri"),
                "version_id": chunk.get("version_id"),
                "char_count": chunk.get("char_count"),
                "parent_id": chunk.get("parent_id"),
                "child_id": chunk.get("child_id"),
                "parent_heading": chunk.get("parent_heading"),
                "parent_section_path": chunk.get("parent_section_path"),
                "parent_chunk_summary": chunk.get("parent_chunk_summary"),
                "parent_context_expanded": chunk.get("parent_context_expanded", False),
                "parent_context_token_count": chunk.get("parent_context_token_count"),
                "semantic_rerank_applied": chunk.get(
                    "semantic_rerank_applied",
                    False,
                ),
                "semantic_rerank_position": chunk.get("semantic_rerank_position"),
            }
            for chunk in chunks
        ]

    def _validate_grounded_answer(
        self,
        answer: str,
        chunks,
        request_id: str | None = None,
    ) -> str:
        if not chunks:
            return _NO_ANSWER_TEXT

        if is_no_answer(answer, _NO_ANSWER_TEXT):
            return answer

        cited_source_ids = _extract_cited_source_ids(answer)
        valid_source_ids = {
            chunk.get("source_id")
            for chunk in chunks
            if chunk.get("source_id")
        }

        if cited_source_ids and cited_source_ids <= valid_source_ids:
            return answer

        logger.warning(
            "rag_citation_validation_failed",
            extra={
                "request_id": request_id,
                "valid_source_ids": sorted(valid_source_ids),
                "cited_source_ids": sorted(cited_source_ids),
                "source_count": len(chunks),
                "answer_length": len(answer or ""),
            },
        )
        return _NO_ANSWER_TEXT

    def _chunk_answer_for_sse(self, answer: str) -> list[str]:
        if not answer:
            return []

        words = answer.split(" ")
        chunks = []
        current_chunk = ""

        for word in words:
            candidate = f"{current_chunk} {word}".strip()

            if len(candidate) <= 80:
                current_chunk = candidate
                continue

            if current_chunk:
                chunks.append(f"{current_chunk} ")
            current_chunk = word

        if current_chunk:
            chunks.append(current_chunk)

        return chunks

    def _add_source_ids(self, chunks):
        return [
            {
                **chunk,
                "source_id": f"S{index}",
            }
            for index, chunk in enumerate(chunks, start=1)
        ]

    def _format_sse(self, event: str, payload: dict) -> str:
        return f"event: {event}\ndata: {json.dumps(payload)}\n\n"


rag_service = RagService()

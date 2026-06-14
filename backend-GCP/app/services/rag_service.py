import logging
import json
import re
from dataclasses import dataclass

from app.config.settings import settings
from app.errors import BackendServiceError, RagServiceError
from app.services.firestore_service import firestore_service
from app.services.gemini_service import gemini_service
from app.services.vector_service import vector_service


logger = logging.getLogger(__name__)
_SOURCE_CITATION_PATTERN = re.compile(r"\[(S\d+)\]")
_NO_ANSWER_TEXT = "I do not know based on the indexed project documents."


@dataclass(frozen=True)
class QueryRewriteResult:
    original_question: str
    retrieval_query: str
    query_rewritten: bool
    rewrite_used: bool


class RagService:
    def answer_question(
        self,
        question: str,
        history=None,
        session_id=None,
        metadata_filter=None,
        request_id=None,
    ):
        try:
            active_session_id = session_id or firestore_service.create_session_id()
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

    def stream_answer(
        self,
        question: str,
        history=None,
        session_id=None,
        metadata_filter=None,
        request_id=None,
    ):
        try:
            active_session_id = session_id or firestore_service.create_session_id()
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

        scored_chunks_by_key = {}
        filtered_document_count = 0

        for data in firestore_service.stream_document_chunks():
            if not self._metadata_matches(data, normalized_metadata_filter):
                filtered_document_count += 1
                continue

            for query_index, query_data in enumerate(query_embeddings):
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

                chunk_key = (data["file_name"], data["chunk_index"])
                scored_chunk = {
                    "score": score,
                    "vector_score": vector_score,
                    "keyword_score": keyword_score,
                    "file_name": data["file_name"],
                    "chunk_index": data["chunk_index"],
                    "chunk_text": data["chunk_text"],
                    "content_hash": data.get("content_hash"),
                    "heading": data.get("heading"),
                    "char_count": data.get("char_count"),
                    "retrieval_query_index": query_index,
                }
                existing_chunk = scored_chunks_by_key.get(chunk_key)

                if existing_chunk is None or score > existing_chunk["score"]:
                    scored_chunks_by_key[chunk_key] = scored_chunk

        scored_chunks = list(scored_chunks_by_key.values())

        top_chunks = vector_service.select_relevant_chunks(
            scored_chunks,
            top_k=settings.rag_top_k,
            candidate_pool_size=settings.rag_candidate_pool_size,
            score_threshold=settings.rag_score_threshold,
            rerank_enabled=settings.rag_rerank_enabled,
            rerank_keyword_weight=settings.rag_rerank_keyword_weight,
        )
        top_chunks = self._add_source_ids(top_chunks)
        logger.info(
            "rag_retrieval_completed",
            extra={
                "candidate_count": len(scored_chunks),
                "top_k": settings.rag_top_k,
                "candidate_pool_size": settings.rag_candidate_pool_size,
                "score_threshold": settings.rag_score_threshold,
                "hybrid_enabled": settings.rag_hybrid_enabled,
                "vector_score_weight": settings.rag_vector_score_weight,
                "rerank_enabled": settings.rag_rerank_enabled,
                "rerank_keyword_weight": settings.rag_rerank_keyword_weight,
                "source_count": len(top_chunks),
                "metadata_filter_enabled": bool(normalized_metadata_filter),
                "documents_filtered_by_metadata": filtered_document_count,
                "multi_query_enabled": settings.rag_multi_query_enabled,
                "retrieval_query_count": len(retrieval_queries),
            },
        )

        context = self._build_context(top_chunks)
        conversation_context = self._build_history_context(active_history)
        prompt = self._build_prompt(question, context, conversation_context)
        sources = self._build_sources(top_chunks)

        return {
            "prompt": prompt,
            "sources": sources,
            "top_chunks": top_chunks,
            "has_retrieval_context": bool(top_chunks),
            "metadata_filter": normalized_metadata_filter,
            "query_rewrite": query_rewrite,
            "retrieval_queries": retrieval_queries,
        }

    def _build_retrieval_queries(self, retrieval_query: str, history) -> list[str]:
        normalized_retrieval_query = retrieval_query.strip()

        if not normalized_retrieval_query:
            return [retrieval_query]

        if (
            not settings.rag_multi_query_enabled
            or settings.rag_multi_query_count <= 1
        ):
            return [retrieval_query]

        try:
            prompt = self._build_multi_query_prompt(
                retrieval_query=normalized_retrieval_query,
                conversation_context=self._build_history_context(history),
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

        queries = self._parse_multi_query_response(generated_queries)
        queries.insert(0, normalized_retrieval_query)
        return self._dedupe_queries(queries)[: settings.rag_multi_query_count]

    def _build_multi_query_prompt(
        self,
        retrieval_query: str,
        conversation_context: str,
        query_count: int,
    ) -> str:
        return f"""
Generate up to {query_count - 1} alternate retrieval queries for Jarrett's cloud portfolio RAG system.

Return one query per line.
Do not answer the question.
Do not include Markdown.
Do not include citations.
Keep each query concise and specific.
Use recent conversation only to preserve the user's intended scope.

<recent_conversation>
{conversation_context}
</recent_conversation>

Retrieval query:
{retrieval_query}
"""

    def _parse_multi_query_response(self, response: str) -> list[str]:
        queries = []

        for line in (response or "").splitlines():
            query = re.sub(r"^\s*(?:[-*]|\d+[.)])\s*", "", line).strip()
            query = query.strip('"').strip("'").strip()

            if query:
                queries.append(query)

        return queries

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
            if key in {"file_name", "heading"} and str(value).strip()
        }

    def _metadata_matches(self, chunk: dict, metadata_filter: dict) -> bool:
        if not metadata_filter:
            return True

        file_name = metadata_filter.get("file_name")
        if file_name and chunk.get("file_name") != file_name:
            return False

        heading = metadata_filter.get("heading")
        if heading:
            chunk_heading = (chunk.get("heading") or "").lower()
            if heading.lower() not in chunk_heading:
                return False

        return True

    def _rewrite_query_if_needed(self, question: str, history) -> QueryRewriteResult:
        original_question = question.strip()

        if not settings.rag_query_rewrite_enabled:
            return QueryRewriteResult(
                original_question=question,
                retrieval_query=question,
                query_rewritten=False,
                rewrite_used=False,
            )

        if not original_question:
            return QueryRewriteResult(
                original_question=question,
                retrieval_query=question,
                query_rewritten=False,
                rewrite_used=False,
            )

        try:
            rewrite_history = history[-settings.rag_query_rewrite_history_limit :]
            prompt = self._build_query_rewrite_prompt(
                question=original_question,
                conversation_context=self._build_history_context(rewrite_history),
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
            return QueryRewriteResult(
                original_question=question,
                retrieval_query=question,
                query_rewritten=False,
                rewrite_used=False,
            )

        query_rewritten = rewritten_query != original_question
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

    def _build_query_rewrite_prompt(
        self,
        question: str,
        conversation_context: str,
    ) -> str:
        return f"""
You rewrite user follow-up questions into standalone retrieval queries for Jarrett's cloud portfolio RAG system.

Return only the rewritten standalone query.
Do not answer the question.
Do not include Markdown.
Do not include citations.
Preserve the user's intent.
Use project-specific context from recent conversation only when needed.
If the original question is already standalone, return it unchanged.

<recent_conversation>
{conversation_context}
</recent_conversation>

User question:
{question}
"""

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
                "file_name": chunk["file_name"],
                "chunk_index": chunk["chunk_index"],
                "source_id": chunk.get("source_id"),
                "score": chunk["score"],
                "vector_score": chunk.get("vector_score"),
                "keyword_score": chunk.get("keyword_score"),
                "rerank_score": chunk.get("rerank_score"),
                "content_hash": chunk.get("content_hash"),
                "heading": chunk.get("heading"),
                "char_count": chunk.get("char_count"),
            }
            for chunk in chunks
        ]

    def _build_context(self, chunks):
        return "\n\n".join(
            [
                f"[{chunk['source_id']}] File: {chunk['file_name']} | Chunk: {chunk['chunk_index']} | Heading: {chunk.get('heading') or 'N/A'} | Score: {chunk['score']}\n{chunk['chunk_text']}"
                for chunk in chunks
            ]
        )

    def _validate_grounded_answer(
        self,
        answer: str,
        chunks,
        request_id: str | None = None,
    ) -> str:
        if not chunks:
            return _NO_ANSWER_TEXT

        if self._is_no_answer(answer):
            return answer

        cited_source_ids = set(_SOURCE_CITATION_PATTERN.findall(answer or ""))
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

    def _is_no_answer(self, answer: str) -> bool:
        normalized_answer = (answer or "").lower()
        return (
            "do not know" in normalized_answer
            or "don't know" in normalized_answer
            or "not in the context" in normalized_answer
            or "not in the indexed" in normalized_answer
        )

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

    def _build_history_context(self, history) -> str:
        if not history:
            return "No prior conversation."

        recent_history = history[-6:]
        lines = []

        for message in recent_history:
            if isinstance(message, dict):
                role = message.get("role", "")
                content = message.get("content", "")
            else:
                role = getattr(message, "role", "")
                content = getattr(message, "content", "")
            if role in {"user", "assistant"} and content:
                lines.append(f"{role}: {content}")

        return "\n".join(lines) if lines else "No prior conversation."

    def _build_prompt(
        self,
        question: str,
        context: str,
        conversation_context: str = "No prior conversation.",
    ) -> str:
        return f"""
You are Jarrett's AI cloud portfolio assistant.

Answer the user's question using only the retrieved context below.
If the answer is not in the context, say you do not know based on the indexed project documents.
Every factual claim from the retrieved context must include a citation using the source ID format, such as [S1] or [S2].
Do not cite sources that are not listed in the retrieved context.
Use the recent conversation only to understand follow-up questions. Do not use conversation history as a factual source.
Keep the answer concise and recruiter-friendly.

<recent_conversation>
{conversation_context}
</recent_conversation>

<retrieved_context>
{context}
</retrieved_context>

User question:
{question}
"""

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

import logging
import json
from dataclasses import dataclass

from app.config.settings import settings
from app.errors import BackendServiceError, RagServiceError
from app.services.firestore_service import firestore_service
from app.services.gemini_service import gemini_service
from app.services.vector_service import vector_service


logger = logging.getLogger(__name__)


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
        request_id=None,
    ):
        try:
            active_session_id = session_id or firestore_service.create_session_id()
            rag_context = self._prepare_rag_context(
                question,
                history or [],
                active_session_id,
            )
            answer = gemini_service.generate_text(
                contents=rag_context["prompt"],
                temperature=0.2,
                max_output_tokens=800,
            )
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
        request_id=None,
    ):
        try:
            active_session_id = session_id or firestore_service.create_session_id()
            rag_context = self._prepare_rag_context(
                question,
                history or [],
                active_session_id,
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
            for token in gemini_service.stream_text(
                contents=rag_context["prompt"],
                temperature=0.2,
                max_output_tokens=800,
            ):
                answer_parts.append(token)
                yield self._format_sse("token", {"text": token})

            answer = "".join(answer_parts)
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

    def _prepare_rag_context(self, question: str, history, session_id: str):
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
            },
        )

        retrieval_query = query_rewrite.retrieval_query
        query_embedding = gemini_service.embed_text(retrieval_query)

        docs = firestore_service.stream_document_chunks()
        scored_chunks = []

        for data in docs:
            vector_score = vector_service.cosine_similarity(
                query_embedding,
                data["embedding"],
            )
            keyword_score = vector_service.keyword_score(
                query=retrieval_query,
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

            scored_chunks.append(
                {
                    "score": score,
                    "vector_score": vector_score,
                    "keyword_score": keyword_score,
                    "file_name": data["file_name"],
                    "chunk_index": data["chunk_index"],
                    "chunk_text": data["chunk_text"],
                    "content_hash": data.get("content_hash"),
                    "heading": data.get("heading"),
                    "char_count": data.get("char_count"),
                }
            )

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
            "query_rewrite": query_rewrite,
        }

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

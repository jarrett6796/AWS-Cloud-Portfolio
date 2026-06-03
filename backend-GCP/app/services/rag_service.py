import logging
import json

from app.config.settings import settings
from app.errors import BackendServiceError, RagServiceError
from app.services.firestore_service import firestore_service
from app.services.gemini_service import gemini_service
from app.services.vector_service import vector_service


logger = logging.getLogger(__name__)


class RagService:
    def answer_question(self, question: str, history=None):
        try:
            rag_context = self._prepare_rag_context(question, history or [])
            answer = gemini_service.generate_text(
                contents=rag_context["prompt"],
                temperature=0.2,
                max_output_tokens=800,
            )

            logger.info(
                "rag_answer_completed",
                extra={
                    "question_length": len(question),
                    "answer_length": len(answer or ""),
                    "source_count": len(rag_context["top_chunks"]),
                },
            )

            return {
                "question": question,
                "answer": answer,
                "sources": rag_context["sources"],
            }
        except BackendServiceError:
            raise
        except Exception as error:
            raise RagServiceError(error) from error

    def stream_answer(self, question: str, history=None):
        try:
            rag_context = self._prepare_rag_context(question, history or [])

            yield self._format_sse(
                "metadata",
                {
                    "question": question,
                    "sources": rag_context["sources"],
                },
            )

            for token in gemini_service.stream_text(
                contents=rag_context["prompt"],
                temperature=0.2,
                max_output_tokens=800,
            ):
                yield self._format_sse("token", {"text": token})

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

    def _prepare_rag_context(self, question: str, history):
        logger.info(
            "rag_answer_started",
            extra={
                "question_length": len(question),
                "history_turn_count": len(history),
                "top_k": settings.rag_top_k,
                "candidate_pool_size": settings.rag_candidate_pool_size,
                "score_threshold": settings.rag_score_threshold,
                "hybrid_enabled": settings.rag_hybrid_enabled,
                "vector_score_weight": settings.rag_vector_score_weight,
                "rerank_enabled": settings.rag_rerank_enabled,
                "rerank_keyword_weight": settings.rag_rerank_keyword_weight,
            },
        )

        query_embedding = gemini_service.embed_text(question)

        docs = firestore_service.stream_document_chunks()
        scored_chunks = []

        for data in docs:
            vector_score = vector_service.cosine_similarity(
                query_embedding,
                data["embedding"],
            )
            keyword_score = vector_service.keyword_score(
                query=question,
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
        conversation_context = self._build_history_context(history)
        prompt = self._build_prompt(question, context, conversation_context)
        sources = self._build_sources(top_chunks)

        return {
            "prompt": prompt,
            "sources": sources,
            "top_chunks": top_chunks,
        }

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
            role = getattr(message, "role", "")
            content = getattr(message, "content", "")
            normalized_role = role if role in {"user", "assistant"} else "user"

            if content:
                lines.append(f"{normalized_role}: {content}")

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

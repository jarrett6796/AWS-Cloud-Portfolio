import logging

from app.config.settings import settings
from app.errors import BackendServiceError, RagServiceError
from app.services.firestore_service import firestore_service
from app.services.gemini_service import gemini_service
from app.services.vector_service import vector_service


logger = logging.getLogger(__name__)


class RagService:
    def answer_question(self, question: str):
        try:
            return self._answer_question(question)
        except BackendServiceError:
            raise
        except Exception as error:
            raise RagServiceError(error) from error

    def _answer_question(self, question: str):
        logger.info(
            "rag_answer_started",
            extra={
                "question_length": len(question),
                "top_k": settings.rag_top_k,
                "candidate_pool_size": settings.rag_candidate_pool_size,
                "score_threshold": settings.rag_score_threshold,
                "hybrid_enabled": settings.rag_hybrid_enabled,
                "vector_score_weight": settings.rag_vector_score_weight,
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
        )
        logger.info(
            "rag_retrieval_completed",
            extra={
                "candidate_count": len(scored_chunks),
                "top_k": settings.rag_top_k,
                "candidate_pool_size": settings.rag_candidate_pool_size,
                "score_threshold": settings.rag_score_threshold,
                "hybrid_enabled": settings.rag_hybrid_enabled,
                "vector_score_weight": settings.rag_vector_score_weight,
                "source_count": len(top_chunks),
            },
        )

        context = self._build_context(top_chunks)
        prompt = self._build_prompt(question, context)

        answer = gemini_service.generate_text(
            contents=prompt,
            temperature=0.2,
            max_output_tokens=800,
        )

        logger.info(
            "rag_answer_completed",
            extra={
                "question_length": len(question),
                "answer_length": len(answer or ""),
                "source_count": len(top_chunks),
            },
        )

        return {
            "question": question,
            "answer": answer,
            "sources": [
                {
                    "file_name": chunk["file_name"],
                    "chunk_index": chunk["chunk_index"],
                    "score": chunk["score"],
                    "vector_score": chunk.get("vector_score"),
                    "keyword_score": chunk.get("keyword_score"),
                    "content_hash": chunk.get("content_hash"),
                    "heading": chunk.get("heading"),
                    "char_count": chunk.get("char_count"),
                }
                for chunk in top_chunks
            ],
        }

    def _build_context(self, chunks):
        return "\n\n".join(
            [
                f"[Source: {chunk['file_name']} | Chunk: {chunk['chunk_index']} | Heading: {chunk.get('heading') or 'N/A'} | Score: {chunk['score']}]\n{chunk['chunk_text']}"
                for chunk in chunks
            ]
        )

    def _build_prompt(self, question: str, context: str) -> str:
        return f"""
You are Jarrett's AI cloud portfolio assistant.

Answer the user's question using only the retrieved context below.
If the answer is not in the context, say you do not know based on the indexed project documents.

<retrieved_context>
{context}
</retrieved_context>

User question:
{question}
"""


rag_service = RagService()

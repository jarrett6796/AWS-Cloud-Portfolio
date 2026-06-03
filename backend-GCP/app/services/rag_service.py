from app.config.settings import settings
from app.errors import BackendServiceError, RagServiceError
from app.services.firestore_service import firestore_service
from app.services.gemini_service import gemini_service
from app.services.vector_service import vector_service


class RagService:
    def answer_question(self, question: str):
        try:
            return self._answer_question(question)
        except BackendServiceError:
            raise
        except Exception as error:
            raise RagServiceError(error) from error

    def _answer_question(self, question: str):
        query_embedding = gemini_service.embed_text(question)

        docs = firestore_service.stream_document_chunks()
        scored_chunks = []

        for data in docs:
            score = vector_service.cosine_similarity(
                query_embedding,
                data["embedding"],
            )

            scored_chunks.append(
                {
                    "score": score,
                    "file_name": data["file_name"],
                    "chunk_index": data["chunk_index"],
                    "chunk_text": data["chunk_text"],
                }
            )

        top_chunks = vector_service.top_k(scored_chunks, settings.rag_top_k)
        context = self._build_context(top_chunks)
        prompt = self._build_prompt(question, context)

        answer = gemini_service.generate_text(
            contents=prompt,
            temperature=0.2,
            max_output_tokens=800,
        )

        return {
            "question": question,
            "answer": answer,
            "sources": [
                {
                    "file_name": chunk["file_name"],
                    "chunk_index": chunk["chunk_index"],
                    "score": chunk["score"],
                }
                for chunk in top_chunks
            ],
        }

    def _build_context(self, chunks):
        return "\n\n".join(
            [
                f"[Source: {chunk['file_name']} | Chunk: {chunk['chunk_index']} | Score: {chunk['score']}]\n{chunk['chunk_text']}"
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

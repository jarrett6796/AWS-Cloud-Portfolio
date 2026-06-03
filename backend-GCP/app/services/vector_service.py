from app.config.settings import settings


class VectorService:
    def chunk_text(self, text: str, chunk_size: int = settings.default_chunk_size):
        chunks = []

        for index in range(0, len(text), chunk_size):
            chunk = text[index:index + chunk_size].strip()

            if chunk:
                chunks.append(chunk)

        return chunks

    def cosine_similarity(self, vec1, vec2):
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        magnitude_1 = sum(a * a for a in vec1) ** 0.5
        magnitude_2 = sum(b * b for b in vec2) ** 0.5

        if magnitude_1 == 0 or magnitude_2 == 0:
            return 0

        return dot_product / (magnitude_1 * magnitude_2)

    def top_k(self, chunks, k: int = settings.rag_top_k):
        return sorted(
            chunks,
            key=lambda chunk: chunk["score"],
            reverse=True,
        )[:k]


vector_service = VectorService()

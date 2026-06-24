import re
from hashlib import sha256
from pathlib import PurePosixPath

from app.config.settings import settings


_TOKEN_PATTERN = re.compile(r"[a-z0-9]+")


class VectorService:
    def chunk_text(
        self,
        text: str,
        chunk_size: int = settings.default_chunk_size,
        chunk_overlap_tokens: int = settings.default_chunk_overlap_tokens,
    ):
        sections = self._split_markdown_sections(text)
        chunks = []
        current_chunk = ""
        normalized_overlap = self._normalize_overlap(
            chunk_size,
            chunk_overlap_tokens,
        )

        for section in sections:
            for piece in self._split_oversized_section(
                section,
                chunk_size,
                normalized_overlap,
            ):
                if not current_chunk:
                    current_chunk = piece
                    continue

                candidate = f"{current_chunk}\n\n{piece}"

                if self._count_tokens(candidate) <= chunk_size:
                    current_chunk = candidate
                else:
                    chunks.append(current_chunk)
                    current_chunk = piece

        if current_chunk:
            chunks.append(current_chunk)

        return chunks

    def build_chunk_metadata(self, chunk_text: str, file_name: str | None = None) -> dict:
        heading = self._extract_first_heading(chunk_text)
        content_hash = sha256(chunk_text.encode("utf-8")).hexdigest()

        return {
            "char_count": len(chunk_text),
            "content_hash": content_hash,
            "doc_type": self._infer_doc_type(file_name, heading),
            "heading": heading,
            "project": self._infer_project(file_name),
            "section_path": self._extract_section_path(chunk_text),
            "source_uri": self._build_source_uri(file_name),
            "version_id": content_hash[:16],
        }

    def _extract_first_heading(self, text: str) -> str | None:
        for line in text.splitlines():
            stripped_line = line.strip()

            if stripped_line.startswith("#"):
                return stripped_line.lstrip("#").strip() or None

        return None

    def _extract_section_path(self, text: str) -> str | None:
        headings = []

        for line in text.splitlines():
            stripped_line = line.strip()

            if not stripped_line.startswith("#"):
                continue

            heading = stripped_line.lstrip("#").strip()
            if heading:
                headings.append(heading)

        return " > ".join(headings) if headings else None

    def _infer_project(self, file_name: str | None) -> str:
        normalized_name = (file_name or "").lower()

        if "gcp" in normalized_name or "capstone" in normalized_name:
            return "aws-gcp-rag-capstone"

        if "react" in normalized_name or "frontend" in normalized_name:
            return "aws-gcp-rag-capstone"

        return "portfolio"

    def _infer_doc_type(self, file_name: str | None, heading: str | None = None) -> str:
        normalized_name = (file_name or "").lower()
        normalized_heading = (heading or "").lower()
        combined = f"{normalized_name} {normalized_heading}"

        if "test" in combined:
            return "test_record"
        if "audit" in combined:
            return "audit"
        if "roadmap" in combined:
            return "roadmap"
        if "development_log" in combined or "development log" in combined:
            return "development_log"
        if "troubleshooting" in combined:
            return "troubleshooting"
        if "architecture" in combined:
            return "architecture"
        if "implementation" in combined:
            return "implementation"
        if "overview" in combined:
            return "overview"

        return "state"

    def _build_source_uri(self, file_name: str | None) -> str | None:
        if not file_name:
            return None

        normalized_name = str(PurePosixPath(file_name))
        return f"gs://{settings.docs_bucket}/{normalized_name}"

    def _split_markdown_sections(self, text: str) -> list[str]:
        sections = []
        current_lines = []

        for line in text.splitlines():
            if line.startswith("#") and current_lines:
                section = "\n".join(current_lines).strip()

                if section:
                    sections.append(section)

                current_lines = [line]
            else:
                current_lines.append(line)

        final_section = "\n".join(current_lines).strip()

        if final_section:
            sections.append(final_section)

        return sections

    def _split_oversized_section(
        self,
        section: str,
        chunk_size: int,
        chunk_overlap_tokens: int = 0,
    ) -> list[str]:
        if self._count_tokens(section) <= chunk_size:
            return [section]

        chunks = []
        paragraphs = [paragraph.strip() for paragraph in section.split("\n\n")]
        current_chunk = ""

        for paragraph in paragraphs:
            if not paragraph:
                continue

            if self._count_tokens(paragraph) > chunk_size:
                if current_chunk:
                    chunks.append(current_chunk)
                    current_chunk = ""

                chunks.extend(
                    self._split_by_token_count(
                        paragraph,
                        chunk_size,
                        chunk_overlap_tokens,
                    )
                )
                continue

            if not current_chunk:
                current_chunk = paragraph
                continue

            candidate = f"{current_chunk}\n\n{paragraph}"

            if self._count_tokens(candidate) <= chunk_size:
                current_chunk = candidate
            else:
                chunks.append(current_chunk)
                current_chunk = paragraph

        if current_chunk:
            chunks.append(current_chunk)

        return chunks

    def _split_by_token_count(
        self,
        text: str,
        chunk_size: int,
        chunk_overlap_tokens: int = 0,
    ) -> list[str]:
        tokens = text.split()

        if not tokens:
            return []

        if len(tokens) <= chunk_size:
            return [text.strip()]

        chunks = []
        step_size = max(chunk_size - chunk_overlap_tokens, 1)

        for index in range(0, len(tokens), step_size):
            chunk_tokens = tokens[index:index + chunk_size]

            if not chunk_tokens:
                continue

            chunk = " ".join(chunk_tokens).strip()

            if chunk:
                chunks.append(chunk)

            if index + chunk_size >= len(tokens):
                break

        return chunks

    def _normalize_overlap(self, chunk_size: int, chunk_overlap_tokens: int) -> int:
        if chunk_overlap_tokens < 0:
            return 0

        return min(chunk_overlap_tokens, max(chunk_size - 1, 0))

    def _count_tokens(self, text: str) -> int:
        return len(text.split())

    def cosine_similarity(self, vec1, vec2):
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        magnitude_1 = sum(a * a for a in vec1) ** 0.5
        magnitude_2 = sum(b * b for b in vec2) ** 0.5

        if magnitude_1 == 0 or magnitude_2 == 0:
            return 0

        return dot_product / (magnitude_1 * magnitude_2)

    def keyword_score(
        self,
        query: str,
        chunk_text: str,
        heading: str | None = None,
    ) -> float:
        query_tokens = self._tokenize(query)

        if not query_tokens:
            return 0

        searchable_text = f"{heading or ''} {chunk_text}"
        chunk_tokens = set(self._tokenize(searchable_text))

        if not chunk_tokens:
            return 0

        overlap_count = len(set(query_tokens) & chunk_tokens)
        return overlap_count / len(set(query_tokens))

    def hybrid_score(
        self,
        vector_score: float,
        keyword_score: float,
        vector_weight: float = settings.rag_vector_score_weight,
    ) -> float:
        bounded_vector_weight = min(max(vector_weight, 0), 1)
        keyword_weight = 1 - bounded_vector_weight

        return (vector_score * bounded_vector_weight) + (
            keyword_score * keyword_weight
        )

    def rerank_score(
        self,
        score: float,
        keyword_score: float,
        keyword_weight: float = settings.rag_rerank_keyword_weight,
    ) -> float:
        return score + (keyword_score * max(keyword_weight, 0))

    def rerank_chunks(
        self,
        chunks,
        keyword_weight: float = settings.rag_rerank_keyword_weight,
    ):
        reranked_chunks = []

        for chunk in chunks:
            reranked_chunk = dict(chunk)
            reranked_chunk["rerank_score"] = self.rerank_score(
                score=chunk["score"],
                keyword_score=chunk.get("keyword_score", 0),
                keyword_weight=keyword_weight,
            )
            reranked_chunks.append(reranked_chunk)

        return sorted(
            reranked_chunks,
            key=lambda chunk: chunk["rerank_score"],
            reverse=True,
        )

    def _tokenize(self, text: str) -> list[str]:
        return [
            token
            for token in _TOKEN_PATTERN.findall(text.lower())
            if len(token) >= 3
        ]

    def top_k(self, chunks, k: int = settings.rag_top_k):
        return sorted(
            chunks,
            key=lambda chunk: chunk["score"],
            reverse=True,
        )[:k]

    def select_relevant_chunks(
        self,
        chunks,
        top_k: int = settings.rag_top_k,
        candidate_pool_size: int = settings.rag_candidate_pool_size,
        score_threshold: float = settings.rag_score_threshold,
        rerank_enabled: bool = settings.rag_rerank_enabled,
        rerank_keyword_weight: float = settings.rag_rerank_keyword_weight,
    ):
        candidates = self.top_k(chunks, candidate_pool_size)

        relevant_chunks = [
            chunk
            for chunk in candidates
            if chunk["score"] >= score_threshold
        ]

        if rerank_enabled:
            relevant_chunks = self.rerank_chunks(
                relevant_chunks,
                keyword_weight=rerank_keyword_weight,
            )

        return relevant_chunks[:top_k]


vector_service = VectorService()

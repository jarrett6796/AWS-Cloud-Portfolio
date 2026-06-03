from app.config.settings import settings


class VectorService:
    def chunk_text(self, text: str, chunk_size: int = settings.default_chunk_size):
        sections = self._split_markdown_sections(text)
        chunks = []
        current_chunk = ""

        for section in sections:
            for piece in self._split_oversized_section(section, chunk_size):
                if not current_chunk:
                    current_chunk = piece
                    continue

                candidate = f"{current_chunk}\n\n{piece}"

                if len(candidate) <= chunk_size:
                    current_chunk = candidate
                else:
                    chunks.append(current_chunk)
                    current_chunk = piece

        if current_chunk:
            chunks.append(current_chunk)

        return chunks

    def build_chunk_metadata(self, chunk_text: str) -> dict:
        heading = self._extract_first_heading(chunk_text)

        return {
            "char_count": len(chunk_text),
            "heading": heading,
        }

    def _extract_first_heading(self, text: str) -> str | None:
        for line in text.splitlines():
            stripped_line = line.strip()

            if stripped_line.startswith("#"):
                return stripped_line.lstrip("#").strip() or None

        return None

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

    def _split_oversized_section(self, section: str, chunk_size: int) -> list[str]:
        if len(section) <= chunk_size:
            return [section]

        chunks = []
        paragraphs = [paragraph.strip() for paragraph in section.split("\n\n")]
        current_chunk = ""

        for paragraph in paragraphs:
            if not paragraph:
                continue

            if len(paragraph) > chunk_size:
                if current_chunk:
                    chunks.append(current_chunk)
                    current_chunk = ""

                chunks.extend(self._split_by_size(paragraph, chunk_size))
                continue

            if not current_chunk:
                current_chunk = paragraph
                continue

            candidate = f"{current_chunk}\n\n{paragraph}"

            if len(candidate) <= chunk_size:
                current_chunk = candidate
            else:
                chunks.append(current_chunk)
                current_chunk = paragraph

        if current_chunk:
            chunks.append(current_chunk)

        return chunks

    def _split_by_size(self, text: str, chunk_size: int) -> list[str]:
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

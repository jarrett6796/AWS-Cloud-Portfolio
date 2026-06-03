from google import genai
from google.genai.types import GenerateContentConfig

from app.config.settings import settings


class GeminiService:
    def __init__(self):
        self.client = genai.Client(
            vertexai=True,
            project=settings.project_id,
            location=settings.location,
        )

    def generate_text(
        self,
        contents: str,
        temperature: float,
        max_output_tokens: int,
    ) -> str:
        response = self.client.models.generate_content(
            model=settings.generation_model,
            contents=contents,
            config=GenerateContentConfig(
                temperature=temperature,
                max_output_tokens=max_output_tokens,
            ),
        )

        return response.text

    def embed_text(self, text: str) -> list[float]:
        response = self.client.models.embed_content(
            model=settings.embedding_model,
            contents=text,
        )

        return response.embeddings[0].values


gemini_service = GeminiService()

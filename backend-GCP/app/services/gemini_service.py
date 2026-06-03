from google import genai
from google.genai.types import GenerateContentConfig

from app.config.settings import settings
from app.errors import ProviderServiceError


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
        try:
            response = self.client.models.generate_content(
                model=settings.generation_model,
                contents=contents,
                config=GenerateContentConfig(
                    temperature=temperature,
                    max_output_tokens=max_output_tokens,
                ),
            )
        except Exception as error:
            raise ProviderServiceError(error) from error

        return response.text

    def embed_text(self, text: str) -> list[float]:
        try:
            response = self.client.models.embed_content(
                model=settings.embedding_model,
                contents=text,
            )
        except Exception as error:
            raise ProviderServiceError(error) from error

        return response.embeddings[0].values


gemini_service = GeminiService()

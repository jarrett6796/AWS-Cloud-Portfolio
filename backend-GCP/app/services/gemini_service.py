import logging

from google import genai
from google.genai.types import GenerateContentConfig

from app.config.settings import settings
from app.errors import ProviderServiceError


logger = logging.getLogger(__name__)


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
        model: str | None = None,
    ) -> str:
        active_model = model or settings.generation_model
        logger.info(
            "gemini_generate_started",
            extra={
                "model": active_model,
                "temperature": temperature,
                "max_output_tokens": max_output_tokens,
                "content_length": len(contents),
            },
        )

        try:
            response = self.client.models.generate_content(
                model=active_model,
                contents=contents,
                config=GenerateContentConfig(
                    temperature=temperature,
                    max_output_tokens=max_output_tokens,
                ),
            )
        except Exception as error:
            logger.error(
                "gemini_generate_failed",
                extra={"model": active_model},
            )
            raise ProviderServiceError(error) from error

        logger.info(
            "gemini_generate_completed",
            extra={
                "model": active_model,
                "response_length": len(response.text or ""),
            },
        )
        return response.text

    def stream_text(
        self,
        contents: str,
        temperature: float,
        max_output_tokens: int,
    ):
        logger.info(
            "gemini_stream_started",
            extra={
                "model": settings.generation_model,
                "temperature": temperature,
                "max_output_tokens": max_output_tokens,
                "content_length": len(contents),
            },
        )

        try:
            stream = self.client.models.generate_content_stream(
                model=settings.generation_model,
                contents=contents,
                config=GenerateContentConfig(
                    temperature=temperature,
                    max_output_tokens=max_output_tokens,
                ),
            )

            for chunk in stream:
                if chunk.text:
                    yield chunk.text
        except Exception as error:
            logger.error(
                "gemini_stream_failed",
                extra={"model": settings.generation_model},
            )
            raise ProviderServiceError(error) from error

        logger.info(
            "gemini_stream_completed",
            extra={"model": settings.generation_model},
        )

    def embed_text(self, text: str) -> list[float]:
        logger.info(
            "gemini_embedding_started",
            extra={
                "model": settings.embedding_model,
                "text_length": len(text),
            },
        )

        try:
            response = self.client.models.embed_content(
                model=settings.embedding_model,
                contents=text,
            )
        except Exception as error:
            logger.error(
                "gemini_embedding_failed",
                extra={"model": settings.embedding_model},
            )
            raise ProviderServiceError(error) from error

        embedding = response.embeddings[0].values
        logger.info(
            "gemini_embedding_completed",
            extra={
                "model": settings.embedding_model,
                "embedding_dimensions": len(embedding),
            },
        )
        return embedding


gemini_service = GeminiService()

from fastapi import APIRouter

from app.config.settings import settings
from app.schemas.chat_schema import ChatRequest, ChatResponse, ChatWithDocsResponse
from app.services.gcs_service import gcs_service
from app.services.gemini_service import gemini_service


router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    answer = gemini_service.generate_text(
        contents=request.question,
        temperature=0.3,
        max_output_tokens=512,
    )

    return {
        "question": request.question,
        "answer": answer,
    }


@router.post("/chat-with-docs", response_model=ChatWithDocsResponse)
def chat_with_docs(request: ChatRequest):
    documents = {
        file_name: gcs_service.read_text_file(file_name)
        for file_name in settings.direct_context_documents
    }

    context = "\n\n".join(
        f"<{file_name}>\n{text}\n</{file_name}>"
        for file_name, text in documents.items()
    )

    prompt = f"""
You are an AI assistant for Jarrett's Cloud Resume Challenge / AI Cloud Portfolio project.

Answer the user's question using the project context below.
If the answer is not found in the context, say you do not know based on the uploaded project documents.

<context>
{context}
</context>

User question:
{request.question}
"""

    answer = gemini_service.generate_text(
        contents=prompt,
        temperature=0.2,
        max_output_tokens=800,
    )

    return {
        "question": request.question,
        "answer": answer,
        "sources": list(settings.direct_context_documents),
    }

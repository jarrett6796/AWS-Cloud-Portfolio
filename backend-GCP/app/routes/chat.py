from fastapi import APIRouter, HTTPException, Request

from app.config.settings import settings
from app.schemas.chat_schema import ChatRequest, ChatResponse, ChatWithDocsResponse
from app.services.gcs_service import gcs_service
from app.services.gemini_service import gemini_service
from app.services.rag_policy import ACTION_REFUSE, PolicyDecision, evaluate_policy
from app.services.rate_limit_service import rate_limit_service


router = APIRouter()
_RATE_LIMIT_DETAIL = "Rate limit exceeded. Please try again later."
_CHAT_POLICY_BLOCK_REASONS = {"prompt_injection", "secret_request"}


def _rate_limit_key(request: Request, session_id: str | None = None) -> str:
    client = getattr(request, "client", None)
    client_host = getattr(client, "host", None)
    return client_host or session_id or "anonymous"


def _enforce_chat_rate_limit(request: Request, session_id: str | None = None) -> None:
    if rate_limit_service.is_allowed(_rate_limit_key(request, session_id)):
        return

    raise HTTPException(status_code=429, detail=_RATE_LIMIT_DETAIL)


def _chat_policy_block(question: str) -> PolicyDecision | None:
    policy_decision = evaluate_policy(question)

    if (
        policy_decision.action == ACTION_REFUSE
        and policy_decision.reason in _CHAT_POLICY_BLOCK_REASONS
    ):
        return policy_decision

    return None


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, http_request: Request):
    _enforce_chat_rate_limit(http_request, request.session_id)

    policy_decision = _chat_policy_block(request.question)
    if policy_decision is not None:
        return {
            "question": request.question,
            "answer": policy_decision.user_message,
        }

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
def chat_with_docs(request: ChatRequest, http_request: Request):
    _enforce_chat_rate_limit(http_request, request.session_id)

    policy_decision = _chat_policy_block(request.question)
    if policy_decision is not None:
        return {
            "question": request.question,
            "answer": policy_decision.user_message,
            "sources": [],
        }

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

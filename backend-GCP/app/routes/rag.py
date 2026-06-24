from fastapi import APIRouter, Header, HTTPException, Request
from fastapi.responses import StreamingResponse

from app.schemas.chat_schema import ChatRequest, IngestResponse, RagResponse
from app.security import require_admin_token
from app.services.ingestion_service import ingestion_service
from app.services.rag_service import rag_service
from app.services.rate_limit_service import rate_limit_service


router = APIRouter()
_RATE_LIMIT_DETAIL = "Rate limit exceeded. Please try again later."


def _rate_limit_key(request: Request, session_id: str | None = None) -> str:
    client = getattr(request, "client", None)
    client_host = getattr(client, "host", None)
    return client_host or session_id or "anonymous"


def _enforce_rag_rate_limit(request: Request, session_id: str | None = None) -> None:
    if rate_limit_service.is_allowed(_rate_limit_key(request, session_id)):
        return

    raise HTTPException(status_code=429, detail=_RATE_LIMIT_DETAIL)


@router.post("/ingest-docs", response_model=IngestResponse)
def ingest_docs(x_admin_token: str | None = Header(default=None)):
    require_admin_token(x_admin_token)
    return ingestion_service.ingest_documents()


@router.get("/rag-analytics/summary")
def rag_analytics_summary(
    limit: int = 100,
    x_admin_token: str | None = Header(default=None),
):
    require_admin_token(x_admin_token)
    return rag_service.get_analytics_summary(limit=limit)


@router.post("/ask-rag", response_model=RagResponse)
def ask_rag(chat_request: ChatRequest, request: Request):
    _enforce_rag_rate_limit(request, chat_request.session_id)
    return rag_service.answer_question(
        chat_request.question,
        chat_request.history,
        session_id=chat_request.session_id,
        metadata_filter=chat_request.metadata_filter,
        request_id=getattr(request.state, "request_id", None),
    )


@router.post("/ask-rag-stream")
def ask_rag_stream(chat_request: ChatRequest, request: Request):
    _enforce_rag_rate_limit(request, chat_request.session_id)
    return StreamingResponse(
        rag_service.stream_answer(
            chat_request.question,
            chat_request.history,
            session_id=chat_request.session_id,
            metadata_filter=chat_request.metadata_filter,
            request_id=getattr(request.state, "request_id", None),
        ),
        media_type="text/event-stream",
    )

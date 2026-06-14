from fastapi import APIRouter, Header, Request
from fastapi.responses import StreamingResponse

from app.schemas.chat_schema import ChatRequest, IngestResponse, RagResponse
from app.security import require_ingestion_admin_token
from app.services.ingestion_service import ingestion_service
from app.services.rag_service import rag_service


router = APIRouter()


@router.post("/ingest-docs", response_model=IngestResponse)
def ingest_docs(x_admin_token: str | None = Header(default=None)):
    require_ingestion_admin_token(x_admin_token)
    return ingestion_service.ingest_documents()


@router.post("/ask-rag", response_model=RagResponse)
def ask_rag(chat_request: ChatRequest, request: Request):
    return rag_service.answer_question(
        chat_request.question,
        chat_request.history,
        session_id=chat_request.session_id,
        metadata_filter=chat_request.metadata_filter,
        request_id=getattr(request.state, "request_id", None),
    )


@router.post("/ask-rag-stream")
def ask_rag_stream(chat_request: ChatRequest, request: Request):
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

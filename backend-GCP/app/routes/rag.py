from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.schemas.chat_schema import ChatRequest, IngestResponse, RagResponse
from app.services.ingestion_service import ingestion_service
from app.services.rag_service import rag_service


router = APIRouter()


@router.post("/ingest-docs", response_model=IngestResponse)
def ingest_docs():
    return ingestion_service.ingest_documents()


@router.post("/ask-rag", response_model=RagResponse)
def ask_rag(request: ChatRequest):
    return rag_service.answer_question(request.question, request.history)


@router.post("/ask-rag-stream")
def ask_rag_stream(request: ChatRequest):
    return StreamingResponse(
        rag_service.stream_answer(request.question, request.history),
        media_type="text/event-stream",
    )

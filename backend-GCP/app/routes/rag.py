from fastapi import APIRouter

from app.schemas.chat_schema import ChatRequest, IngestResponse, RagResponse
from app.services.ingestion_service import ingestion_service
from app.services.rag_service import rag_service


router = APIRouter()


@router.post("/ingest-docs", response_model=IngestResponse)
def ingest_docs():
    return ingestion_service.ingest_documents()


@router.post("/ask-rag", response_model=RagResponse)
def ask_rag(request: ChatRequest):
    return rag_service.answer_question(request.question)

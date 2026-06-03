from pydantic import BaseModel


class ChatRequest(BaseModel):
    question: str


class SourceMetadata(BaseModel):
    file_name: str
    chunk_index: int
    score: float


class ChatResponse(BaseModel):
    question: str
    answer: str


class ChatWithDocsResponse(ChatResponse):
    sources: list[str]


class RagResponse(ChatResponse):
    sources: list[SourceMetadata]


class IngestResponse(BaseModel):
    status: str
    chunks_created: int
    chunks_pruned: int = 0

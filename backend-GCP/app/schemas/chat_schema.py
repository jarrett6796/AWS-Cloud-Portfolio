from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    question: str
    session_id: str | None = None
    history: list[ChatMessage] = Field(default_factory=list)


class SourceMetadata(BaseModel):
    source_id: str | None = None
    file_name: str
    chunk_index: int
    score: float
    vector_score: float | None = None
    keyword_score: float | None = None
    rerank_score: float | None = None
    content_hash: str | None = None
    heading: str | None = None
    char_count: int | None = None


class ChatResponse(BaseModel):
    question: str
    answer: str


class ChatWithDocsResponse(ChatResponse):
    sources: list[str]


class RagResponse(ChatResponse):
    session_id: str
    sources: list[SourceMetadata]
    retrieval_query: str | None = None
    query_rewritten: bool = False


class IngestResponse(BaseModel):
    status: str
    chunks_created: int
    chunks_pruned: int = 0

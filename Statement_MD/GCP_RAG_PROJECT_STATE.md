# GCP RAG Project State

This file is the current source of truth for the GCP RAG backend.

The GCP backend exists because the original AWS Lambda/Bedrock RAG path was deferred. The current working AI/RAG implementation is built on GCP Cloud Run, Gemini, Firestore, and Google Cloud Storage.

## Current GCP Architecture

```text
React Frontend
  -> src/api/chat.js
  -> POST /ask-rag
  -> Cloud Run FastAPI backend
  -> Gemini embedding model
  -> Firestore document_chunks retrieval
  -> Gemini 2.5 Flash response generation
  -> React assistant response UI
```

## Backend Stack

- Python 3.11
- FastAPI
- Uvicorn
- Cloud Run
- google-genai
- google-cloud-storage
- google-cloud-firestore

## AI Models

Generation:

```text
gemini-2.5-flash
```

Embeddings:

```text
text-embedding-005
```

## Cloud Resources

### Cloud Run

Hosts the FastAPI backend.

### Google Cloud Storage

Document bucket:

```text
cloud-resume-ai-rag-docs
```

Stores source markdown documents used for ingestion and retrieval context.

### Firestore

Collection:

```text
document_chunks
```

Fields:

- `file_name`
- `chunk_index`
- `chunk_text`
- `embedding`

## Current Endpoints

### `GET /`

Health check.

### `POST /chat`

Basic Gemini chat without document retrieval.

### `POST /chat-with-docs`

Loads selected GCS markdown documents directly and sends them as context.

### `POST /ingest-docs`

Reads markdown files from GCS, chunks text, generates embeddings, and stores chunks in Firestore.

### `POST /ask-rag`

Embeds the user question, retrieves top matching Firestore chunks using cosine similarity, sends retrieved context to Gemini, and returns answer plus sources.

## Current Backend File Structure

```text
backend-GCP/
├── app/
│   ├── config/
│   │   └── settings.py
│   ├── schemas/
│   │   └── chat_schema.py
│   ├── routes/
│   │   ├── chat.py
│   │   ├── health.py
│   │   └── rag.py
│   └── services/
│       ├── firestore_service.py
│       ├── gcs_service.py
│       ├── gemini_service.py
│       ├── ingestion_service.py
│       ├── rag_service.py
│       └── vector_service.py
├── Dockerfile
├── main.py
└── requirements.txt
```

`main.py` currently contains:

- FastAPI app setup
- CORS config
- router registration

Environment config has been extracted to `app/config/settings.py`.
Request and response schemas have been extracted to `app/schemas/chat_schema.py`.
Gemini generation and embedding calls have been extracted to `app/services/gemini_service.py`.
GCS, Firestore, vector scoring, ingestion, RAG orchestration, and route handlers have been extracted into `app/services/` and `app/routes/`.

## Current Backend Limitations

- `main.py` is now thin, controlled error handling exists, and structured Cloud Run logging exists.
- Chunking now respects Markdown headings and paragraph boundaries before falling back to size splitting.
- Retrieval is full Firestore scan plus cosine similarity with a configurable candidate pool and score threshold.
- No reranking.
- No streaming response support.
- No chat history.
- Ingestion now uses deterministic Firestore chunk IDs and prunes stale duplicate chunk documents.

## Recommended Backend Refactor Order

Completed:

1. `app/config/settings.py`
2. `app/schemas/chat_schema.py`
3. `app/services/gemini_service.py`
4. `app/services/gcs_service.py`
5. `app/services/firestore_service.py`
6. `app/services/vector_service.py`
7. `app/services/rag_service.py`
8. `app/services/ingestion_service.py`
9. `app/routes/health.py`
10. `app/routes/chat.py`
11. `app/routes/rag.py`
12. Response schemas in `app/schemas/chat_schema.py`
13. Config cleanup for CORS, document lists, chunk size, and top-k defaults

Next:

1. Evaluate optional hybrid keyword + vector retrieval.
2. Evaluate optional reranking.
3. Add grounded answer citations.

## Advanced RAG Roadmap

The backend should move from MVP RAG to advanced RAG through small, verifiable phases.

1. Controlled error handling.
2. Structured logging.
3. Idempotent ingestion.
4. Better markdown-aware chunking.
5. Chunk metadata and content hashing.
6. Improved retrieval with score thresholds and a larger candidate pool.
7. Optional hybrid keyword + vector retrieval.
8. Optional reranking.
9. Grounded answer prompt with citations.
10. Chat history.
11. Streaming responses.
12. Monitoring and production hardening.

Active phase:

```text
Phase 7 — Optional hybrid keyword + vector retrieval
```

Completed advanced RAG phases:

1. Controlled error handling.
2. Structured logging.
3. Idempotent ingestion.
4. Better markdown-aware chunking.
5. Chunk metadata and content hashing.
6. Improved retrieval with score thresholds and larger candidate pool.

Phase 1 result:

- Added controlled backend exceptions.
- Wrapped Gemini, GCS, Firestore, RAG, and ingestion boundaries.
- Added stable JSON error payloads with `error` and `message` fields.
- Preserved FastAPI validation behavior.
- Preserved current endpoint paths and Cloud Run entrypoint.

Next advanced RAG phase:

```text
Phase 7 — Optional hybrid keyword + vector retrieval
```

Phase 2 result:

- Added `app/logging_config.py` with JSON-formatted stdout logs for Cloud Run.
- Added `LOG_LEVEL` config support.
- Added request start/completion/failure logs with request IDs and duration.
- Added controlled backend error logs with exception details.
- Added metadata-only service logs for Gemini, GCS, Firestore, ingestion, and RAG flow.
- Avoided logging prompt text, document bodies, embeddings, or generated answer content.

Phase 3 result:

- Replaced random Firestore chunk document creation with deterministic chunk document IDs.
- Made ingestion rerunnable without adding duplicate chunks for the same file and chunk index.
- Added per-file pruning for stale or legacy duplicate chunk documents after successful upserts.
- Added `chunks_pruned` to the `/ingest-docs` response.
- Preserved the `/ingest-docs` endpoint path and existing `chunks_created` response field.

Phase 4 result:

- Replaced fixed-size-only chunking with Markdown-aware section chunking.
- Preserved headings with their section content when possible.
- Split oversized sections on paragraph boundaries before falling back to size slicing.
- Added focused unit tests for Markdown chunking behavior.

Phase 5 result:

- Added chunk metadata extraction in `vector_service.py`.
- Stored `content_hash`, `char_count`, and `heading` on Firestore chunk documents.
- Added optional `content_hash`, `heading`, and `char_count` fields to `/ask-rag` source metadata.
- Included headings in retrieved prompt context when available.
- Added tests for heading and character-count metadata extraction.

Phase 6 result:

- Added `RAG_CANDIDATE_POOL_SIZE` config.
- Added `RAG_SCORE_THRESHOLD` config.
- Added retrieval selection logic that ranks a larger candidate pool, filters weak scores, and returns at most `RAG_TOP_K` chunks.
- Added retrieval logs for candidate pool size and score threshold.
- Added unit tests for threshold filtering and candidate-pool behavior.

Target pattern:

```text
request -> route -> service -> provider/client
```

Do not rewrite all backend code at once. Extract one layer at a time and verify after each step.

## Backend Verification

Compile check:

```bash
cd backend-GCP
python -m py_compile main.py
```

Cloud Run deploy command used during MVP:

```bash
gcloud run deploy gcp-rag-backend \
  --source . \
  --region asia-east1 \
  --allow-unauthenticated \
  --clear-base-image \
  --set-env-vars GOOGLE_CLOUD_PROJECT=cloud-resume-ai-rag,GOOGLE_CLOUD_LOCATION=us-central1,DOCS_BUCKET=cloud-resume-ai-rag-docs
```

Smoke test:

```bash
curl -X POST https://gcp-rag-backend-189047029621.asia-east1.run.app/ask-rag \
  -H "Content-Type: application/json" \
  -d '{"question":"What is the current project architecture?"}'
```

# GCP RAG Development Log

This file records the history of the GCP RAG backend pivot and implementation.

For current backend state, see `GCP_RAG_PROJECT_STATE.md`.
For overall project state, see `CAPSTONE_PROJECT_STATE.md`.

## Phase 1 — Initial Portfolio

Completed:

- Built React + Vite frontend.
- Created responsive portfolio UI.
- Added project sections.
- Added modal system.
- Added multilingual content structure.

## Phase 2 — AI Assistant UI

Completed:

- Added floating AI assistant shell.
- Added expandable chat panel.
- Added placeholder assistant UI.
- Added suggested prompts.

Limitation:

- Assistant was frontend-only and static.

## Phase 3 — Original AWS RAG Direction

Original plan:

- API Gateway
- Lambda
- Amazon Bedrock
- Bedrock Knowledge Bases
- S3 document storage
- S3 Vectors

Problem:

- Lambda/Bedrock RAG access and configuration complexity slowed implementation.
- Continuing with that path would delay having a working end-to-end RAG system.

Decision:

- Keep AWS for the serverless visitor counter milestone.
- Pivot AI/RAG backend to GCP to complete a working deployed RAG assistant.

## Phase 4 — GCP RAG Pivot

New stack:

- Cloud Run
- FastAPI
- Vertex AI Gemini API
- Firestore
- Google Cloud Storage

Reasoning:

- Faster path to working RAG MVP.
- Good portfolio signal for cloud + AI engineering.
- Serverless backend remains production-relevant.

## Phase 5 — Cloud Run FastAPI Backend

Completed endpoints:

- `GET /`
- `POST /chat`
- `POST /chat-with-docs`
- `POST /ingest-docs`
- `POST /ask-rag`

Result:

- Backend can run as a Cloud Run service.
- Frontend can call `/ask-rag` through the configured API base URL.

## Phase 6 — GCS Document Context

Completed:

- Uploaded markdown project documents into GCS bucket:

```text
cloud-resume-ai-rag-docs
```

- Implemented helper to read text files from GCS.
- Implemented `/chat-with-docs` for direct document-context prompting.

## Phase 7 — Embedding and Ingestion

Completed:

- Implemented text chunking.
- Generated embeddings using:

```text
text-embedding-005
```

- Stored document chunks and embeddings in Firestore.

Firestore collection:

```text
document_chunks
```

## Phase 8 — Firestore Retrieval

Completed:

- Embedded user question.
- Scanned Firestore document chunks.
- Calculated cosine similarity.
- Selected top chunks.
- Built retrieved context.
- Sent context to Gemini for grounded answer generation.

## Phase 9 — Frontend Integration

Completed:

- Added `src/api/chat.js`.
- Connected homepage AI assistant to `/ask-rag`.
- Added loading states.
- Added error handling.
- Rendered answer and retrieved sources.

## Phase 10 — CORS Fix

Problem:

```text
No 'Access-Control-Allow-Origin'
```

Solution:

- Added FastAPI `CORSMiddleware`.
- Allowed local Vite development origins:

```text
http://localhost:5173
http://localhost:5174
```

Result:

- Frontend successfully connected to the Cloud Run backend during local development.

## Phase 11 — Frontend Modularization

Completed on 2026-05-28:

- Extracted frontend content, API calls, hooks, components, and page composition.
- Reduced `App.jsx` to a thin shell.
- Kept `/ask-rag` behavior working through `src/api/chat.js`.
- Verified `npm run lint` and `npm run build` after extraction steps.

## Phase 12 — Backend Refactor Start

Completed on 2026-06-03:

- Created `backend-GCP/app/config/settings.py`.
- Moved environment-backed backend settings out of `main.py`.
- Created `backend-GCP/app/schemas/chat_schema.py`.
- Moved `ChatRequest` out of `main.py`.
- Preserved existing Cloud Run entrypoint behavior with `main:app`.
- Preserved current endpoints:
  - `GET /`
  - `POST /chat`
  - `POST /chat-with-docs`
  - `POST /ingest-docs`
  - `POST /ask-rag`

Result:

- The first backend refactor slice is complete.
- The backend still works in MVP form.
- Service and route extraction remain next.

## Phase 13 — Gemini Service Extraction

Completed on 2026-06-03:

- Created `backend-GCP/app/services/gemini_service.py`.
- Moved Gemini client setup out of `main.py`.
- Moved Gemini text generation calls behind `gemini_service.generate_text`.
- Moved Gemini embedding calls behind `gemini_service.embed_text`.
- Preserved existing endpoint paths and response shapes.
- Preserved Cloud Run entrypoint behavior with `main:app`.

Result:

- `main.py` no longer imports `google.genai` directly.
- Generation and embedding provider logic now has a dedicated service boundary.
- GCS, Firestore, vector scoring, RAG orchestration, and route extraction remain next.

## Phase 14 — Backend Service and Route Extraction

Completed on 2026-06-03:

- Created `backend-GCP/app/services/gcs_service.py`.
- Created `backend-GCP/app/services/firestore_service.py`.
- Created `backend-GCP/app/services/vector_service.py`.
- Created `backend-GCP/app/services/rag_service.py`.
- Created `backend-GCP/app/services/ingestion_service.py`.
- Created route modules:
  - `backend-GCP/app/routes/health.py`
  - `backend-GCP/app/routes/chat.py`
  - `backend-GCP/app/routes/rag.py`
- Added response schemas in `backend-GCP/app/schemas/chat_schema.py`.
- Moved configurable CORS origins, document lists, chunk size, and RAG top-k values into `settings.py`.
- Reduced `main.py` to FastAPI app creation, CORS setup, and router registration.
- Preserved Cloud Run entrypoint behavior with `main:app`.
- Preserved current endpoint paths:
  - `GET /`
  - `POST /chat`
  - `POST /chat-with-docs`
  - `POST /ingest-docs`
  - `POST /ask-rag`

Result:

- Backend refactor tasks 1 through 8 are complete.
- Error handling was intentionally left for review before implementation.
- RAG quality improvements should start after error-handling direction is approved.

## Current GCP RAG Status

Working:

- Cloud Run FastAPI backend.
- Gemini generation.
- GCS document loading.
- Firestore chunk storage.
- Embedding generation.
- Cosine similarity retrieval.
- `/ask-rag` frontend integration.
- Source rendering in the assistant UI.
- Config extraction.
- Request schema extraction.
- Gemini service extraction.
- GCS service extraction.
- Firestore service extraction.
- Vector service extraction.
- RAG service extraction.
- Ingestion service extraction.
- Route module extraction.
- Response schema extraction.
- Config cleanup for CORS, document lists, chunk size, and top-k defaults.

Needs improvement:

- Structured logging.
- Better chunking.
- Better retrieval ranking.
- Streaming responses.
- Chat history.
- Production monitoring.

## Next Backend Milestone

Begin incremental backend refactor without breaking Cloud Run:

Completed:

1. Extract settings.
2. Extract request schemas.
3. Extract Gemini service.
4. Extract GCS and Firestore services.
5. Extract vector/RAG orchestration.
6. Move endpoints into route modules.
7. Add response schemas.
8. Improve config defaults.

Next:

1. Add structured logging.
2. Make ingestion idempotent.
3. Begin RAG quality improvements.

## Advanced RAG Roadmap

Planned implementation order:

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

Current implementation focus:

```text
Phase 5 — Chunk metadata and content hashing
```

Phase 1 through Phase 4 are complete. Phase 5 should add richer chunk metadata and content hashes without changing endpoint paths.

## Phase 18 — Markdown-Aware Chunking

Completed on 2026-06-04:

- Replaced fixed-size-only text chunking in `app/services/vector_service.py`.
- Added Markdown section splitting based on heading lines.
- Preserved headings with their section content when possible.
- Added paragraph-aware splitting for oversized sections.
- Preserved size-based splitting as the final fallback.
- Added `backend-GCP/tests/test_vector_service.py`.
- Covered:
  - Markdown section preservation
  - combining small sections when they fit
  - oversized paragraph fallback splitting

Result:

- Advanced RAG Phase 4 is complete.
- Ingested chunks should now be more semantically useful for Markdown project documentation.
- Existing endpoint paths and response schemas were preserved.
- Chunk metadata and content hashing is the next phase.

## Phase 17 — Idempotent Ingestion

Completed on 2026-06-04:

- Updated Firestore chunk writes to use deterministic document IDs based on file name and chunk index.
- Replaced random Firestore `.add()` writes with deterministic `.document(id).set(...)` upserts.
- Added `ingestion_key` and `updated_at` metadata to chunk documents.
- Added per-file pruning after successful upserts.
- Pruning removes stale or legacy duplicate chunk documents for the same source file.
- Added `chunks_pruned` to the `/ingest-docs` response model and service response.
- Preserved existing endpoint path:
  - `POST /ingest-docs`
- Preserved existing `chunks_created` response field.

Result:

- Advanced RAG Phase 3 is complete.
- Re-running ingestion should no longer create duplicate chunks for the same source file and chunk index.
- Legacy random-ID duplicates from earlier MVP ingestion can be cleaned up during the next successful ingestion run.
- Better markdown-aware chunking was completed in Phase 18.

## Phase 16 — Structured Logging

Completed on 2026-06-04:

- Created `backend-GCP/app/logging_config.py`.
- Added JSON-formatted stdout logs for Cloud Run compatibility.
- Added `LOG_LEVEL` config support in `app/config/settings.py`.
- Added request lifecycle logging in `main.py`:
  - request start
  - request completion
  - request failure
  - generated or forwarded `X-Request-ID`
  - request duration in milliseconds
- Added controlled backend error logs in `app/errors.py`.
- Added metadata-only service logs for:
  - Gemini text generation
  - Gemini embedding calls
  - GCS document reads
  - Firestore chunk writes
  - Firestore chunk streaming
  - ingestion start/file chunking/completion
  - RAG answer start/retrieval/completion

Important guardrails:

- Prompt text is not logged.
- Document body text is not logged.
- Embedding vectors are not logged.
- Generated answer content is not logged.

Result:

- Advanced RAG Phase 2 is complete.
- Cloud Run logs should now be easier to filter by message, level, request ID, endpoint path, provider model, file name, chunk count, and duration.
- Idempotent ingestion was completed in Phase 17.

## Phase 15 — Controlled Error Handling

Completed on 2026-06-04:

- Created `backend-GCP/app/errors.py`.
- Added controlled backend exception classes:
  - `ProviderServiceError`
  - `StorageServiceError`
  - `DatabaseServiceError`
  - `RagServiceError`
  - `IngestionServiceError`
- Added a FastAPI exception handler for backend service errors.
- Wrapped Gemini generation and embedding calls.
- Wrapped GCS document reads.
- Wrapped Firestore writes and chunk streaming.
- Wrapped RAG orchestration.
- Wrapped ingestion orchestration.
- Preserved FastAPI request validation behavior.
- Preserved endpoint paths:
  - `GET /`
  - `POST /chat`
  - `POST /chat-with-docs`
  - `POST /ingest-docs`
  - `POST /ask-rag`

Result:

- Advanced RAG Phase 1 is complete.
- Backend provider/storage/database/orchestration failures now return controlled JSON error payloads.
- Structured logging was completed in Phase 16.

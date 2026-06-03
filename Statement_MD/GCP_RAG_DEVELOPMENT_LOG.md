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

Needs improvement:

- Backend modularization.
- Better chunking.
- Better retrieval ranking.
- Streaming responses.
- Chat history.
- Structured logging.
- Production monitoring.

## Next Backend Milestone

Begin incremental backend refactor without breaking Cloud Run:

Completed:

1. Extract settings.
2. Extract request schemas.

Next:

1. Extract Gemini service.
2. Extract GCS and Firestore services.
3. Extract vector/RAG orchestration.
4. Move endpoints into route modules.

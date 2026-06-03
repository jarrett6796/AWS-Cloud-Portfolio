# Project State

## Current Identity

This project is a cloud engineering portfolio and serverless RAG assistant platform.

The original target was an AWS Cloud Resume + Lambda/Bedrock RAG architecture. Because the Lambda/Bedrock RAG path was not practical to complete at the current stage, the AI/RAG backend was intentionally pivoted to Google Cloud Platform.

Current working direction:

```text
React + Vite Portfolio
  -> AWS serverless visitor counter
  -> GCP Cloud Run RAG backend
  -> Gemini + Firestore + GCS retrieval
```

This means the project currently demonstrates both:

- AWS serverless fundamentals through the deployed visitor counter path.
- GCP AI/RAG engineering through the working Cloud Run + Gemini + Firestore retrieval backend.

## Current Stack

### Frontend

- React + Vite
- JavaScript
- Plain CSS
- Modular component/hook/API structure
- Dark/light mode
- Bilingual UI: English and Traditional Chinese
- Floating homepage AI assistant
- Project modal workspace
- Live visitor counter

### AWS Visitor Counter

- S3 static hosting
- CloudFront CDN + HTTPS
- API Gateway
- Lambda
- DynamoDB

### GCP RAG Backend

- FastAPI
- Cloud Run
- Vertex AI Gemini API
- Gemini 2.5 Flash
- text-embedding-005
- Firestore document chunks and embeddings
- Google Cloud Storage document source files

## Current Architecture

```text
Browser
  -> React + Vite frontend
  -> Visitor counter request
  -> AWS API Gateway
  -> AWS Lambda
  -> DynamoDB

Browser
  -> React + Vite frontend
  -> /ask-rag request
  -> GCP Cloud Run FastAPI backend
  -> Firestore retrieval
  -> Gemini response generation
  -> React AI assistant
```

## Current Frontend Structure

```text
frontend-Vite/src/
├── api/
│   ├── chat.js
│   └── visitors.js
├── components/
│   ├── AIChat.jsx
│   ├── ChatPanel.jsx
│   ├── Navbar.jsx
│   ├── PortfolioSection.jsx
│   └── ProjectModal.jsx
├── content/
│   └── portfolioContent.js
├── hooks/
│   ├── useAssistantChat.js
│   ├── useScrollTracker.js
│   └── useTheme.js
├── pages/
│   └── Home.jsx
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

`App.jsx` is now intentionally thin and delegates page composition to `pages/Home.jsx`.

## Repository Layout Decision

The capstone should be tracked as one outer Git repository.

- `frontend-Vite/` is part of the main capstone repository.
- `frontend-Vite/` should not contain its own `.git` directory.
- V1 should be recorded with a Git commit/tag plus `Statement_MD/CAPSTONE_V1_TEST_RECORD.md`, not by copying the full project folder.
- Local generated files such as `.DS_Store`, `node_modules/`, `dist/`, and `.env` are ignored by the root `.gitignore`.

## Current Backend Structure

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

The backend works, but it is still MVP-shaped. The main backend refactor is now mostly complete: config, schemas, services, and route modules have been extracted while preserving `main:app` for Cloud Run.

## Working Features

- Frontend production build works.
- Frontend lint passes.
- Portfolio UI is modularized.
- Homepage AI assistant calls `/ask-rag` through `src/api/chat.js`.
- Visitor counter logic is isolated in `src/api/visitors.js`.
- Theme behavior is isolated in `useTheme.js`.
- Scroll progress and active section tracking are isolated in `useScrollTracker.js`.
- GCP backend supports `/ask-rag` retrieval and Gemini generation.
- GCP backend supports `/ingest-docs` document chunking and embedding storage.
- Backend config now lives in `backend-GCP/app/config/settings.py`.
- Backend request and response schemas now live in `backend-GCP/app/schemas/chat_schema.py`.
- Gemini generation and embedding calls now live in `backend-GCP/app/services/gemini_service.py`.
- GCS access now lives in `backend-GCP/app/services/gcs_service.py`.
- Firestore access now lives in `backend-GCP/app/services/firestore_service.py`.
- Chunking, cosine similarity, and top-k selection now live in `backend-GCP/app/services/vector_service.py`.
- RAG orchestration now lives in `backend-GCP/app/services/rag_service.py`.
- Document ingestion now lives in `backend-GCP/app/services/ingestion_service.py`.
- Endpoint handlers now live in `backend-GCP/app/routes/`.

## Known Limitations

- Retrieval now uses vector scoring, optional hybrid keyword scoring, optional reranking, a configurable candidate pool, and a score threshold, but still scans Firestore in memory.
- Chunking now respects Markdown headings and paragraph boundaries before falling back to size splitting.
- No streaming responses yet.
- Chat history is lightweight and client-held; no persistent server-side history yet.
- Grounded answer prompt now requires source ID citations for factual claims.
- Ingestion now uses deterministic Firestore chunk IDs and prunes stale duplicate chunk documents.
- Contact form is UI-only.
- Original AWS Lambda/Bedrock RAG path is deferred, not the current implementation.

## Current RAG Maturity

Current classification:

```text
Intermediate RAG with several advanced RAG features implemented.
```

This backend is no longer naive RAG. It has moved beyond basic chunk/embed/retrieve/generate because it now includes controlled errors, structured logging, idempotent ingestion, Markdown-aware chunking, chunk metadata, content hashes, score thresholds, a larger candidate pool, opt-in hybrid keyword scoring, opt-in reranking, and source-ID citations.

It is not yet fully production-grade advanced RAG because retrieval still scans Firestore in memory and the system does not yet include persistent chat history, streaming responses, query rewriting, production vector indexing, automated evaluation in CI, or monitoring dashboards.

## Near-Term Next Steps

### Frontend Next Steps

- Keep current modular frontend stable.
- Avoid visual redesign unless it improves clarity.
- Optionally remove unused starter assets later.
- Keep build/lint verification after each frontend change.

### Backend

Refactor in this order:

Completed:

1. `app/config/settings.py`
2. `app/schemas/chat_schema.py`
3. `app/services/gemini_service.py`
4. `app/services/gcs_service.py`
5. `app/services/firestore_service.py`
6. `app/services/vector_service.py`
7. `app/services/rag_service.py`
8. `app/services/ingestion_service.py`
9. `app/routes/health.py`, `chat.py`, `rag.py`
10. Response schemas in `app/schemas/chat_schema.py`
11. Config cleanup for CORS, document lists, chunk size, and top-k defaults

Next:

1. Add streaming responses.
2. Add monitoring and production hardening.
3. Evaluate whether persistent chat history is needed.

### Advanced RAG Roadmap

Planned order:

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

Current backend phase:

```text
Phase 11 — Streaming responses
```

Completed advanced RAG phases:

1. Controlled error handling.
2. Structured logging.
3. Idempotent ingestion.
4. Better markdown-aware chunking.
5. Chunk metadata and content hashing.
6. Improved retrieval with score thresholds and larger candidate pool.
7. Optional hybrid keyword + vector retrieval.
8. Optional reranking.
9. Grounded answer prompt with citations.
10. Chat history.

Phase 1 added controlled backend exceptions and stable JSON error payloads while preserving endpoint paths and `main:app`.

Phase 2 added JSON-formatted Cloud Run logs, request IDs, request duration logs, controlled error logs, and metadata-only service logs for Gemini, GCS, Firestore, ingestion, and RAG flow.

Phase 3 made `/ingest-docs` rerunnable by using deterministic Firestore chunk document IDs and pruning stale duplicate chunk documents after successful file ingestion.

Phase 4 replaced fixed-size-only chunking with Markdown-aware chunking that keeps headings with section content and falls back to paragraph or size splitting for oversized sections.

Phase 5 added chunk metadata and content hashes, including Firestore fields for `content_hash`, `char_count`, and `heading`, plus optional `/ask-rag` source metadata fields.

Phase 6 added configurable retrieval selection with `RAG_CANDIDATE_POOL_SIZE` and `RAG_SCORE_THRESHOLD`, so weak chunks are filtered before the final `RAG_TOP_K` prompt context is built.

Phase 7 added opt-in hybrid keyword + vector retrieval with `RAG_HYBRID_ENABLED` and `RAG_VECTOR_SCORE_WEIGHT`. Hybrid retrieval is disabled by default to preserve current Cloud Run behavior.

Phase 8 added opt-in deterministic reranking with `RAG_RERANK_ENABLED` and `RAG_RERANK_KEYWORD_WEIGHT`. Reranking is disabled by default to preserve current Cloud Run behavior.

Phase 9 added stable source IDs, source metadata, and stricter prompt instructions requiring citation labels such as `[S1]` for factual claims.

Phase 10 added lightweight chat history. The frontend keeps recent user/assistant turns in memory and sends them to `/ask-rag`; the backend includes recent conversation context in the prompt while keeping retrieved documents as the only factual source.

## Latest RAG Deployment Test

Completed on 2026-06-04:

- Deployed latest backend to Cloud Run revision:
  - `gcp-rag-backend-00009-m6h`
- Current RAG source file in GCS:
  - `CAPSTONE_PROJECT_STATE.md`
- Cloud Run ingestion environment now uses:
  - `INGEST_DOCUMENTS=CAPSTONE_PROJECT_STATE.md`
  - `DIRECT_CONTEXT_DOCUMENTS=CAPSTONE_PROJECT_STATE.md`
- Cleared stale Firestore chunks from:
  - `document_chunks`
- Rebuilt RAG index through:
  - `POST /ingest-docs`
- Ingestion result:
  - `chunks_created: 24`
  - `chunks_pruned: 0`
- Verified `/ask-rag` now returns citation labels like `[S1]` and source metadata from `CAPSTONE_PROJECT_STATE.md`.

Target pattern:

```text
request -> route -> service -> provider/client
```

Avoid keeping the long-term backend pattern as:

```text
request -> main.py -> everything
```

This long-term anti-pattern has been addressed structurally. `main.py` now stays as the Cloud Run entrypoint and app composition file.

## Verification Commands

Frontend:

```bash
cd frontend-Vite
npm run lint
npm run build
```

Backend compile check:

```bash
cd backend-GCP
python -m py_compile main.py
```

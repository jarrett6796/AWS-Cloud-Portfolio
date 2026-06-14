# GCP RAG Project State

This file is the current source of truth for the GCP RAG backend.

The GCP backend exists because the original AWS Lambda/Bedrock RAG path was deferred. The current working AI/RAG implementation is built on GCP Cloud Run, Gemini, Firestore, and Google Cloud Storage.

## Current GCP Architecture

```text
React Frontend
|
| session_id
v
Cloud Run
|
+----------------------+
|                      |
v                      v
Firestore            Firestore
conversations        document_chunks
|                      |
+----------+-----------+
|
v
Gemini 2.5 Flash
```

Frontend assistant request path:

```text
React ChatPanel
  -> src/hooks/useAssistantChat.js
  -> src/api/chat.js
  -> POST /ask-rag-stream
  -> SSE events: metadata, token, done, error
  -> progressive token rendering in ChatPanel
```

Frontend assistant UI behavior:

- Assistant response cards are labeled `GCP RAG`.
- Response timing/status is stored on each assistant message in frontend state, so old messages keep their final status and only the newest active response receives live progress updates.
- This is frontend-only display state; backend RAG, Firestore memory, and streaming API behavior are unchanged.
- Frontend chat rendering filters visible messages to `user` and `assistant` roles so backend-only `system` audit messages are not displayed.

Current architecture inventory:

- Frontend: React + Vite.
- Backend: Cloud Run in `asia-east1`.
- Data: Firestore collections `document_chunks` and `conversations`.
- Storage: Cloud Storage bucket `cloud-resume-ai-rag-docs`.
- AI: Vertex AI Gemini 2.5 Flash and Vertex AI `text-embedding-005`.
- Configuration source: `app/config/settings.py`.

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

Current deployed revision verified for persistent chat history:

```text
gcp-rag-backend-00010-zv5
```

Current deployed revision verified for production CloudFront CORS:

```text
gcp-rag-backend-00012-pbg
```

Current production frontend origin allowed by backend CORS:

```text
https://dvzu3s2gq6iw.cloudfront.net
```

Backend CORS source of truth:

```text
backend-GCP/app/config/settings.py
```

Cloud Run deployment also sets:

```text
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,https://dvzu3s2gq6iw.cloudfront.net
```

### Google Cloud Storage

Document bucket:

```text
cloud-resume-ai-rag-docs
```

Stores source markdown documents used for ingestion and retrieval context.

### Firestore

Collections:

```text
document_chunks
conversations/{session_id}/messages/{message_id}
```

Previous state:

- Firestore only contained `document_chunks`.
- The backend was stateless.
- Frontend conversation memory lived only in browser memory and disappeared after refresh.

`document_chunks` fields:

- `file_name`
- `chunk_index`
- `chunk_text`
- `embedding`

Conversation message fields:

- `role`
- `content`
- `created_at`
- `request_id`

## Current Endpoints

### `GET /`

Health check with service status, non-secret runtime config, and startup warnings.

### `GET /healthz`

Lightweight health endpoint for uptime checks.

### `POST /chat`

Basic Gemini chat without document retrieval.

### `POST /chat-with-docs`

Loads selected GCS markdown documents directly and sends them as context.

### `POST /ingest-docs`

Admin-only ingestion endpoint. Requires an `X-Admin-Token` header matching the Cloud Run `INGESTION_ADMIN_TOKEN` environment variable, then reads markdown files from GCS, chunks text, generates embeddings, and stores chunks in Firestore.

### `POST /ask-rag`

Accepts a user question and optional `session_id`, loads recent Firestore conversation history for follow-up context, optionally rewrites vague follow-up questions into standalone retrieval queries, retrieves top matching Firestore chunks using cosine similarity, sends retrieved context to Gemini, saves the user and assistant messages, and returns answer, sources, `session_id`, and optional retrieval-query metadata.

### `POST /ask-rag-stream`

Uses the same retrieval and prompt construction as `/ask-rag`, but returns server-sent events:

- `metadata`
- `token`
- `done`
- `error`

The React assistant now uses this endpoint as the primary request path. `/ask-rag` remains as a fallback if streaming fails.

Streaming metadata may also include:

- `question`
- `retrieval_query`
- `query_rewritten`

The frontend does not display the rewritten query.

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
- Retrieval is full Firestore scan with vector scoring, optional hybrid keyword scoring, optional reranking, a configurable candidate pool, and a score threshold.
- Optional conversation-aware query rewriting is available as an Advanced RAG Phase 1 improvement. It is controlled by `RAG_QUERY_REWRITE_ENABLED`, uses recent user/assistant conversation history, and rewrites only when the model returns a different standalone retrieval query.
- Backend streaming is available through `POST /ask-rag-stream`; frontend streaming integration is implemented and browser-verified.
- Chat history is persisted server-side in Firestore under `conversations/{session_id}/messages/{message_id}`.
- Query rewrite audit messages are stored under the same Firestore message path with `role: system`, `event_type: query_rewrite`, `original_question`, `rewritten_query`, `rewrite_used`, `created_at`, and optional `request_id`.
- System audit messages are backend-only and are filtered out of frontend rendering and conversation context used for answer prompting.
- Ingestion now uses deterministic Firestore chunk IDs and prunes stale duplicate chunk documents.
- `POST /ingest-docs` is now admin-token protected; missing, wrong, or unconfigured tokens return a controlled `admin_auth_error` response.
- The backend deployment workflow now runs unit tests and compile checks before deployment, then runs `scripts/evaluate_rag.py` against the deployed backend and uploads `rag_eval_report.md` as a GitHub Actions artifact.
- Runtime citation validation now replaces unsupported generated answers with a safe no-answer response before they are returned or saved.

## Current RAG Maturity

Current classification:

```text
Intermediate RAG with several advanced RAG features implemented.
```

Why it is beyond naive RAG:

- The backend runs as a Cloud Run FastAPI service.
- Generation uses Vertex AI Gemini 2.5 Flash.
- Embeddings use Vertex AI `text-embedding-005`.
- Firestore stores `document_chunks`.
- Firestore stores persistent `conversations`.
- Ingestion is idempotent and uses deterministic Firestore chunk IDs.
- Chunks are Markdown-aware rather than fixed-size-only.
- Chunk records include metadata and content hashes.
- Retrieval uses a larger candidate pool and score threshold.
- Optional hybrid keyword + vector scoring exists.
- Optional deterministic reranking exists.
- `/ask-rag` responses include source metadata and grounded source IDs for citations.
- Runtime citation validation and no-answer guardrails are implemented for non-streaming and streaming RAG answers.
- Frontend source rendering displays returned source IDs beside each source item in the visible chat history UI.
- Conversation history is stored in Firestore and used only for follow-up context.
- Optional query rewriting uses recent conversation history before retrieval so vague follow-up questions can retrieve the right document chunks without changing the saved user message.
- Streaming responses are available through `POST /ask-rag-stream`.
- `POST /ingest-docs` is protected with an admin token.
- Structured logging and health checks are implemented.

Why it is not fully production advanced RAG yet:

- Retrieval still scans Firestore in memory.
- There is no managed vector index yet.
- There is no multi-query retrieval yet.
- There is no real semantic reranker yet.
- There is no monitoring/analytics dashboard yet.
- There is no GraphRAG or Agentic RAG yet.

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
14. Admin-token guard for `POST /ingest-docs`
15. CI/CD backend tests, compile check, and deployed RAG evaluation report
16. Runtime citation validation and safe no-answer handling

Next:

1. Add chunk overlap and token-aware chunking.

## Advanced RAG Roadmap — Phase 1 to Phase 5

The backend is currently Intermediate RAG with several advanced RAG features implemented. The next roadmap should move it toward production-grade Advanced RAG through small, verifiable phases.

| Phase | Focus | Improvements | New GCP Services Required? | Goal |
| --- | --- | --- | --- | --- |
| Phase 1 | Retrieval Quality Quick Wins | Query rewriting, chunk overlap, token-aware chunking, citation validation | No new GCP service | Improve answer relevance and citation reliability without changing architecture |
| Phase 2 | Better Retrieval Logic | Multi-query retrieval, metadata filtering, no-answer confidence handling | No new GCP service required | Make retrieval more accurate and safer for ambiguous or weak-context questions |
| Phase 3 | Evaluation and Observability | RAG evaluation in CI/CD, project analytics, response/error tracking, monitoring dashboard | Optional: Cloud Logging, Cloud Monitoring, Firestore analytics collection | Prove quality, detect failures, and show production-readiness |
| Phase 4 | Managed Vector Retrieval | Firestore Vector Search or Vertex AI Vector Search, managed ANN retrieval, scalable vector index | Yes: Firestore Vector Search or Vertex AI Vector Search | Replace Firestore full-scan retrieval with production-style vector search |
| Phase 5 | Advanced RAG Patterns | GraphRAG, Agentic RAG, specialist retrievers, multi-source orchestration | Yes, likely: Vertex AI Vector Search, Agent Engine/ADK, BigQuery/graph-style storage | Move beyond document similarity into relationship-aware and agent-driven retrieval |

### Phase 1 — Retrieval Quality Quick Wins

This phase improves the current RAG pipeline without adding new infrastructure. Query rewriting turns follow-up questions into standalone retrieval queries. Chunk overlap and token-aware chunking improve context boundaries during ingestion. Citation validation checks whether generated answers properly reference valid source IDs such as `[S1]` and `[S2]`.

### Phase 2 — Better Retrieval Logic

This phase improves retrieval behavior while still using the current Cloud Run + Firestore setup. Multi-query retrieval generates several search variants and merges results. Metadata filtering narrows retrieval by file, project, topic, or document type. No-answer confidence handling prevents the assistant from answering when retrieved context is too weak.

### Phase 3 — Evaluation and Observability

This phase moves the project closer to production operations. RAG evaluation can run in CI/CD to catch retrieval or prompt regressions before deployment. Analytics can track project questions, response time, errors, source usage, and session behavior. Cloud Logging, Cloud Monitoring, and Firestore analytics can support this phase.

### Phase 4 — Managed Vector Retrieval

This is the biggest GCP architecture upgrade. The current system scans Firestore `document_chunks` in memory and calculates cosine similarity locally. A production-style system should use a managed vector index such as Firestore Vector Search or Vertex AI Vector Search for approximate nearest-neighbor retrieval.

### Phase 5 — Advanced RAG Patterns

This phase is optional and should come later. GraphRAG adds entity and relationship retrieval instead of relying only on semantic similarity. Agentic RAG adds routing, specialist retrievers, and multi-source orchestration. This is closer to enterprise Advanced RAG, but it is more complex than needed for the current portfolio stage.

## Recommended Next Implementation Order

1. Query rewriting
2. Citation validation and no-answer guardrails
3. Chunk overlap and token-aware chunking
4. Multi-query retrieval
5. Metadata filtering
6. Project analytics / monitoring dashboard
7. Firestore Vector Search or Vertex AI Vector Search
8. GraphRAG / Agentic RAG only after the core system is stable

Completed implementation milestones from the earlier roadmap:

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
11. Streaming responses.
12. Monitoring and production hardening.
13. CI/CD RAG evaluation gate.
14. Runtime citation validation and safe no-answer handling.

Phase 1 result:

- Added controlled backend exceptions.
- Wrapped Gemini, GCS, Firestore, RAG, and ingestion boundaries.
- Added stable JSON error payloads with `error` and `message` fields.
- Preserved FastAPI validation behavior.
- Preserved current endpoint paths and Cloud Run entrypoint.

Next advanced RAG work:

```text
Follow the current Phase 1 to Phase 5 roadmap, starting with query rewriting
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

Phase 7 result:

- Added opt-in hybrid keyword + vector retrieval.
- Added `RAG_HYBRID_ENABLED` config, disabled by default.
- Added `RAG_VECTOR_SCORE_WEIGHT` config.
- Added keyword overlap scoring against chunk text and headings.
- Added optional `vector_score` and `keyword_score` source metadata fields.
- Preserved vector-only behavior unless hybrid retrieval is explicitly enabled.

Phase 8 result:

- Added opt-in deterministic reranking.
- Added `RAG_RERANK_ENABLED` config, disabled by default.
- Added `RAG_RERANK_KEYWORD_WEIGHT` config.
- Added `rerank_score` calculation based on retrieval score plus keyword-score boost.
- Added optional `rerank_score` source metadata field.
- Preserved existing retrieval order unless reranking is explicitly enabled.

Phase 9 result:

- Added stable source IDs such as `S1`, `S2`, and `S3` for selected chunks.
- Added `source_id` to optional `/ask-rag` source metadata.
- Updated retrieved context formatting to use source IDs.
- Strengthened the grounded answer prompt to require source ID citations for factual claims.
- Added RAG service tests for source ID assignment, context formatting, and citation prompt requirements.

Phase 10 result:

- Added optional `history` to the `/ask-rag` request schema.
- Added optional `session_id` to the `/ask-rag` request schema.
- Preserved existing clients that send only `question`.
- Frontend assistant stores the active session ID in `localStorage` under `portfolioAssistantSessionId`.
- Frontend sends `session_id` with each `/ask-rag` request.
- Backend loads recent conversation messages from Firestore before prompt construction.
- Backend saves both user and assistant messages after response generation.
- Firestore history is the primary conversation memory source.
- Frontend-provided history remains as fallback compatibility when Firestore has no messages.
- Backend includes recent conversation in the prompt for follow-up context.
- Prompt explicitly says conversation history is not a factual source.
- Added RAG service tests for history prompt behavior.

Phase 11 result:

- Added `gemini_service.stream_text`.
- Added shared RAG context construction so streaming and non-streaming paths use the same retrieval logic.
- Added `POST /ask-rag-stream`.
- Streaming response uses server-sent events:
  - `metadata`
  - `token`
  - `done`
  - `error`
- Preserved existing `/ask-rag` endpoint behavior.
- Added tests for source serialization and SSE formatting.

Frontend streaming integration result:

- Added `streamAskRag` in `frontend-Vite/src/api/chat.js`.
- The frontend parses manual `ReadableStream` SSE frames from `POST /ask-rag-stream`.
- `useAssistantChat.js` appends token text with functional React state updates.
- `ChatPanel.jsx` renders partial answer text while loading.
- `/ask-rag` remains as fallback if streaming fails.
- Browser verification confirmed progressive text rendering before the `done` event.

Phase 12 result:

- Added non-secret runtime config summaries in `app/config/settings.py`.
- Added startup warning checks for missing project config and invalid retrieval tuning values.
- Added config and warning details to the root health response.
- Added lightweight `GET /healthz`.
- Added startup config logging for Cloud Run visibility.
- Added request ID propagation into controlled error logs and JSON error responses.
- Added `X-Process-Time-Ms` response headers.
- Added settings unit tests.

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

Latest Cloud Run deploy and RAG index reset:

Completed on 2026-06-05:

- Production fix completed:
  - Live CloudFront AI assistant backend connection.
- Live frontend:
  - `https://dvzu3s2gq6iw.cloudfront.net`
- Backend:
  - `https://gcp-rag-backend-189047029621.asia-east1.run.app`
- Problem:
  - Live UI showed `Could not connect to the AI backend. Please try again.`
  - Local frontend and backend worked.
  - Backend health/OpenAPI and RAG routes existed.
- Investigation:
  - Production JS bundle contained `gcp-rag-backend-189047029621.asia-east1.run.app`.
  - Production JS bundle contained `/ask-rag-stream` and `/ask-rag`.
  - Browser console showed `TypeError: Failed to fetch` for streaming and fallback requests.
  - Direct preflight from CloudFront origin returned:

```text
HTTP/2 400
Disallowed CORS origin
```

- Root cause:
  - Backend CORS allowed local Vite origins but not the production CloudFront origin.
- Fix:
  - Added `https://dvzu3s2gq6iw.cloudfront.net` to default backend CORS origins.
  - Added a settings test to protect the production origin.
  - Updated the backend GitHub Actions deploy workflow to pass `CORS_ALLOWED_ORIGINS`.
  - Escaped comma-separated env-var values for `gcloud run deploy` using custom delimiter syntax.
- Deployment:
  - First backend deploy attempt failed because `gcloud --set-env-vars` parsed commas as separate key/value entries.
  - Corrected deploy workflow and redeployed.
  - New Cloud Run revision:

```text
gcp-rag-backend-00012-pbg
```

- Post-deploy CORS verification:

```text
HTTP/2 200
access-control-allow-origin: https://dvzu3s2gq6iw.cloudfront.net
```

- Live browser verification:
  - CloudFront assistant sent the request successfully.
  - Assistant returned a grounded RAG answer with citations and sources.
  - Previous connection error did not recur.
- Commits:
  - `47e1aa9` — backend CORS fix and regression test.
  - `c0b52f8` — Cloud Run deployment env-var delimiter fix.

Completed on 2026-06-05:

- Feature completed:
  - Persistent Firestore Chat History
- Redeployed persistent Firestore chat history to Cloud Run.
- Initial issue:
  - Firestore `conversations` collection did not appear.
- Previous revision still serving before redeploy:
  - `gcp-rag-backend-00009-m6h`
- Resolution:
  - Redeployed backend.
- New revision deployed:
  - `gcp-rag-backend-00010-zv5`
- Verified `/ask-rag` response includes `session_id`.
- Verified Firestore automatically created:

```text
conversations
└── debug-session-001
    └── messages
```

- Verified Firestore write operations succeed.
- Persistent conversation infrastructure is operational.
- Verified current backend status:
  - `python3 -m py_compile main.py`
- Verified current frontend status:
  - `npm run lint`
  - `npm run build`
- Next planned feature:
  - CI-based RAG evaluation.

Completed on 2026-06-05:

- Feature completed:
  - Frontend Streaming Response Support
- Verified in browser with Playwright:
  - request path was `POST /ask-rag-stream`
  - request payload included `session_id`
  - response content type was `text/event-stream`
  - metadata arrived and sources rendered
  - answer text grew progressively while `loading` was still true
  - final answer remained after `done`
  - localStorage key `portfolioAssistantSessionId` remained populated
- Verified fallback design:
  - `/ask-rag` remains available if streaming throws.
- Verified current frontend status:
  - `npm run lint`
  - `npm run build`
- Next planned feature:
  - CI-based RAG evaluation

Completed on 2026-06-04:

- Deployed latest local backend refactor work to Cloud Run.
- Revision deployed:
  - `gcp-rag-backend-00009-m6h`
- Service URL:
  - `https://gcp-rag-backend-189047029621.asia-east1.run.app`
- Current indexed GCS source file:
  - `CAPSTONE_PROJECT_STATE.md`
- Cloud Run env now points ingestion/direct context at:
  - `INGEST_DOCUMENTS=CAPSTONE_PROJECT_STATE.md`
  - `DIRECT_CONTEXT_DOCUMENTS=CAPSTONE_PROJECT_STATE.md`
- Ingestion route security:
  - `POST /ingest-docs` requires `X-Admin-Token`.
  - Cloud Run receives `INGESTION_ADMIN_TOKEN` from GitHub Actions secrets.
  - `/ask-rag` and `/ask-rag-stream` remain public assistant endpoints.
- Cleared stale Firestore RAG index collection:
  - `document_chunks`
- Rebuilt the RAG index with:
  - `POST /ingest-docs`
- Ingestion result:
  - `chunks_created: 24`
  - `chunks_pruned: 0`
- Verified `/ask-rag` returns new citation/source metadata:
  - `source_id`
  - `heading`
  - `content_hash`
  - `vector_score`
  - `keyword_score`

Current Cloud Run deploy command:

```bash
gcloud run deploy gcp-rag-backend \
  --source . \
  --region asia-east1 \
  --allow-unauthenticated \
  --clear-base-image \
  --set-env-vars GOOGLE_CLOUD_PROJECT=cloud-resume-ai-rag,GOOGLE_CLOUD_LOCATION=us-central1,DOCS_BUCKET=cloud-resume-ai-rag-docs,INGEST_DOCUMENTS=CAPSTONE_PROJECT_STATE.md,DIRECT_CONTEXT_DOCUMENTS=CAPSTONE_PROJECT_STATE.md
```

Smoke test:

```bash
curl -X POST https://gcp-rag-backend-189047029621.asia-east1.run.app/ask-rag \
  -H "Content-Type: application/json" \
  -d '{"question":"What is the current project architecture?"}'
```

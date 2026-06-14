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
- Firestore conversation storage.
- Embedding generation.
- Cosine similarity retrieval.
- `/ask-rag` frontend integration.
- `/ask-rag` persistent `session_id` support.
- `/ask-rag-stream` frontend streaming integration.
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
- Persistent Firestore chat history through `conversations/{session_id}/messages/{message_id}`.
- Optional Advanced RAG Phase 1 query rewriting before retrieval.
- Backend-only Firestore system audit storage for query rewrites.
- Admin-token protection for `POST /ingest-docs`.
- CI/CD backend unit tests, compile check, and deployed RAG evaluation report.
- Runtime citation validation and safe no-answer handling.
- Token-aware chunking with configurable chunk overlap.
- Optional metadata filtering by file name and heading.

Needs improvement:

- Production monitoring dashboards.

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
9. Add CI/CD backend unit tests, compile check, and deployed RAG evaluation report.
10. Add optional multi-query retrieval with chunk deduplication.

Next:

1. Add Phase 3A project analytics / monitoring dashboard.
2. Continue production monitoring improvements.

## Advanced RAG Roadmap — Phase 1 to Phase 5

Current classification:

```text
Intermediate RAG with several advanced RAG features implemented.
```

The current system is beyond naive RAG because it already includes Cloud Run FastAPI, Vertex AI Gemini 2.5 Flash, `text-embedding-005`, Firestore `document_chunks`, Firestore `conversations`, Markdown-aware token-budget chunking, configurable chunk overlap, content hashing, chunk metadata, metadata filtering, score thresholds, candidate pool retrieval, optional multi-query retrieval, optional hybrid keyword + vector scoring, optional heuristic reranking, grounded source IDs, runtime citation validation, persistent chat history, optional conversation-aware query rewriting, streaming responses, protected `/ingest-docs`, structured logging, and health checks.

It is not fully production-grade Advanced RAG yet because retrieval still scans Firestore in memory and the system does not yet include a managed vector index, a real semantic reranker, a monitoring/analytics dashboard, GraphRAG, or Agentic RAG.

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

1. Enable and validate query rewriting in deployed Cloud Run when ready.
2. Citation validation and no-answer guardrails
3. Chunk overlap and token-aware chunking
4. Metadata filtering
5. Multi-query retrieval
6. Project analytics / monitoring dashboard
7. Firestore Vector Search or Vertex AI Vector Search
8. GraphRAG / Agentic RAG only after the core system is stable

## 2026-06-15 — Runtime Citation Validation and Safe No-Answer Handling

Completed:

- Added runtime citation validation in `backend-GCP/app/services/rag_service.py`.
- Added a shared safe no-answer response:

```text
I do not know based on the indexed project documents.
```

- If retrieval returns no selected chunks, `/ask-rag` now skips Gemini answer generation and returns the safe no-answer response.
- If Gemini returns a factual answer without valid returned source citations, the backend replaces the answer with the safe no-answer response before saving the assistant message.
- If Gemini cites unavailable source IDs, the backend replaces the answer with the safe no-answer response.
- If Gemini already returns an honest no-answer response, the backend allows it without requiring citations.
- The streaming path now validates the completed generated answer before emitting final SSE token chunks, preventing unsupported factual text from being displayed in the frontend.
- Added focused tests for valid citations, missing citations, invalid citations, no-answer responses, no-context responses, non-streaming answer replacement, and streaming answer replacement.

Result:

- The backend no longer relies only on prompt instructions for citation behavior.
- Unsupported generated answers are blocked at runtime in both `/ask-rag` and `/ask-rag-stream`.
- The next Phase 1 improvement should be chunk overlap plus token-aware chunking.

Verification:

```bash
cd backend-GCP
python3 -m unittest discover -s tests
python3 -m py_compile main.py app/config/settings.py app/services/rag_service.py scripts/evaluate_rag.py
```

## 2026-06-15 — Token-Aware Chunking and Chunk Overlap

Completed:

- Updated `backend-GCP/app/services/vector_service.py` so `chunk_text` uses token-count budgets instead of character-length budgets.
- Preserved Markdown section splitting and paragraph-boundary behavior.
- Added configurable overlap for oversized paragraph splits through `DEFAULT_CHUNK_OVERLAP_TOKENS`.
- Bounded overlap below the chunk size so invalid overlap settings cannot create infinite loops.
- Added public runtime summary fields for:
  - `default_chunk_size`
  - `default_chunk_overlap_tokens`
- Added startup warnings for invalid chunking configuration:
  - `DEFAULT_CHUNK_SIZE` below 1
  - negative `DEFAULT_CHUNK_OVERLAP_TOKENS`
  - overlap greater than or equal to chunk size
- Added tests for token-budget Markdown splitting, paragraph splitting, token overlap, bounded overlap, public chunking config, and invalid chunking warnings.

Result:

- Ingestion chunks now preserve more useful boundary context than fixed character slices.
- Oversized paragraphs can share trailing tokens with the next chunk, reducing context loss at chunk edges.
- This completes the current Phase 1 retrieval-quality quick wins after query rewriting, citation validation, and chunk overlap/token-aware chunking.

Next improvement phase:

```text
Phase 2A — Metadata Filtering
```

Recommended next scope:

- Add structured filter fields to chunk metadata where practical.
- Allow retrieval to narrow by file name, heading, or document area before final scoring.
- Keep it Firestore-scan compatible first, then reuse the filter contract later when moving to managed vector search.

Verification:

```bash
cd backend-GCP
python3 -m unittest discover -s tests
python3 -m py_compile main.py app/config/settings.py app/services/vector_service.py scripts/evaluate_rag.py
```

## 2026-06-15 — Phase 2A Metadata Filtering

Completed:

- Added optional `metadata_filter` request support in `backend-GCP/app/schemas/chat_schema.py`.
- Supported filter fields:
  - `file_name`
  - `heading`
- Updated `backend-GCP/app/routes/rag.py` to pass metadata filters into both `/ask-rag` and `/ask-rag-stream`.
- Updated `backend-GCP/app/services/rag_service.py` to normalize metadata filters and apply them before vector scoring, keyword scoring, candidate-pool selection, reranking, prompt construction, and source serialization.
- Heading filtering is case-insensitive substring matching.
- File-name filtering is exact matching.
- If metadata filtering removes all candidate chunks, the existing safe no-answer path is used.
- Added retrieval logs for filter presence and filtered document count.
- Added tests for filter normalization, file-name filtering, heading filtering, empty-filter no-answer behavior, and streaming source metadata filtering.

Result:

- Retrieval can now be narrowed by source metadata without changing the frontend default behavior.
- The filter contract is intentionally compatible with the current Firestore full-scan retrieval path and can be reused later with managed vector search.

Next improvement phase:

```text
Phase 2B — Multi-Query Retrieval
```

Recommended next scope:

- Generate multiple retrieval query variants for ambiguous questions.
- Retrieve and merge candidates across variants.
- Dedupe by file name and chunk index before final thresholding/reranking.
- Keep final answer generation tied to the original user question.

Verification:

```bash
cd backend-GCP
python3 -m unittest discover -s tests
python3 -m py_compile main.py app/schemas/chat_schema.py app/routes/rag.py app/services/rag_service.py scripts/evaluate_rag.py
```

## 2026-06-15 — Phase 2B Multi-Query Retrieval

Completed:

- Added optional multi-query retrieval settings in `backend-GCP/app/config/settings.py`:
  - `RAG_MULTI_QUERY_ENABLED`
  - `RAG_MULTI_QUERY_COUNT`
  - `RAG_MULTI_QUERY_MODEL`
- Added the new multi-query settings to the public runtime summary.
- Added startup validation for invalid `RAG_MULTI_QUERY_COUNT`.
- Updated `.github/workflows/deploy-backend-gcp.yml` to pass the multi-query settings to Cloud Run with production defaulted to disabled.
- Updated `backend-GCP/app/services/rag_service.py` so retrieval can:
  - Generate alternate retrieval queries with Gemini.
  - Embed the original retrieval query plus generated variants.
  - Score each Firestore chunk across all retrieval queries.
  - Keep the best-scoring candidate per `file_name` and `chunk_index`.
  - Send deduplicated candidates through the existing candidate pool, threshold, rerank, source-ID, prompt, and citation-validation pipeline.
- Kept answer generation tied to the original user question, not the generated retrieval variants.
- Added fallback behavior so multi-query generation failures use the original retrieval query.
- Added tests for multi-query parsing, query deduplication, successful multi-query embedding/deduplication, failure fallback, public settings summary, and startup warnings.

Result:

- Phase 2B is implemented as an opt-in retrieval expansion layer without introducing a new GCP service.
- Retrieval can now cover ambiguous questions from multiple semantic angles while preserving source deduplication and the existing safety guardrails.
- Production Cloud Run behavior remains unchanged until `RAG_MULTI_QUERY_ENABLED` is enabled.

Previous improvements recorded with date:

1. 2026-06-15 — CI/CD RAG evaluation gate.
2. 2026-06-15 — Runtime citation validation and safe no-answer handling.
3. 2026-06-15 — Token-aware chunking with configurable chunk overlap.
4. 2026-06-15 — Phase 2A metadata filtering.
5. 2026-06-15 — Phase 2B multi-query retrieval.

Next improvement phase:

```text
Phase 3A — Project Analytics and Monitoring Dashboard
```

Recommended next scope:

- Add lightweight RAG interaction analytics records.
- Track latency, source count, no-answer rate, citation-validation failures, metadata-filter usage, and multi-query usage.
- Surface summary metrics in an internal dashboard or admin endpoint.
- Keep analytics metadata-only and avoid storing prompt text, document bodies, embeddings, or generated answer content outside existing conversation storage.

Verification:

```bash
cd backend-GCP
python3 -m unittest discover -s tests
python3 -m py_compile main.py app/config/settings.py app/schemas/chat_schema.py app/routes/rag.py app/services/rag_service.py scripts/evaluate_rag.py
```

## 2026-06-15 — CI/CD RAG Evaluation Gate

Completed:

- Updated `.github/workflows/deploy-backend-gcp.yml` so backend deployment now runs quality checks before building and deploying the Cloud Run image.
- Added a Python 3.11 setup step in the backend deployment workflow.
- Added backend dependency installation from `backend-GCP/requirements.txt`.
- Added `python -m unittest discover -s tests` as a pre-deploy unit test gate.
- Added `python -m py_compile main.py app/config/settings.py` as a pre-deploy compile check.
- Added a post-deploy RAG evaluation step that runs:

```bash
python scripts/evaluate_rag.py \
  --base-url "$EVAL_BASE_URL" \
  --output rag_eval_report.md \
  --timeout 45
```

- The workflow reads `RAG_EVAL_BASE_URL` from GitHub secrets when available and otherwise falls back to the current Cloud Run service URL.
- The workflow uploads `backend-GCP/rag_eval_report.md` as the `rag-evaluation-report` artifact with `if: always()`.
- Updated `backend-GCP/scripts/evaluate_rag.py` so the `advanced_rag_status` case matches the current source-of-truth implementation. Chat history and streaming are now required keywords instead of forbidden claims; forbidden claims now focus on not overstating managed vector search, Agentic RAG, or GraphRAG.

Result:

- Backend CI/CD now has an automated RAG quality signal tied to deployment.
- The evaluation checks retrieval source match, required answer keywords, forbidden claims, and grounded source-ID citations.
- The next best RAG implementation work is runtime citation validation and no-answer confidence handling.

Verification:

```bash
cd backend-GCP
python3 -m unittest discover -s tests
python3 -m py_compile main.py app/config/settings.py scripts/evaluate_rag.py
```

## 2026-06-06 — Advanced RAG Phase 1 Query Rewriting

Completed:

- Added optional conversation-aware query rewriting before embedding generation and Firestore retrieval.
- Added `RAG_QUERY_REWRITE_ENABLED`, `RAG_QUERY_REWRITE_HISTORY_LIMIT`, and `RAG_QUERY_REWRITE_MODEL` backend settings.
- Added non-secret runtime config summary fields for query rewriting.
- The query rewriter uses only the current user question and recent user/assistant conversation history. It does not use retrieved document chunks.
- The rewritten query is used for embedding generation, Firestore chunk retrieval, optional hybrid keyword scoring, and optional reranking.
- The final answer prompt still receives the original user question so the assistant answers what the user actually asked.
- Original user messages remain unchanged in Firestore and in the frontend UI.
- When the rewritten query is different and used, the backend stores a Firestore system audit message at:

```text
conversations/{session_id}/messages/{message_id}
```

System audit message shape:

```json
{
  "role": "system",
  "event_type": "query_rewrite",
  "original_question": "What about the backend?",
  "rewritten_query": "What backend architecture is used in the GCP RAG capstone project?",
  "rewrite_used": true,
  "created_at": "server timestamp",
  "request_id": "optional request id"
}
```

Storage decision:

- The backend stores a system audit message only when a rewrite is actually used.
- If rewriting is disabled, fails, returns empty text, or returns the original standalone question unchanged, no audit message is stored.
- This keeps Firestore audit history focused on meaningful rewrite events and avoids noise.

Frontend behavior:

- The frontend does not display rewritten queries.
- `ChatPanel.jsx` filters visible chat messages to `user` and `assistant` roles only.
- Existing streaming UI, `GCP RAG` labels, New Chat behavior, source rendering, visible chat history, and `portfolioAssistantSessionId` behavior are preserved.

Verification:

```bash
cd backend-GCP
python3 -m unittest discover -s tests
python3 -m py_compile main.py

cd frontend-AWS
npm run lint
npm run build
```

Result:

- Backend unit tests passed.
- Backend compile check passed.
- Frontend lint passed.
- Frontend build passed.

## Phase 33 — Assistant Per-Message Status UI Cleanup

Completed on 2026-06-06:

Objective:

- Fix historical assistant responses continuing to render the newest global response status.
- Replace the generic assistant response card label `Response` with `GCP RAG`.

Implementation:

- Updated `frontend-AWS/src/hooks/useAssistantChat.js` to track the active assistant message ID and write live/final status onto that message only.
- Updated `frontend-AWS/src/components/ChatPanel.jsx` to read `message.status` per assistant card.
- Preserved `/ask-rag-stream`, `/ask-rag` fallback, Firestore `session_id` behavior, backend routes, and ingestion behavior.

Verification:

- Browser verification on deployed CloudFront reproduced the prior repeated-status behavior before the fix.
- Browser verification on local `localhost` after the fix showed `GCP RAG` labels and frozen per-message generated statuses.
- `npm run lint` passed in `frontend-AWS`.
- `npm run build` passed in `frontend-AWS`.

## Phase 32 — Admin-Only Document Ingestion

Completed on 2026-06-06:

Objective:

- Prevent public callers from rebuilding the Firestore RAG index through `POST /ingest-docs`.
- Preserve public assistant behavior for `POST /ask-rag` and `POST /ask-rag-stream`.

Implementation:

- Added `INGESTION_ADMIN_TOKEN` backend configuration.
- Added an `X-Admin-Token` guard for `POST /ingest-docs` only.
- Added a controlled `admin_auth_error` response for missing, wrong, or unconfigured tokens.
- Updated the Cloud Run deployment workflow to pass `INGESTION_ADMIN_TOKEN` from GitHub Actions secrets.
- Added focused backend tests for authorized and unauthorized ingestion requests.

Result:

- `/ingest-docs` is no longer publicly callable in production without the admin token.
- Public RAG answer and streaming routes remain unchanged.

## Phase 30 — Production AI Assistant Backend Connection Fix

Completed on 2026-06-05:

Objective:

- Resolve the live CloudFront AI assistant error:
  - `Could not connect to the AI backend. Please try again.`

Production Targets:

- Frontend:
  - `https://dvzu3s2gq6iw.cloudfront.net`
- Backend:
  - `https://gcp-rag-backend-189047029621.asia-east1.run.app`

Investigation:

- Inspected repository request flow:
  - `frontend-AWS/src/api/chat.js`
  - `frontend-AWS/src/hooks/useAssistantChat.js`
  - `frontend-AWS/src/components/ChatPanel.jsx`
  - `frontend-AWS/vite.config.js`
  - `.github/workflows/deploy-frontend.yml`
  - `.github/workflows/deploy-backend-gcp.yml`
  - `backend-GCP/main.py`
  - `backend-GCP/app/config/settings.py`
- Verified live CloudFront loaded successfully.
- Verified live production JavaScript bundle contained:
  - `gcp-rag-backend-189047029621.asia-east1.run.app`
  - `/ask-rag-stream`
  - `/ask-rag`
- Interacted with the live AI assistant in the browser.
- Browser console showed:
  - streaming request failed with `TypeError: Failed to fetch`
  - fallback request failed with `TypeError: Failed to fetch`
- Direct CORS preflight from the production CloudFront origin returned:

```text
HTTP/2 400
Disallowed CORS origin
```

Root Cause:

- Backend CORS configuration allowed local Vite origins only.
- The production CloudFront origin was missing:
  - `https://dvzu3s2gq6iw.cloudfront.net`

Implementation:

- Updated `backend-GCP/app/config/settings.py`.
- Added the production CloudFront origin to `DEFAULT_CORS_ALLOWED_ORIGINS`.
- Updated `.github/workflows/deploy-backend-gcp.yml`.
- Added `CORS_ALLOWED_ORIGINS` to the Cloud Run deployment environment.
- Fixed gcloud comma parsing by using custom delimiter syntax:

```text
--set-env-vars "^|^CORS_ALLOWED_ORIGINS=$CORS_ALLOWED_ORIGINS"
```

- Added a regression test in `backend-GCP/tests/test_settings.py` to verify the production CloudFront origin remains in default CORS origins.

Deployment Notes:

- Initial backend deploy attempt failed because `gcloud --set-env-vars` parsed commas in `CORS_ALLOWED_ORIGINS` as separate dictionary entries.
- Corrected the workflow with custom delimiter syntax.
- Redeployed backend successfully.
- Cloud Run revision deployed:

```text
gcp-rag-backend-00012-pbg
```

- Revision served 100% of traffic.

Verification:

- Post-deploy preflight returned:

```text
HTTP/2 200
access-control-allow-origin: https://dvzu3s2gq6iw.cloudfront.net
```

- Live browser retest confirmed:
  - CloudFront assistant sends the AI request successfully.
  - Assistant returns a grounded RAG response with citations and sources.
  - The previous connection error no longer appears.

Commands:

```bash
npm --prefix frontend-AWS run lint
npm --prefix frontend-AWS run build
cd backend-GCP
python3 -m py_compile main.py app/config/settings.py
python3 -m unittest tests/test_settings.py
```

Result:

- Frontend lint passed.
- Frontend build passed.
- Backend compile check passed.
- Backend settings tests passed.

Commits:

- `47e1aa9` — backend CORS fix and regression test.
- `c0b52f8` — Cloud Run deployment env-var delimiter fix.

Outcome:

- Production CloudFront AI assistant can connect to the GCP Cloud Run RAG backend.
- `/ask-rag-stream` remains the primary frontend path.
- `/ask-rag` remains the fallback path.
- Visitor counter behavior was not changed.

## Phase 31 — Frontend Source ID Label Display

Completed on 2026-06-06:

Objective:

- Restore visible source ID labels in the AI chat history source list.

Implementation:

- Updated `frontend-AWS/src/components/ChatPanel.jsx` source rendering so each source item shows a compact label such as `[S1]`.
- Preserved per-message source grouping under each assistant response.
- Preserved streaming, `session_id`, New Chat, and `/ask-rag` fallback behavior.
- Backend code and backend response shape were not changed.

Verification:

```bash
cd frontend-AWS
npm run lint
npm run build
```

Result:

- `npm run lint` passed.
- `npm run build` passed.
- Browser verification at `http://localhost:5173/` confirmed returned source rows rendered with labels such as `[S1]`, `[S2]`, and `[S3]` in the expanded Sources Used section.

## Phase 29 — Frontend Streaming Response Support

Completed on 2026-06-05:

Objective:

- Update the React AI assistant to consume the existing backend streaming endpoint:
  - `POST /ask-rag-stream`

Previous State:

- Backend streaming already existed and returned SSE events.
- Frontend still used the non-streaming `/ask-rag` endpoint.
- Users waited for the full response before seeing any assistant text.

Implementation:

- Added `streamAskRag(...)` in `frontend-Vite/src/api/chat.js`.
- Implemented manual `ReadableStream` parsing for POST-based SSE:
  - `response.body.getReader()`
  - `TextDecoder`
  - buffered SSE frame parsing
  - CRLF normalization before splitting on double newline
- Parsed stream events:
  - `metadata`
  - `token`
  - `done`
  - `error`
- Updated `frontend-Vite/src/hooks/useAssistantChat.js` to:
  - call `/ask-rag-stream` first
  - preserve `session_id`
  - preserve `portfolioAssistantSessionId`
  - preserve Firestore-backed conversation history behavior
  - append token text with functional React state updates
  - keep `/ask-rag` as fallback when streaming fails
- Updated `frontend-Vite/src/components/ChatPanel.jsx` so assistant text renders before the loading placeholder whenever streamed answer text exists.

Browser Verification:

- Used Playwright against local frontend:
  - `http://localhost:5173`
- Test question:
  - `Explain my RAG architecture`
- Network observations:
  - frontend called `POST /ask-rag-stream`
  - frontend did not call `/ask-rag` during the successful streaming path
  - request payload included `session_id`
  - response status was `200`
  - response content type was `text/event-stream`
- UI observations:
  - sources rendered after metadata arrived
  - answer text visibly grew while loading was still true
  - sampled visible text grew from `Your` to hundreds of characters before completion
  - final answer remained after the `done` event
  - `portfolioAssistantSessionId` remained populated in `localStorage`

Verification:

```bash
cd frontend-Vite
npm run lint
npm run build
```

Result:

- `npm run lint` passed.
- `npm run build` passed.

Outcome:

- The homepage AI assistant now displays streamed answer text progressively before the request completes.
- Backend code was not changed.
- `/ask-rag` remains available as fallback.
- Next useful work is CI-based RAG evaluation and continued production monitoring.

## Phase 28 — Persistent Firestore Chat History

Completed on 2026-06-05:

Feature Completed:

- Persistent Firestore Chat History.

Objective:

- Upgrade the existing frontend-held conversation memory into persistent Firestore-backed conversation storage.

Previous State:

- Frontend previously stored chat history only in browser memory.
- History was lost after refresh or new browser session.
- Backend was stateless.
- Firestore only contained the `document_chunks` collection.

Implementation:

- Added Firestore conversation storage.
- New collection structure:

```text
conversations/{session_id}/messages/{message_id}
```

- Message schema:

```json
{
  "role": "user | assistant",
  "content": "message text",
  "created_at": "server timestamp",
  "request_id": "optional request id"
}
```

Backend Changes:

- Added `session_id` support to `/ask-rag`.
- Added Firestore conversation read/write functions.
- Backend loads recent conversation history before prompt construction.
- Backend saves both user and assistant messages.
- Firestore history is used as the primary conversation memory source.
- Frontend history remains as fallback compatibility.

Frontend Changes:

- Added persistent `session_id` management through `localStorage`.
- `localStorage` key:

```text
portfolioAssistantSessionId
```

- Frontend sends `session_id` with every `/ask-rag` request.
- Added New Chat capability that creates a new session.
- Existing conversations remain stored in Firestore.

Current AI Models:

- Generation:
  - `gemini-2.5-flash`
- Embeddings:
  - `text-embedding-005`
- Configuration source:
  - `app/config/settings.py`

Current GCP Architecture:

- Frontend:
  - React + Vite
- Backend:
  - Cloud Run in `asia-east1`
- Data:
  - Firestore `document_chunks`
  - Firestore `conversations`
- Storage:
  - Cloud Storage
- AI:
  - Vertex AI Gemini 2.5 Flash
  - Vertex AI `text-embedding-005`

Deployment Notes:

- Initial debugging showed Firestore `conversations` collection was not appearing.
- Investigation revealed Cloud Run was still serving old revision:
  - `gcp-rag-backend-00009-m6h`
- Local code changes had been completed but not deployed.
- Redeployed backend to Cloud Run.
- New revision:
  - `gcp-rag-backend-00010-zv5`

Verification:

- Verified Cloud Run deployment.
- Verified `/ask-rag` response includes `session_id`.
- Verified Firestore automatically created:

```text
conversations
└── debug-session-001
    └── messages
```

- Verified Firestore write operations succeed.
- Verified persistent conversation infrastructure is operational.
- Verified current backend status:
  - `python3 -m py_compile main.py`
- Verified current frontend status:
  - `npm run lint`
  - `npm run build`

Architecture Impact:

Before:

```text
React Frontend
|
Cloud Run
|
Firestore document_chunks
|
Gemini
```

After:

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

Outcome:

- The AI assistant now supports persistent backend conversation memory and has evolved from a stateless document Q&A assistant into a conversational RAG assistant with Firestore-backed session storage.

Next Planned Feature:

- CI-based RAG evaluation.

## Phase 27 — Monitoring and Production Hardening

Completed on 2026-06-04:

- Added non-secret runtime config summaries in `backend-GCP/app/config/settings.py`.
- Added startup warnings for missing project config and invalid retrieval tuning values.
- Added richer root health response with config summary and warnings.
- Added lightweight `GET /healthz`.
- Added startup config logging for Cloud Run visibility.
- Added request ID propagation into controlled error logs and JSON error responses.
- Added `X-Process-Time-Ms` response headers.
- Added settings unit tests.

Result:

- Advanced RAG Phase 12 is complete as an initial hardening pass.
- Existing endpoint paths remain preserved.
- `/ask-rag` behavior and retrieval logic were not changed.
- Production hardening can continue incrementally through CI evaluation, deployment checks, and monitoring dashboard work.

## Phase 26 — Streaming Responses

Completed on 2026-06-04:

- Added `gemini_service.stream_text`.
- Added `POST /ask-rag-stream`.
- Implemented streaming with server-sent events.
- Stream events:
  - `metadata`
  - `token`
  - `done`
  - `error`
- Refactored RAG orchestration so `/ask-rag` and `/ask-rag-stream` share retrieval, source metadata, history, and prompt construction.
- Preserved existing `/ask-rag` behavior for the current frontend and evaluator.
- Added tests for source serialization and SSE formatting.

Result:

- Advanced RAG Phase 11 is complete.
- Backend streaming is available without breaking the current non-streaming UI.
- Frontend streaming integration remains optional future polish.
- Monitoring and production hardening was completed as an initial pass in Phase 27.

## Phase 25 — Lightweight Chat History

Completed on 2026-06-04:

- Added optional `history` support to `backend-GCP/app/schemas/chat_schema.py`.
- Preserved existing `/ask-rag` clients that send only `question`.
- Updated `backend-GCP/app/routes/rag.py` to pass history into the RAG service.
- Updated `backend-GCP/app/services/rag_service.py` to include recent conversation context in the prompt.
- Prompt now says conversation history is only for follow-up context and must not be used as a factual source.
- Updated `frontend-Vite/src/api/chat.js` to send optional history.
- Updated `frontend-Vite/src/hooks/useAssistantChat.js` to keep recent user/assistant turns in memory.
- Limited chat history to the latest six messages.
- Added tests for history context formatting and prompt guardrails.

Result:

- Advanced RAG Phase 10 is complete.
- The assistant can handle simple follow-up questions better during a single frontend session.
- This lightweight history phase was later upgraded to persistent Firestore-backed conversation storage in Phase 28.
- Streaming responses were completed in Phase 26.

## Current RAG Maturity Review

Recorded on 2026-06-04:

Current classification:

```text
Intermediate RAG with several advanced RAG features implemented.
```

The backend is beyond naive RAG because it includes Cloud Run FastAPI, Vertex AI Gemini 2.5 Flash, `text-embedding-005`, Firestore `document_chunks`, Firestore `conversations`, Markdown-aware chunking, content hashing, chunk metadata, score-threshold retrieval, a larger candidate pool, optional multi-query retrieval, optional hybrid scoring, optional heuristic reranking, grounded source IDs, persistent chat history, streaming responses, protected `/ingest-docs`, structured logging, and health checks.

The backend is not yet fully production-grade Advanced RAG because it still scans Firestore in memory and does not yet include a managed vector index, a real semantic reranker, a monitoring/analytics dashboard, GraphRAG, or Agentic RAG.

Evaluation support added:

- Created `backend-GCP/scripts/evaluate_rag.py`.
- The script calls `/ask-rag`.
- It checks:
  - `retrieval_source_match`
  - `required_keywords_present`
  - `forbidden_claims_absent`
  - `grounded_answer`
  - `overall_pass`
- It saves JSON or Markdown reports.

## Phase 24 — Latest Cloud Run Deployment and Clean RAG Reindex

Completed on 2026-06-04:

- Verified GCS bucket source file:
  - `gs://cloud-resume-ai-rag-docs/CAPSTONE_PROJECT_STATE.md`
- Deployed latest local backend to Cloud Run.
- New Cloud Run revision:
  - `gcp-rag-backend-00009-m6h`
- Set Cloud Run environment for the new source file:
  - `INGEST_DOCUMENTS=CAPSTONE_PROJECT_STATE.md`
  - `DIRECT_CONTEXT_DOCUMENTS=CAPSTONE_PROJECT_STATE.md`
- Cleared stale Firestore RAG chunks with Firestore bulk delete:
  - collection ID `document_chunks`
- Rebuilt the RAG index through:
  - `POST /ingest-docs`
- Ingestion response:
  - `status: success`
  - `chunks_created: 24`
  - `chunks_pruned: 0`
- Tested `/ask-rag` with:
  - `What is this capstone project about?`

Result:

- Deployed backend now reflects the latest advanced RAG refactor.
- RAG answers now cite retrieved sources with labels such as `[S1]`.
- Source metadata now comes from `CAPSTONE_PROJECT_STATE.md`, not the deleted old GCS files.
- Verified source metadata includes `source_id`, `heading`, `content_hash`, `vector_score`, and `keyword_score`.
- Local frontend on `localhost:5173` can use the latest backend because `.env` points to the Cloud Run service URL.

## Phase 23 — Grounded Answer Prompt with Citations

Completed on 2026-06-04:

- Added stable source IDs for selected chunks in `app/services/rag_service.py`.
- Source IDs use labels such as:
  - `S1`
  - `S2`
  - `S3`
- Added optional `/ask-rag` source metadata field:
  - `source_id`
- Updated retrieved context formatting to start each source block with its source ID.
- Strengthened prompt instructions so factual claims should cite source IDs.
- Prompt now tells Gemini:
  - use only retrieved context
  - cite factual claims with `[S1]`, `[S2]`, etc.
  - do not cite unavailable sources
  - say it does not know when the answer is not in the indexed documents
- Added `backend-GCP/tests/test_rag_service.py`.
- Added tests for:
  - ordered source ID assignment
  - context formatting
  - citation prompt requirements

Result:

- Advanced RAG Phase 9 is complete.
- Answers should be easier to audit during portfolio demos.
- Existing endpoint paths were preserved.
- `/ask-rag` response remains backward compatible because `source_id` is optional metadata.
- Chat history is the next phase.

## Phase 22 — Optional Reranking

Completed on 2026-06-04:

- Added `RAG_RERANK_ENABLED` config in `app/config/settings.py`.
- Added `RAG_RERANK_KEYWORD_WEIGHT` config in `app/config/settings.py`.
- Added deterministic rerank scoring in `app/services/vector_service.py`.
- Rerank score uses:
  - existing retrieval score
  - plus keyword-score boost
- Reranking is disabled by default to preserve current Cloud Run behavior.
- Added optional `/ask-rag` source metadata field:
  - `rerank_score`
- Updated RAG logs to include:
  - rerank enabled flag
  - rerank keyword weight
- Added unit tests for:
  - rerank score calculation
  - reranked candidate ordering
  - default non-reranked selection behavior

Result:

- Advanced RAG Phase 8 is complete.
- Reranking is available as an opt-in deterministic second-pass sort.
- Existing endpoint paths and default Cloud Run behavior were preserved.
- Grounded answer prompt with citations was completed in Phase 23.

## Phase 21 — Optional Hybrid Keyword + Vector Retrieval

Completed on 2026-06-04:

- Added `RAG_HYBRID_ENABLED` config in `app/config/settings.py`.
- Added `RAG_VECTOR_SCORE_WEIGHT` config in `app/config/settings.py`.
- Added keyword token overlap scoring in `app/services/vector_service.py`.
- Added hybrid score blending in `app/services/vector_service.py`.
- RAG retrieval now computes:
  - vector score
  - keyword score
  - optional blended hybrid score
- Hybrid scoring is disabled by default to preserve current Cloud Run behavior.
- When enabled, final score is:
  - `vector_score * RAG_VECTOR_SCORE_WEIGHT`
  - plus `keyword_score * (1 - RAG_VECTOR_SCORE_WEIGHT)`
- Added optional `/ask-rag` source metadata fields:
  - `vector_score`
  - `keyword_score`
- Updated RAG logs to include:
  - hybrid enabled flag
  - vector score weight
- Added unit tests for:
  - keyword overlap scoring
  - heading keyword scoring
  - hybrid score blending

Result:

- Advanced RAG Phase 7 is complete.
- Hybrid retrieval is available as an opt-in feature without changing endpoint paths.
- Existing Cloud Run behavior remains vector-only unless `RAG_HYBRID_ENABLED=true`.
- Optional reranking was completed in Phase 22.

## Phase 20 — Improved Retrieval Selection

Completed on 2026-06-04:

- Added `RAG_CANDIDATE_POOL_SIZE` config in `app/config/settings.py`.
- Added `RAG_SCORE_THRESHOLD` config in `app/config/settings.py`.
- Added `select_relevant_chunks(...)` in `app/services/vector_service.py`.
- Retrieval now:
  - sorts a larger candidate pool
  - filters chunks below the configured score threshold
  - returns at most `RAG_TOP_K` chunks
- Updated RAG logs to include:
  - top-k
  - candidate pool size
  - score threshold
  - selected source count
- Added unit tests for:
  - threshold filtering
  - candidate pool limiting

Result:

- Advanced RAG Phase 6 is complete.
- Weak low-score chunks are no longer forced into the prompt only because they are in the top-k set.
- Existing endpoint paths and response schemas were preserved.
- Optional hybrid keyword + vector retrieval was completed in Phase 21.

## Phase 19 — Chunk Metadata and Content Hashing

Completed on 2026-06-04:

- Added chunk metadata extraction in `app/services/vector_service.py`.
- Added heading extraction from the first Markdown heading in each chunk.
- Added character count metadata.
- Added SHA-256 `content_hash` values for chunk text in `app/services/firestore_service.py`.
- Stored the following Firestore fields during ingestion:
  - `content_hash`
  - `char_count`
  - `heading`
- Added optional source metadata fields to `/ask-rag` responses:
  - `content_hash`
  - `heading`
  - `char_count`
- Included heading metadata in retrieved RAG prompt context when available.
- Added unit tests for metadata extraction in `backend-GCP/tests/test_vector_service.py`.

Result:

- Advanced RAG Phase 5 is complete.
- Source chunks are now easier to audit, deduplicate, and cite later.
- Existing endpoint paths were preserved.
- Improved retrieval with score thresholds and a larger candidate pool was completed in Phase 20.

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
- Chunk metadata and content hashing was completed in Phase 19.

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

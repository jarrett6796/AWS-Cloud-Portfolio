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
Phase 12 — Monitoring and production hardening
```

Phase 1 through Phase 11 are complete. Phase 12 should improve monitoring and production hardening.

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
- Monitoring and production hardening is the next phase.

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
- Chat history is not persisted server-side.
- Streaming responses were completed in Phase 26.

## Current RAG Maturity Review

Recorded on 2026-06-04:

Current classification:

```text
Intermediate RAG with several advanced RAG features implemented.
```

The backend is beyond naive RAG because it has controlled error handling, structured logging, idempotent ingestion, Markdown-aware chunking, metadata and content hashing, score-threshold retrieval, a larger candidate pool, optional hybrid scoring, optional reranking, and source-ID citation support.

The backend is not yet fully production-grade advanced RAG because it still scans Firestore in memory and does not yet include a dedicated vector index, query rewriting, persistent server-side chat history, frontend streaming integration, CI-based RAG evaluation, or production monitoring dashboards.

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

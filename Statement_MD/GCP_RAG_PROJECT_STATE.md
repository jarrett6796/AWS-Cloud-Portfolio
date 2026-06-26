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

Current deployed revision after Phase 3B vector-search evaluation rollback:

```text
gcp-rag-backend-00022-7jr
```

Current production retrieval backend:

```text
RAG_VECTOR_SEARCH_BACKEND=local
```

Current production frontend origin allowed by backend CORS:

```text
https://d338amzpyv3o5b.cloudfront.net
```

Backend CORS source of truth:

```text
backend-GCP/app/config/settings.py
```

Cloud Run deployment also sets:

```text
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174,https://aws-cloudresume-gcprag-jarrett.cc,https://www.aws-cloudresume-gcprag-jarrett.cc,https://d338amzpyv3o5b.cloudfront.net
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

### `GET /rag-analytics/summary`

Admin-only analytics endpoint. Requires an `X-Admin-Token` header matching the Cloud Run `INGESTION_ADMIN_TOKEN` environment variable, loads recent metadata-only RAG analytics records from Firestore, and returns aggregate request, latency, no-answer, citation-validation, query rewrite, multi-query, metadata-filter, streaming, and source-usage metrics.

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
- Chunking now respects Markdown headings and paragraph boundaries, uses a token-count budget, and applies configurable token overlap for oversized paragraph splits.
- Production retrieval is currently the local Firestore full scan with vector scoring, optional hybrid keyword scoring, optional reranking, a configurable candidate pool, and a score threshold.
- Firestore Vector Search is implemented and live-validated as an optional retrieval backend, but it is not the current production default because its Phase 3B live evaluation scored 29/50 versus the 30/50 local baseline.
- Optional conversation-aware query rewriting is available as an Advanced RAG Phase 1 improvement. It is controlled by `RAG_QUERY_REWRITE_ENABLED`, uses recent user/assistant conversation history, and rewrites only when the model returns a different standalone retrieval query.
- Backend streaming is available through `POST /ask-rag-stream`; frontend streaming integration is implemented and browser-verified.
- Chat history is persisted server-side in Firestore under `conversations/{session_id}/messages/{message_id}`.
- Query rewrite audit messages are stored under the same Firestore message path with `role: system`, `event_type: query_rewrite`, `original_question`, `rewritten_query`, `rewrite_used`, `created_at`, and optional `request_id`.
- System audit messages are backend-only and are filtered out of frontend rendering and conversation context used for answer prompting.
- Ingestion now uses deterministic Firestore chunk IDs and prunes stale duplicate chunk documents.
- `POST /ingest-docs` is now admin-token protected; missing, wrong, or unconfigured tokens return a controlled `admin_auth_error` response.
- The backend deployment workflow now runs unit tests and compile checks before deployment, then runs `scripts/evaluate_rag.py` against the deployed backend and uploads `rag_eval_report.md` as a GitHub Actions artifact.
- Runtime citation validation now replaces unsupported generated answers with a safe no-answer response before they are returned or saved.
- Token-aware chunking and configurable chunk overlap are implemented in `app/services/vector_service.py` and configured through `DEFAULT_CHUNK_SIZE` and `DEFAULT_CHUNK_OVERLAP_TOKENS`.
- Optional metadata filtering can narrow retrieval by `project`, `doc_type`, `file_name`, `heading`, `section_path`, `source_uri`, or `version_id` before scoring.
- Public `/ask-rag` and `/ask-rag-stream` requests are guarded by a lightweight configurable in-memory rate limiter.

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
- Chunks are Markdown-aware, token-budgeted, and overlap oversized paragraph splits when configured.
- Chunk records include expanded metadata and content hashes.
- Optional metadata filtering can restrict retrieval by structured source fields before scoring.
- Retrieval uses a larger candidate pool and score threshold.
- Optional hybrid keyword + vector scoring exists.
- Optional deterministic reranking exists.
- `/ask-rag` responses include source metadata and grounded source IDs for citations.
- Runtime citation validation and no-answer guardrails are implemented for non-streaming and streaming RAG answers.
- Frontend source rendering displays returned source IDs beside each source item in the visible chat history UI.
- Conversation history is stored in Firestore and used only for follow-up context.
- Optional query rewriting uses recent conversation history before retrieval so vague follow-up questions can retrieve the right document chunks without changing the saved user message.
- Optional multi-query retrieval can generate retrieval variants, score chunks across the query set, and dedupe selected chunks by file name and chunk index.
- Optional semantic reranking and parent-child context expansion are implemented locally behind disabled-by-default flags.
- Admin-only `GET /rag-analytics/summary` exposes aggregate metadata-only RAG monitoring metrics.
- Streaming responses are available through `POST /ask-rag-stream`.
- `POST /ingest-docs` is protected with an admin token.
- Structured logging and health checks are implemented.

Why it is not fully production advanced RAG yet:

- Production retrieval still scans Firestore in memory.
- A Firestore Vector Search index exists and the vector backend is validated, but production remains on `local` until vector-mode quality meets or exceeds the current baseline.
- Semantic reranking and parent-child retrieval still need deployment, reingestion, flag enablement, and live evaluation before production use.
- There is no frontend monitoring dashboard yet.
- There is no GraphRAG or Agentic RAG yet.

## Phase 1 Immediate Backend Hardening - 2026-06-25

Current backend source of truth remains the code under `backend-GCP/app/`, especially:

- `app/config/settings.py`
- `app/schemas/chat_schema.py`
- `app/services/vector_service.py`
- `app/services/firestore_service.py`
- `app/services/ingestion_service.py`
- `app/services/rag_service.py`
- `app/services/rate_limit_service.py`
- `app/routes/rag.py`

New `document_chunks` metadata schema for fresh ingestion:

| Field | Purpose |
| --- | --- |
| `project` | Portfolio project or source group, defaulting to `aws-gcp-rag-capstone` or `portfolio`. |
| `doc_type` | Document category such as `overview`, `architecture`, `implementation`, `troubleshooting`, `development_log`, `test_record`, `state`, `audit`, or `roadmap`. |
| `section_path` | Markdown heading hierarchy when available. |
| `source_uri` | GCS-style source path such as `gs://cloud-resume-ai-rag-docs/<file>`. |
| `updated_at` | Firestore server timestamp from ingestion. |
| `version_id` | Initial version identifier derived from the content hash. |
| `file_name` | Source markdown file name. |
| `heading` | First heading in the chunk when available. |
| `chunk_index` | Deterministic chunk index for the source file. |
| `content_hash` | SHA-256 hash of chunk text. |
| `char_count` | Chunk character count. |

Backward compatibility:

- Existing Firestore chunks that lack new metadata fields still retrieve normally.
- Missing metadata values do not crash retrieval.
- Filters that remove all chunks continue to return the existing safe no-answer response.

Expanded metadata filtering:

- Exact match: `project`, `doc_type`, `file_name`, `version_id`.
- Case-insensitive substring match: `heading`, `section_path`, `source_uri`.
- Filters remain optional for both `POST /ask-rag` and `POST /ask-rag-stream`.

Rate limit behavior:

- Applies only to public `POST /ask-rag` and `POST /ask-rag-stream`.
- Does not apply to admin-protected `POST /ingest-docs` or `GET /rag-analytics/summary`.
- Uses client IP when available and falls back to `session_id`.
- Returns HTTP `429` with `Rate limit exceeded. Please try again later.` when exceeded.
- Config is `RAG_RATE_LIMIT_ENABLED`, `RAG_RATE_LIMIT_REQUESTS`, and `RAG_RATE_LIMIT_WINDOW_SECONDS`; deployment currently sets `true`, `20`, and `60`.

Validated Phase 1 behavior:

- Query rewriting remains controlled by `RAG_QUERY_REWRITE_ENABLED`, `RAG_QUERY_REWRITE_HISTORY_LIMIT`, and `RAG_QUERY_REWRITE_MODEL`.
- Rewritten queries are used for retrieval only; final answer prompts still answer the original user question.
- Rewrite failures fall back to the original question.
- Query rewrite audit messages remain backend-only system messages.
- Multi-query retrieval remains controlled by `RAG_MULTI_QUERY_ENABLED`, `RAG_MULTI_QUERY_COUNT`, and `RAG_MULTI_QUERY_MODEL`.
- Multi-query failures fall back to single-query retrieval.
- Candidate merging remains deterministic by keeping the best score per `file_name` and `chunk_index`.

## Phase 2 RAG Evaluation Framework - 2026-06-25

Golden question dataset:

- Path: `backend-GCP/evals/golden_questions.json`
- Count: 50 cases.
- Categories: `architecture`, `retrieval`, `ingestion`, `metadata`, `query_rewrite`, `multi_query`, `citation_validation`, `rate_limiting`, `firestore_memory`, `sse_streaming`, `rag_analytics`, `aws_visitor_counter`, `cloud_run`, `vertex_ai`, `limitations`, and `no_answer`.

Evaluation runner:

```bash
cd backend-GCP
python3 scripts/evaluate_rag.py \
  --base-url http://localhost:8080 \
  --questions evals/golden_questions.json \
  --output rag_eval_report.md \
  --json-output rag_eval_report.json \
  --timeout 45
```

Metrics:

- `total_cases`
- `passed_cases`
- `failed_cases`
- `overall_pass_rate`
- `source_match_rate`
- `required_terms_rate`
- `forbidden_terms_rate`
- `citation_grounding_rate`
- `no_answer_accuracy`
- `average_latency_ms`
- `p95_latency_ms`
- failure category counts

Thresholds:

- `RAG_EVAL_MIN_OVERALL_PASS_RATE`, default `0.80`.
- `RAG_EVAL_MIN_SOURCE_MATCH_RATE`, default `0.75`.
- `RAG_EVAL_MIN_CITATION_RATE`, default `0.90`.
- `RAG_EVAL_MAX_AVERAGE_LATENCY_MS`, default `12000`.

CI behavior:

- `.github/workflows/deploy-backend-gcp.yml` runs the evaluator after deployment.
- CI uses the golden question dataset.
- CI uploads `rag-evaluation-report` for Markdown and `rag-evaluation-json` for machine-readable output.
- CI currently runs with `--soft-fail` to avoid blocking deployment while the new dataset is calibrated against the deployed index.

Current limitations:

- This framework proves and tracks quality, but it does not change retrieval architecture.
- The backend remains Intermediate RAG with several advanced features.
- Production-grade Advanced RAG still requires managed vector retrieval and semantic reranking.

## Phase 2.5 Live RAG Evaluation Calibration - 2026-06-25

Backend URL used:

- `https://gcp-rag-backend-189047029621.asia-east1.run.app`
- `GET /healthz` returned HTTP `404`.
- `GET /` returned HTTP `200`; the documented Cloud Run root URL was used for the live evaluation.

Live evaluation command:

```bash
cd backend-GCP
python3 scripts/evaluate_rag.py \
  --base-url https://gcp-rag-backend-189047029621.asia-east1.run.app \
  --questions evals/golden_questions.json \
  --output evals/reports/rag_eval_live_20260625.md \
  --json-output evals/reports/rag_eval_live_20260625.json \
  --timeout 45 \
  --soft-fail
```

Baseline scores:

- Dataset size: 50 cases.
- Overall pass rate: `0.08` with 4 passing cases and 46 failing cases.
- Source match rate: `1.0`.
- Required terms rate: `0.28`.
- Forbidden terms rate: `0.98`.
- Citation grounding rate: `0.6`.
- No-answer accuracy: `0.46`.
- Average latency: `3268.07 ms`.
- P95 latency: `5823.98 ms`.

Failure categories:

- `source_mismatch`: 45.
- `missing_required_terms`: 36.
- `wrong_no_answer`: 27.
- `missing_citation`: 20.
- `forbidden_claim`: 1.

Calibration decision:

- No dataset records were removed or weakened.
- No thresholds were lowered.
- CI remains soft-fail because the live baseline does not yet meet the default thresholds.
- The source file match rate was strong, but live chunks did not return `doc_type` metadata, which caused most document-type source mismatch failures.
- Several answers indicate stale deployed index content, so the next backend action should be controlled reingestion of the current documentation before considering a blocking CI gate.

## Phase 2.6 KM Source Audit - 2026-06-25

Findings:

- Live Cloud Run was serving an older backend image from commit `8c3a43e`.
- Live runtime config did not set `GOOGLE_CLOUD_PROJECT` and still used default ingestion docs `PROJECT_STATE.md,Frontend_Development_Log.md`.
- The GCS source bucket contained only `CAPSTONE_PROJECT_STATE.md`, but it was a stale 9 KB object from `2026-06-03`.
- Firestore contained 24 stale chunks from `2026-06-03`.
- Phase 1 metadata was not present before reingestion: `project`, `doc_type`, `section_path`, `source_uri`, and `version_id` were missing from all chunks.
- The evaluator reported doc-type failures as `source_mismatch`, which made source-file matching look contradictory.

Actions completed:

- Backed up Firestore `document_chunks` before reingestion.
- Backed up the old GCS source object.
- Uploaded committed `HEAD:Statement_MD/CAPSTONE_PROJECT_STATE.md` to GCS.
- Deployed current backend source to Cloud Run.
- Ran one controlled admin reingestion.
- Removed the temporary ingestion admin token after reingestion.
- Raised the public RAG rate-limit budget to `100` requests per 60 seconds so the 50-question evaluator can run.
- Updated `.github/workflows/deploy-backend-gcp.yml` to preserve the same evaluation-safe rate-limit budget.

Reingestion result:

- Before: 24 chunks.
- After: 23 chunks.
- Chunks created/upserted: 23.
- Chunks pruned: 1.
- Indexed source file: `CAPSTONE_PROJECT_STATE.md`.
- Metadata after reingestion:
  - `project`: 23 / 23.
  - `doc_type`: 23 / 23.
  - `source_uri`: 23 / 23.
  - `version_id`: 23 / 23.
  - `section_path`: 18 / 23.

Evaluation delta:

- Pass rate improved from `0.08` to `0.60`.
- Passed cases improved from 4 / 50 to 30 / 50.
- Citation grounding improved from `0.60` to `0.90`.
- No-answer accuracy improved from `0.46` to `0.86`.
- Overall threshold still fails because the pass rate is below `0.80`.

Current decision:

- CI remains soft-fail.
- The system is no longer blocked by stale source/index metadata.
- Remaining evaluation work should focus on the 20 failing cases, especially strict required terms and advanced-feature wording, before making CI blocking.

## Phase 3A Firestore Vector Search Migration - 2026-06-25

Purpose:

- Replace the Cloud Run local full-scan retrieval bottleneck with an optional Firestore Vector Search retrieval backend.
- Preserve the existing local scan path as the default and fallback.

Current implementation status:

- `RAG_VECTOR_SEARCH_BACKEND=local` remains the default.
- `RAG_VECTOR_SEARCH_BACKEND=firestore_vector` enables Firestore nearest-neighbor retrieval.
- `RAG_VECTOR_SEARCH_FALLBACK_ENABLED=true` falls back to the local full scan if Firestore Vector Search fails.
- RAG analytics records `retrieval_backend` as `local`, `firestore_vector`, or `firestore_vector_fallback`.
- Ingestion now writes future embeddings with Firestore's `Vector` SDK type.

Config flags:

- `RAG_VECTOR_SEARCH_BACKEND`
- `RAG_VECTOR_SEARCH_DISTANCE_MEASURE`
- `RAG_VECTOR_SEARCH_LIMIT`
- `RAG_VECTOR_SEARCH_FALLBACK_ENABLED`
- `RAG_FIRESTORE_VECTOR_FIELD`

SDK and index requirements:

- Required Python package: `google-cloud-firestore>=2.27.0`.
- Required vector field: `embedding`.
- Current embedding dimension: 768.
- Distance measure: `COSINE`.
- Index setup guide: `backend-GCP/docs/firestore_vector_search.md`.

Live verification status:

- Code and tests are ready.
- Phase 3B created the Firestore vector index, reingested chunks as Firestore `Vector` values, enabled `firestore_vector`, and verified a successful smoke test.
- Live evaluation scored 29/50 versus the 30/50 local baseline, so Cloud Run was reverted to `RAG_VECTOR_SEARCH_BACKEND=local`.
- Firestore Vector Search remains available as a code-gated retrieval backend for future tuning.

## Phase 3B Firestore Vector Search Live Enablement - 2026-06-25

Index status:

- Index ID: `CICAgOjXh4EK`.
- Collection group: `document_chunks`.
- Field: `embedding`.
- Dimension: `768`.
- State: `READY`.
- Runtime distance measure: `COSINE`.

Deployment and ingestion result:

- Local-default deploy revision: `gcp-rag-backend-00019-fzr`.
- Vector-mode deploy revision: `gcp-rag-backend-00021-2mx`.
- Final production rollback revision: `gcp-rag-backend-00022-7jr`.
- Before reingestion: 23 chunks from `CAPSTONE_PROJECT_STATE.md`, embeddings stored as plain lists, dimension 768.
- After reingestion: 23 chunks from `CAPSTONE_PROJECT_STATE.md`, embeddings stored as Firestore `Vector`, dimension 768.
- Reingestion result: `chunks_created=23`, `chunks_pruned=0`.
- Temporary ingestion admin token was removed after the controlled reingestion.

Smoke test:

- `POST /ask-rag` returned HTTP 200.
- The answer included citations.
- Five sources were returned.
- Returned sources included `vector_distance`.
- RAG analytics confirmed `retrieval_backend=firestore_vector`.

Evaluation comparison:

| Metric | Local full-scan baseline | Firestore vector mode | Delta |
| --- | ---: | ---: | ---: |
| Passed cases | 30 / 50 | 29 / 50 | -1 |
| Overall pass rate | 0.60 | 0.58 | -0.02 |
| Source match rate | 1.00 | 1.00 | 0.00 |
| Doc type match rate | 0.98 | 0.98 | 0.00 |
| Required terms rate | 0.64 | 0.64 | 0.00 |
| Citation grounding rate | 0.90 | 0.92 | +0.02 |
| No-answer accuracy | 0.86 | 0.86 | 0.00 |

Current decision:

- Firestore Vector Search is validated but not left enabled in production.
- Production remains on `local` because the managed vector path is one passing case below the local baseline.
- Reports are saved at:
  - `backend-GCP/evals/reports/rag_eval_firestore_vector_20260625.md`
  - `backend-GCP/evals/reports/rag_eval_firestore_vector_20260625.json`

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
17. Token-aware chunking with configurable chunk overlap
18. Optional metadata filtering by file name and heading
19. Optional multi-query retrieval with chunk deduplication
20. Metadata-only RAG analytics records
21. Admin-only RAG analytics summary endpoint
22. Phase 4 Advanced RAG deployed implementation: semantic reranking and parent-child context expansion

Next:

1. Monitor Phase 4 latency and analytics in production traffic.
2. Decide whether semantic reranking should remain enabled after real usage.
3. Revisit Firestore Vector Search only after local + Phase 4 behavior is stable; do not combine it with this validation phase.

## Advanced RAG Roadmap — Phase 1 to Phase 5

The backend is currently Intermediate RAG with several advanced RAG features implemented. Phase 4 semantic reranking and parent-child retrieval are deployed and functionally validated on Cloud Run, but this phase did not attempt to optimize or rerun the 50-question evaluation score.

| Phase | Focus | Improvements | New GCP Services Required? | Goal |
| --- | --- | --- | --- | --- |
| Phase 1 | Retrieval Quality Quick Wins | Query rewriting, chunk overlap, token-aware chunking, citation validation | No new GCP service | Improve answer relevance and citation reliability without changing architecture |
| Phase 2 | Better Retrieval Logic | Multi-query retrieval, metadata filtering, no-answer confidence handling | No new GCP service required | Make retrieval more accurate and safer for ambiguous or weak-context questions |
| Phase 3 | Evaluation and Observability | RAG evaluation in CI/CD, project analytics, response/error tracking, monitoring dashboard | Optional: Cloud Logging, Cloud Monitoring, Firestore analytics collection | Prove quality, detect failures, and show production-readiness |
| Phase 4 | Managed Vector Retrieval | Firestore Vector Search or Vertex AI Vector Search, managed ANN retrieval, scalable vector index | Yes: Firestore Vector Search or Vertex AI Vector Search | Validate managed vector retrieval, then enable it only when evaluation meets or exceeds the local baseline |
| Phase 5 | Advanced RAG Patterns | GraphRAG, Agentic RAG, specialist retrievers, multi-source orchestration | Yes, likely: Vertex AI Vector Search, Agent Engine/ADK, BigQuery/graph-style storage | Move beyond document similarity into relationship-aware and agent-driven retrieval |

### Phase 1 — Retrieval Quality Quick Wins

This phase improves the current RAG pipeline without adding new infrastructure. Query rewriting turns follow-up questions into standalone retrieval queries. Chunk overlap and token-aware chunking improve context boundaries during ingestion. Citation validation checks whether generated answers properly reference valid source IDs such as `[S1]` and `[S2]`.

### Phase 2 — Better Retrieval Logic

This phase improves retrieval behavior while still using the current Cloud Run + Firestore setup. Multi-query retrieval generates several search variants and merges results. Metadata filtering narrows retrieval by file, project, topic, or document type. No-answer confidence handling prevents the assistant from answering when retrieved context is too weak.

### Phase 3 — Evaluation and Observability

This phase moves the project closer to production operations. RAG evaluation can run in CI/CD to catch retrieval or prompt regressions before deployment. Analytics can track project questions, response time, errors, source usage, and session behavior. Cloud Logging, Cloud Monitoring, and Firestore analytics can support this phase.

### Phase 4 — Managed Vector Retrieval

This is the biggest GCP architecture upgrade. Phase 3B validated Firestore Vector Search in the live environment, but the 50-question score was 29/50 versus the 30/50 local baseline. The current production system therefore remains on the local Firestore scan until vector recall, candidate selection, or answer calibration closes that gap.

### Phase 4 Advanced RAG Add-On — Semantic Reranking and Parent-Child Retrieval

The backend now includes Gemini semantic reranking and parent-child context expansion. Semantic reranking ranks compact retrieved chunk previews after metadata filtering and hybrid scoring, then source IDs are assigned after reranking so citations remain stable. Parent-child retrieval adds parent metadata during ingestion and expands retrieved child chunks to token-limited parent section context. Existing chunks remain compatible through fallback to child text. Final validated production revision: `gcp-rag-backend-00028-hlc`, with `RAG_SEMANTIC_RERANK_ENABLED=true`, `RAG_PARENT_CHILD_ENABLED=true`, and `RAG_VECTOR_SEARCH_BACKEND=local`.

### Phase 5 — Advanced RAG Patterns

This phase is optional and should come later. GraphRAG adds entity and relationship retrieval instead of relying only on semantic similarity. Agentic RAG adds routing, specialist retrievers, and multi-source orchestration. This is closer to enterprise Advanced RAG, but it is more complex than needed for the current portfolio stage.

## Recommended Next Implementation Order

1. Query rewriting
2. Citation validation and no-answer guardrails
3. Chunk overlap and token-aware chunking
4. Metadata filtering
5. Multi-query retrieval
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
15. Token-aware chunking with configurable chunk overlap.
16. Optional metadata filtering by file name and heading.
17. Optional multi-query retrieval with chunk deduplication.
18. Metadata-only RAG analytics records.
19. Admin-only RAG analytics summary endpoint.

Dated improvement summary:

1. 2026-06-15 — CI/CD RAG evaluation gate.
2. 2026-06-15 — Runtime citation validation and safe no-answer handling.
3. 2026-06-15 — Token-aware chunking with configurable chunk overlap.
4. 2026-06-15 — Phase 2A metadata filtering.
5. 2026-06-15 — Phase 2B multi-query retrieval.
6. 2026-06-15 — Phase 3A metadata-only RAG analytics records.
7. 2026-06-15 — Phase 3B admin-only RAG analytics summary endpoint.

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

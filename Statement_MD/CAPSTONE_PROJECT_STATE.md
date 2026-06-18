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
- Stable project documentation portal with a collapsible sidebar and markdown-style content viewer
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
  -> /ask-rag-stream request with session_id
  -> GCP Cloud Run FastAPI backend
  -> Firestore conversation history
  -> Firestore retrieval
  -> Gemini streaming response generation
  -> React global AI assistant progressively renders tokens
```

Persistent RAG chat architecture:

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

The Project Modal is now reserved for project documentation only. It uses one shared centered modal shell with a Docusaurus/GitBook-style left sidebar and one markdown-style content viewer. The modal renders three markdown files per project, `overview.md`, `architecture.md`, and `implementation.md`; sidebar section links scroll to anchors inside the active document instead of replacing the content with separate pages. The global Ask AI assistant remains outside the modal and can layer above it without changing modal size or scroll behavior. The modal shell remains fixed while only the documentation viewer scrolls.

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
│   ├── PortfolioCaseStudies.jsx
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
- Project section has been renamed visually to `Portfolio`.
- Portfolio section uses vertically stacked wide case-study cards.
- Featured capstone card is `AWS Cloud Resume + GCP RAG`.
- All portfolio cards use the same card shape, two-column layout, preview ratio, title sizing, text spacing, and typography.
- Featured capstone card supports a Draw.io architecture image at `frontend-Vite/public/architecture/aws-gcp-rag-architecture.png` with `object-fit: contain`; it falls back to the existing architecture preview if the image file is absent.
- Capstone card differs only through an AWS-orange `#FF9900` frame/border and the `CAPSTONE PROJECT` type label.
- Each card includes a non-interactive `View more →` affordance inside the existing card button.
- Supporting project cards use the same wide case-study structure with neutral borders.
- Project modal top tabs have been replaced with a documentation portal structure based on three markdown files per project:
  - `overview.md`
  - `architecture.md`
  - `implementation.md`
- Documentation content is stored under `frontend-AWS/src/content/projects/<project-slug>/` and loaded through `frontend-AWS/src/content/projectDocs.js`.
- Project documentation rendering is now fault-tolerant across all projects. The shared parser validates malformed fenced blocks, Mermaid blocks, gallery blocks, callouts, invalid table-like blocks, and missing top-level sections, logs `[Markdown Warning]` messages, and continues rendering the rest of the active document where possible.
- Markdown rendering now isolates errors at the block level. A broken Mermaid diagram shows `[ Mermaid Diagram Failed To Render ]` with the Mermaid source, missing image/gallery assets show `Image Not Found`, and one broken block should not break the sidebar, modal shell, other sections, or other projects.
- Markdown authoring guidance now lives at `frontend-AWS/src/content/projects/MARKDOWN_AUTHORING_GUIDE.md`.
- Sidebar categories expand or collapse without changing the active document.
- Section links such as `Architecture > Workflow` and `Implementation > Security` load the correct document if needed and smoothly scroll to an anchor inside that document.
- Removed the older top-tab interaction model:
  - `Overview`
  - `Architecture`
  - `Challenges`
  - `Documentation`
- Project modal header keeps the project title and primary technology tags visible.
- Project modal Overview tab no longer repeats the `Primary Technologies` card because those technologies are already visible as project tags.
- The capstone project modal now includes overview goals/status, architecture diagram/module/workflow/technology-stack sections, and implementation sections for frontend, backend, GCP-RAG, database, API, network, security, deployment, CI/CD, IaC, monitoring, and troubleshooting.
- Supporting project modals use fallback documentation sections from existing project summaries, services, architecture notes, and technical notes.
- Homepage AI assistant calls `/ask-rag` through `src/api/chat.js`.
- Visitor counter logic is isolated in `src/api/visitors.js`.
- Theme behavior is isolated in `useTheme.js`.
- Scroll progress and active section tracking are isolated in `useScrollTracker.js`.
- GCP backend supports `/ask-rag` retrieval and Gemini generation.
- GCP backend supports `/ingest-docs` document chunking and embedding storage.
- GCP backend protects `/ingest-docs` with an `X-Admin-Token` header backed by `INGESTION_ADMIN_TOKEN`, so public chat routes remain unauthenticated while ingestion is admin-only.
- Backend config now lives in `backend-GCP/app/config/settings.py`.
- Backend request and response schemas now live in `backend-GCP/app/schemas/chat_schema.py`.
- Gemini generation and embedding calls now live in `backend-GCP/app/services/gemini_service.py`.
- GCS access now lives in `backend-GCP/app/services/gcs_service.py`.
- Firestore access now lives in `backend-GCP/app/services/firestore_service.py`.
- Chunking, cosine similarity, and top-k selection now live in `backend-GCP/app/services/vector_service.py`.
- RAG orchestration now lives in `backend-GCP/app/services/rag_service.py`.
- Document ingestion now lives in `backend-GCP/app/services/ingestion_service.py`.
- Endpoint handlers now live in `backend-GCP/app/routes/`.
- GCP backend now stores persistent conversation history in Firestore under `conversations/{session_id}/messages/{message_id}`.
- GCP backend now supports optional Advanced RAG Phase 1 conversation-aware query rewriting before retrieval.
- Query rewriting uses recent user/assistant conversation history to turn vague follow-up questions into standalone retrieval queries before embedding, hybrid scoring, and reranking.
- Original user messages remain unchanged in Firestore and in the frontend UI.
- Rewritten retrieval queries are stored only as backend system audit messages in Firestore when a rewrite is actually used.
- Firestore query rewrite audit records keep the existing path `conversations/{session_id}/messages/{message_id}` with `role: system` and `event_type: query_rewrite`.
- Homepage AI assistant persists its active chat session ID in `localStorage` under `portfolioAssistantSessionId`.
- The deployed RAG backend revision verified for persistent chat history is `gcp-rag-backend-00010-zv5`.
- Homepage AI assistant now uses `POST /ask-rag-stream` first and progressively renders streamed answer tokens.
- The frontend preserves `/ask-rag` as fallback if streaming fails.
- Homepage AI assistant response cards now use the `GCP RAG` label.
- Homepage AI assistant stores response status per assistant message, so historical responses keep their final status while only the active response receives live progress updates.
- Homepage AI assistant source rows now display source ID labels such as `[S1]` beside each returned source item while preserving per-message source grouping.

## Known Limitations

- Retrieval now uses vector scoring, optional hybrid keyword scoring, optional reranking, a configurable candidate pool, and a score threshold, but still scans Firestore in memory.
- Chunking now respects Markdown headings and paragraph boundaries, uses a token-count budget, and applies configurable token overlap for oversized paragraph splits.
- Streaming is available through `POST /ask-rag-stream`; the main frontend now consumes the stream and progressively renders responses.
- Chat history is now persisted server-side in Firestore; old frontend-provided history remains as fallback compatibility.
- Grounded answer prompt now requires source ID citations for factual claims.
- Runtime citation validation now replaces unsupported generated answers with a safe no-answer response before they are returned or saved.
- Optional metadata filtering can narrow retrieval by source file name or heading before scoring.
- Optional multi-query retrieval can expand ambiguous retrieval queries and dedupe candidates before final selection.
- Ingestion now uses deterministic Firestore chunk IDs and prunes stale duplicate chunk documents.
- Contact form is UI-only.
- Original AWS Lambda/Bedrock RAG path is deferred, not the current implementation.

## Current RAG Maturity

Current classification:

```text
Intermediate RAG with several advanced RAG features implemented.
```

This backend is no longer naive RAG. It has moved beyond basic chunk/embed/retrieve/generate because it now includes Cloud Run FastAPI, Vertex AI Gemini 2.5 Flash, `text-embedding-005`, Firestore `document_chunks`, Firestore `conversations`, Markdown-aware token-budget chunking, configurable chunk overlap, content hashing, chunk metadata, metadata filtering, score thresholds, candidate pool retrieval, optional multi-query retrieval, optional hybrid keyword + vector scoring, optional heuristic reranking, grounded source IDs, runtime citation validation, persistent chat history, optional conversation-aware query rewriting with backend-only Firestore audit messages, streaming responses, protected `/ingest-docs`, structured logging, and health checks.

It is not yet fully production-grade Advanced RAG because retrieval still scans Firestore in memory and the system does not yet include a managed vector index, a real semantic reranker, a monitoring/analytics dashboard, GraphRAG, or Agentic RAG.

## Near-Term Next Steps

### Frontend Next Steps

- Keep current modular frontend stable.
- Avoid visual redesign unless it improves clarity.
- Export the final Draw.io architecture diagram to `frontend-Vite/public/architecture/aws-gcp-rag-architecture.png`.
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
12. CI/CD backend tests, compile check, and post-deploy RAG evaluation report
13. Runtime citation validation and safe no-answer handling
14. Token-aware chunking with configurable chunk overlap
15. Optional metadata filtering by file name and heading
16. Optional multi-query retrieval with chunk deduplication
17. Metadata-only RAG analytics records
18. Admin-only RAG analytics summary endpoint

Next:

1. Add Phase 3C frontend/internal monitoring dashboard.

### Advanced RAG Roadmap — Phase 1 to Phase 5

| Phase | Focus | Improvements | New GCP Services Required? | Goal |
| --- | --- | --- | --- | --- |
| Phase 1 | Retrieval Quality Quick Wins | Query rewriting, chunk overlap, token-aware chunking, citation validation | No new GCP service | Improve answer relevance and citation reliability without changing architecture |
| Phase 2 | Better Retrieval Logic | Multi-query retrieval, metadata filtering, no-answer confidence handling | No new GCP service required | Make retrieval more accurate and safer for ambiguous or weak-context questions |
| Phase 3 | Evaluation and Observability | RAG evaluation in CI/CD, project analytics, response/error tracking, monitoring dashboard | Optional: Cloud Logging, Cloud Monitoring, Firestore analytics collection | Prove quality, detect failures, and show production-readiness |
| Phase 4 | Managed Vector Retrieval | Firestore Vector Search or Vertex AI Vector Search, managed ANN retrieval, scalable vector index | Yes: Firestore Vector Search or Vertex AI Vector Search | Replace Firestore full-scan retrieval with production-style vector search |
| Phase 5 | Advanced RAG Patterns | GraphRAG, Agentic RAG, specialist retrievers, multi-source orchestration | Yes, likely: Vertex AI Vector Search, Agent Engine/ADK, BigQuery/graph-style storage | Move beyond document similarity into relationship-aware and agent-driven retrieval |

#### Phase 1 — Retrieval Quality Quick Wins

This phase improves the current RAG pipeline without adding new infrastructure. Query rewriting turns follow-up questions into standalone retrieval queries. Chunk overlap and token-aware chunking improve context boundaries during ingestion. Citation validation checks whether generated answers properly reference valid source IDs such as `[S1]` and `[S2]`.

#### Phase 2 — Better Retrieval Logic

This phase improves retrieval behavior while still using the current Cloud Run + Firestore setup. Multi-query retrieval generates several search variants and merges results. Metadata filtering narrows retrieval by file, project, topic, or document type. No-answer confidence handling prevents the assistant from answering when retrieved context is too weak.

#### Phase 3 — Evaluation and Observability

This phase moves the project closer to production operations. RAG evaluation can run in CI/CD to catch retrieval or prompt regressions before deployment. Analytics can track project questions, response time, errors, source usage, and session behavior. Cloud Logging, Cloud Monitoring, and Firestore analytics can support this phase.

#### Phase 4 — Managed Vector Retrieval

This is the biggest GCP architecture upgrade. The current system scans Firestore `document_chunks` in memory and calculates cosine similarity locally. A production-style system should use a managed vector index such as Firestore Vector Search or Vertex AI Vector Search for approximate nearest-neighbor retrieval.

#### Phase 5 — Advanced RAG Patterns

This phase is optional and should come later. GraphRAG adds entity and relationship retrieval instead of relying only on semantic similarity. Agentic RAG adds routing, specialist retrievers, and multi-source orchestration. This is closer to enterprise Advanced RAG, but it is more complex than needed for the current portfolio stage.

### Recommended Next Implementation Order

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

Phase 13 added backend CI checks to `.github/workflows/deploy-backend-gcp.yml`: the workflow installs backend dependencies, runs `python -m unittest discover -s tests`, compiles `main.py` and `app/config/settings.py`, deploys to Cloud Run, then runs `backend-GCP/scripts/evaluate_rag.py` against the deployed backend URL. The evaluator writes `rag_eval_report.md` and the workflow uploads it as the `rag-evaluation-report` artifact. The RAG evaluation currently validates retrieval source match, required answer keywords, forbidden claims, and source-ID grounding.

Phase 14 added runtime citation validation in `backend-GCP/app/services/rag_service.py`. If retrieval returns no selected chunks, the backend skips Gemini answer generation and returns `I do not know based on the indexed project documents.` If Gemini returns an answer that does not cite at least one valid returned source ID, or cites unavailable source IDs, the backend replaces the answer with the same safe no-answer response before saving the assistant message. The streaming path validates the completed generated answer before emitting final SSE token chunks so the frontend does not display unsupported factual text.

Phase 15 updated `backend-GCP/app/services/vector_service.py` from character-budget splitting to token-budget chunking while preserving Markdown section and paragraph boundaries. Oversized paragraph splits now support `DEFAULT_CHUNK_OVERLAP_TOKENS`, bounded below the chunk size, so adjacent chunks can share trailing context. `backend-GCP/app/config/settings.py` exposes `default_chunk_size` and `default_chunk_overlap_tokens` in the public runtime summary and startup warnings validate invalid chunking configuration.

Phase 16 added optional metadata filtering on 2026-06-15. `backend-GCP/app/schemas/chat_schema.py` now accepts an optional `metadata_filter` object with `file_name` and `heading` fields. `backend-GCP/app/routes/rag.py` passes the filter into both `/ask-rag` and `/ask-rag-stream`, and `backend-GCP/app/services/rag_service.py` applies the filter before scoring Firestore chunks. The first filter contract is intentionally Firestore-scan compatible and can be reused later when retrieval moves to managed vector search.

Phase 17 added optional multi-query retrieval on 2026-06-15. `backend-GCP/app/config/settings.py` now exposes `RAG_MULTI_QUERY_ENABLED`, `RAG_MULTI_QUERY_COUNT`, and `RAG_MULTI_QUERY_MODEL`. When enabled, `backend-GCP/app/services/rag_service.py` asks Gemini for alternate retrieval queries, embeds the original query plus variants, scores each Firestore chunk across the query set, keeps the best score per `file_name` and `chunk_index`, and then sends the deduplicated candidates through the existing threshold/rerank/source-ID pipeline. The feature is disabled by default in `.github/workflows/deploy-backend-gcp.yml` to preserve current Cloud Run behavior until production validation.

Phase 18 added metadata-only RAG analytics records on 2026-06-15. `backend-GCP/app/config/settings.py` now exposes the `rag_analytics` Firestore collection in the public runtime summary. `backend-GCP/app/services/firestore_service.py` can write analytics records, and `backend-GCP/app/services/rag_service.py` saves one record after successful sync or streaming RAG responses. The record tracks request/session metadata, response mode, latency, source count, source file names, max score, no-answer status, citation-validation block status, query rewrite usage, retrieval query count, multi-query setting, and metadata-filter usage. It intentionally stores lengths and flags only, not prompt text, question text, retrieved document text, embeddings, or generated answers.

Phase 19 added an admin-only RAG analytics summary endpoint on 2026-06-15. `backend-GCP/app/routes/rag.py` now exposes `GET /rag-analytics/summary`, protected by the same `X-Admin-Token` and `INGESTION_ADMIN_TOKEN` guard used by ingestion. `backend-GCP/app/services/firestore_service.py` loads recent analytics records, and `backend-GCP/app/services/rag_service.py` aggregates record count, average latency, average source count, no-answer rate, citation-validation block rate, query rewrite rate, multi-query rate, metadata-filter rate, streaming rate, and top source file usage. The endpoint returns derived metrics only.

Phase 1 added controlled backend exceptions and stable JSON error payloads while preserving endpoint paths and `main:app`.

Phase 2 added JSON-formatted Cloud Run logs, request IDs, request duration logs, controlled error logs, and metadata-only service logs for Gemini, GCS, Firestore, ingestion, and RAG flow.

Phase 3 made `/ingest-docs` rerunnable by using deterministic Firestore chunk document IDs and pruning stale duplicate chunk documents after successful file ingestion.

Phase 4 replaced fixed-size-only chunking with Markdown-aware chunking that keeps headings with section content and falls back to paragraph or size splitting for oversized sections.

Phase 5 added chunk metadata and content hashes, including Firestore fields for `content_hash`, `char_count`, and `heading`, plus optional `/ask-rag` source metadata fields.

Phase 6 added configurable retrieval selection with `RAG_CANDIDATE_POOL_SIZE` and `RAG_SCORE_THRESHOLD`, so weak chunks are filtered before the final `RAG_TOP_K` prompt context is built.

Phase 7 added opt-in hybrid keyword + vector retrieval with `RAG_HYBRID_ENABLED` and `RAG_VECTOR_SCORE_WEIGHT`. Hybrid retrieval is disabled by default to preserve current Cloud Run behavior.

Phase 8 added opt-in deterministic reranking with `RAG_RERANK_ENABLED` and `RAG_RERANK_KEYWORD_WEIGHT`. Reranking is disabled by default to preserve current Cloud Run behavior.

Phase 9 added stable source IDs, source metadata, and stricter prompt instructions requiring citation labels such as `[S1]` for factual claims.

Phase 10 added persistent Firestore chat history. The frontend sends `session_id` with `/ask-rag`, the backend loads recent conversation messages from Firestore before prompt construction, and retrieved documents remain the only factual source.

Phase 11 added a backend streaming path at `POST /ask-rag-stream` using server-sent events. It streams source metadata first, then answer tokens, then a completion event while preserving `/ask-rag`.

Frontend streaming support now consumes `POST /ask-rag-stream`, parses SSE events in `src/api/chat.js`, updates `chatAnswer` token-by-token in `useAssistantChat.js`, and renders partial answers immediately in `ChatPanel.jsx`.

Phase 12 added an initial production-hardening pass: non-secret runtime config summaries, startup warning checks, a lightweight `/healthz` endpoint, richer root health response, request ID propagation into controlled error responses, and request duration response headers.

Production hardening follow-up added admin-token protection for `POST /ingest-docs`. The deployment workflow now passes `INGESTION_ADMIN_TOKEN` from GitHub secrets into Cloud Run, and the route returns a controlled `admin_auth_error` response when the token is missing, wrong, or not configured. Public `/ask-rag` and `/ask-rag-stream` behavior is unchanged.

## Latest RAG Deployment Test

Completed on 2026-06-05:

- Production fix completed:
  - AI assistant backend connection on the live CloudFront site.
- Live production site:
  - `https://dvzu3s2gq6iw.cloudfront.net`
- Backend:
  - `https://gcp-rag-backend-189047029621.asia-east1.run.app`
- User-facing production error before fix:
  - `Could not connect to the AI backend. Please try again.`
- Investigation result:
  - Production JavaScript bundle contained the Cloud Run backend URL.
  - Production JavaScript bundle contained both `/ask-rag-stream` and `/ask-rag`.
  - Browser console showed `TypeError: Failed to fetch` for streaming and fallback calls.
  - CORS preflight from the CloudFront origin returned `HTTP/2 400`.
  - Backend response body was `Disallowed CORS origin`.
- Root cause:
  - Cloud Run backend CORS allowed localhost but did not allow:
    - `https://dvzu3s2gq6iw.cloudfront.net`
- Fix:
  - Added the CloudFront production origin to backend CORS defaults in `backend-GCP/app/config/settings.py`.
  - Added backend settings regression coverage in `backend-GCP/tests/test_settings.py`.
  - Updated `.github/workflows/deploy-backend-gcp.yml` to deploy `CORS_ALLOWED_ORIGINS`.
  - Fixed the gcloud env-var delimiter syntax for comma-separated CORS values.
- Deployment verification:
  - Frontend deployment workflow succeeded.
  - Backend deployment workflow initially failed once because gcloud parsed commas inside `CORS_ALLOWED_ORIGINS`.
  - Workflow syntax was corrected with a custom delimiter.
  - Backend deployment then succeeded.
  - Cloud Run revision deployed:
    - `gcp-rag-backend-00012-pbg`
  - Revision served 100% of traffic.
- CORS verification after fix:
  - Preflight to `/ask-rag-stream` from `https://dvzu3s2gq6iw.cloudfront.net` returned `HTTP/2 200`.
  - Response included:
    - `access-control-allow-origin: https://dvzu3s2gq6iw.cloudfront.net`
- Browser verification after deployment:
  - Live CloudFront assistant successfully sent the AI request.
  - Assistant returned a grounded RAG answer with citations and sources.
  - The previous connection error no longer appeared.
- Commits:
  - `47e1aa9` — backend CORS fix and regression test.
  - `c0b52f8` — Cloud Run deployment env-var delimiter fix.
- Verification commands:
  - `npm --prefix frontend-AWS run lint`
  - `npm --prefix frontend-AWS run build`
  - `python3 -m py_compile main.py app/config/settings.py`
  - `python3 -m unittest tests/test_settings.py`

Completed on 2026-06-05:

- Feature completed:
  - Persistent Firestore Chat History
- Deployed persistent Firestore chat history to Cloud Run revision:
  - `gcp-rag-backend-00010-zv5`
- Initial issue:
  - Firestore `conversations` collection did not appear.
- Root cause:
  - Cloud Run was still serving old revision `gcp-rag-backend-00009-m6h`.
- Resolution:
  - Redeployed the backend.
- Verified `/ask-rag` response includes `session_id`.
- Verified Firestore automatically created:
  - `conversations/debug-session-001/messages`
- Verified Firestore write operations succeed for user and assistant messages.
- Verified persistent conversation infrastructure is operational.
- Verified backend compile check:
  - `python3 -m py_compile main.py`
- Verified frontend status:
  - `npm run lint`
  - `npm run build`
- Current AI models:
  - Generation: `gemini-2.5-flash`
  - Embeddings: `text-embedding-005`
- Configuration source:
  - `backend-GCP/app/config/settings.py`
- Next planned feature:
  - CI-based RAG evaluation

Completed on 2026-06-05:

- Feature completed:
  - Frontend Streaming Response Support
- Updated homepage assistant to call:
  - `POST /ask-rag-stream`
- Preserved fallback endpoint:
  - `POST /ask-rag`
- Preserved:
  - `session_id`
  - Firestore conversation history
  - source rendering from stream metadata
  - New Chat behavior
- Browser verification with Playwright confirmed:
  - frontend calls `/ask-rag-stream`
  - request payload includes `session_id`
  - streamed text visibly grows while the request is still loading
  - sources render after metadata arrives
  - `portfolioAssistantSessionId` remains in `localStorage`
- Verified frontend status:
  - `npm run lint`
  - `npm run build`
- Next planned feature:
  - CI-based RAG evaluation

Completed on 2026-06-04:

- Deployed latest backend to Cloud Run revision:
  - `gcp-rag-backend-00009-m6h`
- Current RAG source file in GCS:
  - `CAPSTONE_PROJECT_STATE.md`
- Cloud Run ingestion environment now uses:
  - `INGEST_DOCUMENTS=CAPSTONE_PROJECT_STATE.md`
  - `DIRECT_CONTEXT_DOCUMENTS=CAPSTONE_PROJECT_STATE.md`
- Current ingestion security model:
  - `POST /ingest-docs` requires `X-Admin-Token`.
  - Cloud Run receives `INGESTION_ADMIN_TOKEN` from the GitHub Actions secret of the same name.
  - Public assistant routes remain:
    - `POST /ask-rag`
    - `POST /ask-rag-stream`
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

# Capstone Project State

## Current Frontend State - 2026-06-05

Frontend app: `frontend-AWS`

Current implementation notes:

- The default language is Traditional Chinese (`zh-TW`), with English still available through the existing language switch.
- The Portfolio navbar item points to `#portfolio`, scrolls to the Portfolio section, and uses the same active/hover underline styling as About, Skills, and Contact.
- The capstone portfolio card keeps the existing card layout and modal open behavior.
- The project modal uses four documentation-oriented tabs: Overview, Architecture, Challenges, Documentation.
- The normal project modal is a compact centered panel with constrained width and height; content scrolls inside the modal.
- The Project AI workspace remains available through the existing assistant panel and `/ask-rag` behavior is unchanged.
- AWS visitor counter behavior is unchanged.

Recent frontend validation:

- Lint: `npm run lint` passed in `frontend-AWS`.
- Build: `npm run build` passed in `frontend-AWS`.
- Browser screenshot evidence: captured under `frontend-AWS/screenshots/`.
- Default language verification: initial load rendered Traditional Chinese, EN switch worked, and switching back to 繁中 worked.
- Navbar verification: Portfolio link uses `#portfolio`, scrolls correctly, and receives `is-active`.
- Modal verification: desktop modal measured `1280px x 880px` in a `1440px x 1000px` viewport; narrow modal measured `370px x 800px`; Overview, Architecture, Challenges, and Documentation tabs opened successfully.
- Project AI workspace verification: existing assistant panel opened while the capstone modal context was active.
- Production comparison: `https://dvzu3s2gq6iw.cloudfront.net/` returned HTTP 200; no deployment was performed.

## Current Frontend State - 2026-06-06

Frontend app in this checkout: `frontend-AWS`

Current AI assistant status:

- Global AI assistant remains connected to `/ask-rag-stream` first, with `/ask-rag` fallback preserved.
- Cloud Run / Gemini / Firestore request behavior is unchanged.
- New chat still resets the local visible conversation and session state through the refresh control.
- Enter sends the current message; Shift + Enter creates a newline.
- Assistant response status now appears inside each assistant response card header beside the `GCP RAG` label.
- Status text is stored per assistant message, so previous responses remain frozen when a later response is generating.
- Loading states render as:
  - `GCP RAG | Analyzing question 1`
  - `GCP RAG | Retrieving context 2`
  - `GCP RAG | Generating answer 3`
- Completion and failure render as:
  - `GCP RAG | Response generated in Xs`
  - `GCP RAG | Failed after Xs`
- Expanded AI panel now expands chat message content and composer width with the panel.
- User messages remain right-aligned and assistant messages remain left-aligned.
- Sources Used remains available and compact.
- Sources Used now renders each source with a visible source ID label, filename, and heading or chunk fallback, for example `[S1] CAPSTONE_PROJECT_STATE.md / Current Architecture`.

Recent frontend validation:

- Lint: `npm run lint` passed in `frontend-AWS`.
- Build: `npm run build` passed in `frontend-AWS`.
- Local browser evidence used `http://127.0.0.1:5173` via Playwright route fulfillment against the built frontend.
- Local browser automation confirmed Traditional Chinese default, Portfolio navbar active state, Portfolio card modal opening, project modal tabs, mobile modal, AI panel open state, compact chat spacing, in-card response status, success timer, error timer, expanded chat width, Enter-to-send, Shift+Enter newline, refresh/new-chat behavior, and Sources Used dropdown behavior.
- Expanded AI panel measurement: panel `1110px`, assistant card `1104px`, composer `1094px`.
- Screenshot evidence was captured under `frontend-AWS/screenshots/`.
- Backend files, visitor counter code, and deployment workflows were not modified.

## Current Frontend State - 2026-06-10

Frontend app in this checkout: `frontend-AWS`

Current Project Modal status:

- The shared Project Modal shell now keeps consistent dimensions across Overview, Architecture, Challenges, and Documentation.
- Modal sizing is fixed to the viewport-bounded shell instead of growing or shrinking based on tab content length.
- The modal header and tab navigation remain fixed inside the modal.
- Only the tab content panel scrolls.
- Technology, service, and skill badges were removed from the modal header across project modals.
- Internal spacing was tightened around the title/header, tab row, content panel, cards, grids, and architecture diagram area.
- Switching tabs resets the tab content scroll position to the top.
- Project title, close button, language switch, theme toggle, and tab navigation remain available.
- Portfolio card click behavior, global AI assistant, `/ask-rag-stream`, `/ask-rag` fallback, and AWS visitor counter behavior were not modified.

Recent frontend validation:

- Production before check at `https://dvzu3s2gq6iw.cloudfront.net/` confirmed the modal height jump: Overview measured `1280px x 558px`, while Architecture, Challenges, and Documentation measured `1280px x 880px`.
- Local browser verification at `http://127.0.0.1:5173/` confirmed all desktop tabs measured `1280px x 880px`.
- Local mobile browser verification confirmed all tabs measured `370px x 824px`.
- Modal shell remained `overflow: hidden`.
- Tab panel remained `overflow-y: auto`.
- Header and tabs stayed fixed while content scrolled.
- Technology tag count in the modal header was `0`.
- Switching tabs after scrolling reset the panel from `420px` back to `0px`.
- Before screenshots were captured under `frontend-AWS/screenshots/modal-before/`.
- After screenshots were captured under `frontend-AWS/screenshots/modal-after/`.
- Lint: `npm run lint` passed in `frontend-AWS`.
- Build: `npm run build` passed in `frontend-AWS`.

## Current Frontend State - 2026-06-16

Frontend app in this checkout: `frontend-AWS`

Current Project Modal status:

- The Project Modal now uses a documentation portal structure instead of top navigation tabs.
- The modal sidebar groups section anchors under three markdown-style documents: Overview, Architecture, and Implementation.
- Documentation navigation now derives document labels and section labels from markdown frontmatter and top-level headings; the earlier `frontend-AWS/src/content/projectDocsNavigation.js` label map has been removed.
- Documentation content is centralized in standalone markdown files under `frontend-AWS/src/content/projects/`, so React components own rendering and navigation while markdown owns project documentation content.
- Category clicks expand or collapse the sidebar group without navigating content.
- Section clicks load the document if needed and smoothly scroll to the requested section anchor.
- The right-side documentation viewer renders one long markdown-style document at a time, including headings, lists, tables, code blocks, blockquotes, links, and image/diagram figures.
- Project documentation markdown rendering now has Docusaurus/GitBook-style code frames, language labels, lightweight syntax highlighting, theme-aware workflow `text` blocks, and horizontal scrolling for wide code.
- Mermaid diagrams render slightly larger with more spacing and responsive scroll behavior so node labels such as `APIService` and `CloudFront` are less likely to be clipped inside the modal.
- The fixed modal shell and content-only scrolling behavior are preserved.
- The modal header still owns the project title, close button, language switch, and theme toggle.
- Project card behavior, global AI assistant, `/ask-rag-stream`, `/ask-rag` fallback, backend behavior, and AWS visitor counter behavior were not modified.

Recent frontend validation:

- Lint: `npm run lint` passed in `frontend-AWS`.
- Build: `npm run build` passed in `frontend-AWS`.
- Local browser verification at `http://127.0.0.1:5173/` confirmed the old tab roles were removed.
- Desktop browser verification in a `1440px x 1000px` viewport confirmed a two-column layout with a narrower left sidebar and right content viewer.
- Narrow browser verification confirmed the layout stacks the sidebar above the documentation viewer.
- Modal shell remained `overflow: hidden`.
- Documentation viewer remained `overflow-y: auto`.
- Category clicks expanded or collapsed without changing the active document.
- Section navigation loaded `Architecture.md` / `Implementation.md` when needed and scrolled to anchors such as Workflow and Security.

## Current Frontend State - 2026-06-16 Markdown-Driven Documentation Navigation

Frontend app in this checkout: `frontend-AWS`

Current Project Modal documentation status:

- Project documentation navigation is now generated from markdown files instead of `projectDocsNavigation.js`.
- Each project uses language-specific markdown folders:
  - `src/content/projects/<project>/en/{overview,architecture,implementation}.md`
  - `src/content/projects/<project>/zh-TW/{overview,architecture,implementation}.md`
- Markdown frontmatter owns the document group title, for example `title: Overview` or `title: 專案概述`.
- Top-level `#` headings inside each markdown file own the sidebar section labels and viewer section titles.
- Section IDs are generated from document order, such as `overview-1`, `architecture-3`, and `implementation-7`, so English and Traditional Chinese headings can differ without requiring a translation dictionary.
- `projectDocsNavigation.js` was removed because it duplicated the markdown structure.
- The sidebar and viewer now consume parsed `document.title` and `section.title` values from markdown-derived data.
- The content model remains compatible with future Mermaid code blocks, architecture diagrams, workflow diagrams, and RAG ingestion because markdown is the single source of truth.

## Current Frontend State - 2026-06-17 Technical Markdown Rendering

Frontend app in this checkout: `frontend-AWS`

Current markdown renderer status:

- Project documentation supports Docusaurus-style `:::` callouts.
- Supported callout types are `note`, `info`, `tip`, `warning`, `danger`, `success`, `aws`, and `gcp`.
- AWS callouts use `#FF9900`; GCP callouts use `#4285F4`.
- Fenced `mermaid` blocks render as diagrams through a lazy-loaded Mermaid dependency.
- Fenced `text` blocks render as plain workflow blocks.
- Existing blockquotes remain separate from callouts.
- Styling is subtle, documentation-oriented, and compatible with light and dark themes.
- The modal layout, sidebar navigation, and section scrolling behavior remain unchanged.

## Current Frontend State - 2026-06-18 Markdown Readability and Code Blocks

Frontend app in this checkout: `frontend-AWS`

Current markdown renderer status:

- Code fences render as documentation-style frames with language captions and readable monospace spacing.
- Syntax highlighting is available for `js`, `jsx`, `python`, `bash`, `json`, `yaml`, `html`, `css`, and `md`.
- Fenced `text` workflow blocks keep preserved spacing and now use theme-aware colors in light and dark mode.
- Code and workflow blocks scroll horizontally when the content is wider than the modal viewer.
- Mermaid diagrams use larger spacing, stable font sizing, responsive overflow, and scrollable containers to reduce node-label clipping.
- Markdown typography was tuned for denser technical reading with slightly smaller headings/body text, improved line-height, and cleaner paragraph spacing.
- Light-theme code blocks now use softer Docusaurus-style colors, softer syntax token colors, lighter frame borders, and a smaller less-heavy language header.
- Dark-theme code block styling is intentionally preserved through explicit dark-theme overrides.
- No new frontend dependency was added.

Recent frontend validation:

- Lint: `npm run lint` passed in `frontend-AWS`.
- Build: `npm run build` passed in `frontend-AWS`.
- Build still reports the expected large lazy Mermaid/parser chunk warning.

## Current Frontend State - 2026-06-18 Light Theme Code Block Softening

Frontend app in this checkout: `frontend-AWS`

Current markdown code block status:

- Light-mode code blocks are visually softer and less heavy inside the Project Modal documentation viewer.
- Light-mode code frame, header, muted label, body text, and syntax token colors were adjusted in `frontend-AWS/src/App.css`.
- The light-mode inner code area now uses `background: var(--markdown-code-bg)` through `.project-markdown-code`, so it no longer inherits the global `code { background: var(--code-bg) }` rule from `src/index.css`.
- The nested `.project-markdown-code code` element now resets its background, color, padding, and border radius so the code body stays visually consistent with the Project Modal documentation frame.
- The language header is smaller and lighter in light mode.
- Dark-mode code block styling remains unchanged through explicit `:root[data-theme="dark"]` overrides.
- Syntax highlighting remains enabled for normal code blocks.
- Modal layout, sidebar behavior, markdown file structure, callouts, gallery rendering, Mermaid rendering, backend code, and deployment files were not changed.

Recent frontend validation:

- Lint: `npm run lint` passed in `frontend-AWS`.
- No screenshots were run.
- No build was run.

## Current Frontend State - 2026-06-18 Light Theme Code Inner Background Fix

Frontend app in this checkout: `frontend-AWS`

Current markdown code block status:

- The Project Modal code block body now uses the markdown-specific light background instead of inheriting the global inline-code background.
- The responsible global rule was `src/index.css` `code { background: var(--code-bg) }`, which could render a black inner code area in light theme when the system preferred dark colors.
- The fix is scoped to project markdown code blocks in `frontend-AWS/src/App.css`.
- Normal syntax highlighting remains intact.
- Dark mode remains dark through existing `:root[data-theme="dark"]` markdown code variables.
- Modal layout, sidebar behavior, markdown files, Mermaid rendering, gallery rendering, and backend code were not changed.

Recent frontend validation:

- No screenshots were run.
- No build was run.

## Current Frontend State - 2026-06-18 Project Docs Performance Investigation

Frontend app in this checkout: `frontend-AWS`

Status:

- A performance investigation was completed after adding Markdown `columns` support.
- No source-code fix was applied in this pass.
- Current project markdown content does not yet contain ` ```columns ` blocks, so columns layout rendering is not currently the direct slowdown.
- The observed slowdown is more likely caused by existing project documentation scale and render-time work.

Key findings:

- `ProjectModal.jsx` memoizes `getProjectDocuments(selectedProject, language)`, so parsing is not expected to run on every React render.
- `getProjectDocuments` still eagerly parses all three documents for a selected project: `overview`, `architecture`, and `implementation`.
- `MarkdownContent.jsx` renders parsed block trees, but `CodeBlock` still performs syntax tokenization during render through `highlightCode(...)`.
- `MermaidDiagram` mounts all Mermaid blocks in the active document and each instance imports, initializes, and renders Mermaid SVG output.
- The largest current document is `frontend-AWS/src/content/projects/recipe-sharing-app/en/implementation.md`.
- That file has about `2968` lines, `103` fenced blocks, `33` Mermaid diagrams, `26` text workflow blocks, `28` bash blocks, and `471` table rows.
- The Project Modal scroll listener updates active section state, so scrolling can trigger rerenders of the active document.
- Gallery rendering is not currently the likely root cause.

Root cause assessment:

- The columns feature likely made an existing scalability bottleneck more noticeable.
- The bottleneck is the combination of eager full-document parsing, full active-document rendering, many Mermaid diagrams, and render-time code highlighting for large docs.

Future fix candidates:

- Parse only the active document.
- Cache parsed markdown by project, language, and document ID.
- Memoize code highlighting output.
- Lazy-render Mermaid diagrams when near the viewport.
- Consider section-level rendering for very large implementation documents.

Recent validation:

- Investigation only.
- No screenshots were run.
- No build was run.
- No source code was changed for this investigation record.

## Current Frontend State - 2026-06-18 Performance Optimization Phase 1

Frontend app in this checkout: `frontend-AWS`

Current Project Modal documentation loading status:

- Project docs no longer full-parse all three markdown documents on modal open.
- Sidebar navigation still shows all document groups and section links.
- Sidebar labels now come from lightweight document outlines that parse frontmatter and top-level headings only.
- The documentation viewer now full-parses only the active document.
- Opening a modal starts with Overview as the active document, so Architecture and Implementation block parsing are deferred.
- Selecting an Architecture or Implementation section triggers full parsing for that selected document.

Previous loading flow:

```text
Open Project Modal
-> parse Overview
-> parse Architecture
-> parse Implementation
```

New loading flow:

```text
Open Project Modal
-> parse sidebar outlines
-> parse active document only
```

Files changed:

- `frontend-AWS/src/content/projectDocs.js`
- `frontend-AWS/src/components/ProjectModal.jsx`

Preserved behavior:

- Sidebar expand/collapse behavior
- Section navigation
- Language switching
- Markdown rendering
- Mermaid rendering
- Gallery support
- Columns support
- Callouts
- Code blocks
- Modal layout
- Backend and RAG behavior

Estimated performance impact:

- Opening project modals should be faster because inactive documents no longer go through full block parsing.
- The largest benefit is for Recipe Sharing App, where the large implementation document is deferred until selected.

Tradeoffs:

- Sidebar outlines still scan all three docs for headings to preserve navigation.
- Raw markdown import behavior is unchanged in this phase.
- Selecting a large document can still be expensive because Mermaid rendering, code highlighting, and full section rendering remain unchanged.

Recent validation:

- Lint: `npm run lint` passed in `frontend-AWS`.
- No screenshots were run.
- No build was run.

## Current Frontend State - 2026-06-18 Recipe Documentation Split Reverted

Frontend app in this checkout: `frontend-AWS`

Current Recipe Sharing App documentation status:

- The Recipe Sharing App split-document proof of concept was reverted.
- Recipe Sharing App documentation is back to the standard three-document structure:
  - `overview.md`
  - `architecture.md`
  - `implementation.md`
- Former split content from `frontend.md` and `backend.md` now lives inside `implementation.md` under top-level `# Frontend` and `# Backend` sections.
- `frontend.md` and `backend.md` are no longer project documents.
- The sidebar no longer treats Frontend or Backend as top-level documents.

Current Recipe Sharing App sidebar structure:

```text
Overview
Architecture
Implementation
  Frontend
  Backend
  Database
  Network
  Security
  Deployment
  IaC
  CI/CD
  Monitoring
  Troubleshooting
```

Preserved behavior:

- Active-document loading
- Sidebar outlines
- Mermaid rendering
- Gallery blocks
- Callouts
- Images
- Tables
- Code blocks
- Language switching

Recent validation:

- Lint: `npm run lint` passed in `frontend-AWS`.
- Build: `npm run build` passed in `frontend-AWS`.

## Current Frontend State - 2026-06-18 Recipe Implementation Split Proof of Concept

Frontend app in this checkout: `frontend-AWS`

Current Recipe Sharing App documentation status:

- Recipe Sharing App English implementation documentation is now split into smaller active documents.
- The existing Frontend section now lives in `frontend-AWS/src/content/projects/recipe-sharing-app/en/frontend.md`.
- The existing Backend section now lives in `frontend-AWS/src/content/projects/recipe-sharing-app/en/backend.md`.
- The remaining `implementation.md` starts at `# Database` and keeps the infrastructure, deployment, IaC, monitoring, and troubleshooting content.

Navigation status:

```text
Overview
Architecture
Frontend
Backend
Implementation
```

Loading behavior:

- Clicking a Frontend section loads and parses `frontend.md`.
- Clicking a Backend section loads and parses `backend.md`.
- Clicking a remaining Implementation section loads and parses the reduced `implementation.md`.
- Other projects keep the original three-document navigation.
- Recipe Sharing App translations without the split files keep the original three-document navigation.

Preserved behavior:

- Markdown renderer
- Mermaid diagrams
- Gallery blocks
- Columns blocks
- Callouts
- Syntax-highlighted code blocks
- Tables
- Sidebar styling and modal layout
- Backend and RAG behavior

Estimated size impact:

- Previous Recipe Sharing App English `implementation.md`: about `2968` lines.
- New `frontend.md`: `322` lines.
- New `backend.md`: `505` lines.
- New remaining `implementation.md`: `2148` lines.
- The remaining active Implementation document is roughly `28%` smaller.

Proof-of-concept result:

- Document size is confirmed as one important source of selected-document lag.
- The split reduces the work done when users only need Frontend or Backend details.
- The remaining Implementation document can still be heavy because it contains many Mermaid diagrams, tables, and code blocks.

Recent validation:

- Lint: `npm run lint` passed in `frontend-AWS`.
- No screenshots were run.
- No build was run.

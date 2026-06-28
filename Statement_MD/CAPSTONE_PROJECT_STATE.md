# Project State

## Current Identity

This project is a cloud engineering portfolio and serverless RAG assistant platform.

The original target was an AWS Cloud Resume + Lambda/Bedrock RAG architecture. Because the Lambda/Bedrock RAG path was not practical to complete at the current stage, the AI/RAG backend was intentionally pivoted to Google Cloud Platform.

Current working direction:

```text
React + Vite Portfolio
  -> AWS S3 + CloudFront portfolio hosting in new account
  -> AWS serverless visitor counter planned rebuild
  -> GCP Cloud Run RAG backend
  -> Gemini + Firestore + GCS retrieval
```

This means the project currently demonstrates both:

- AWS serverless fundamentals through the documented and previously operational visitor counter path.
- GCP AI/RAG engineering through the working Cloud Run + Gemini + Firestore retrieval backend.

## AWS Account Migration Status

The original AWS account is no longer available. Historical documentation remains valid as evidence that the previous AWS Cloud Resume resources existed and were operational, but AWS infrastructure must not be represented as currently deployed until it is rebuilt in the new AWS account.

Previous AWS state:

- S3
- CloudFront
- Lambda
- API Gateway
- DynamoDB

Current AWS state:

- A new AWS account has been created.
- AWS account name: `cloudlearning`.
- AWS account ID: `001920499658`.
- S3 and CloudFront portfolio hosting have been rebuilt and verified in the new AWS account.
- Lambda, API Gateway, DynamoDB, SNS, EventBridge, SES, IAM roles/policies for later backend modules, and related CI/CD integration remain planned or rebuild-required until implemented and verified.
- Existing GitHub Actions deployment logic can be reused after the new account resources and secrets are configured, but workflow presence alone is not deployment evidence.

## AWS-Only Rebuild Plan - 2026-06-24

Today the execution scope is AWS-only. GCP RAG will continue later and is intentionally outside this AWS rebuild plan.

AWS-side modules only:

| Module                    | Feature               | AWS Services                         | Status  |
| ------------------------- | --------------------- | ------------------------------------ | ------- |
| Portfolio Module          | Portfolio Display     | Amazon S3, Amazon CloudFront         | Current |
| Portfolio Module          | Project Documentation | Amazon S3, Amazon CloudFront         | Current |
| Analytics Module          | Web View Counter      | API Gateway, Lambda, DynamoDB        | Planned |
| Analytics Module          | Project View Counter  | API Gateway, Lambda, DynamoDB        | Planned |
| Event Notification Module | Event Notification    | EventBridge, Lambda, SNS             | Planned |
| Contact Module            | Contact Form          | React Form, API Gateway, Lambda, SES | Planned |

Out of scope for this AWS rebuild plan:

- AI Assistant
- Knowledge Management
- Advanced RAG
- Memory
- RAG Analytics

Those capabilities belong to the GCP RAG system and should not be included in the AWS rebuild scope.

Recommended AWS implementation order:

1. Portfolio Hosting: S3 + CloudFront
2. Web View Counter: API Gateway + Lambda + DynamoDB
3. Project View Counter: API Gateway + Lambda + DynamoDB
4. Contact Form: React Form + API Gateway + Lambda + SES
5. Event Notification: EventBridge + Lambda + SNS

Reasoning:

- Website hosting comes first because it is the frontend foundation.
- Web view counter comes second because it rebuilds the original Cloud Resume Challenge backend.
- Project view counter comes third because it reuses the same API Gateway/Lambda/DynamoDB pattern.
- Contact form comes later because it requires SES plus spam and security handling.
- Event notification comes last because it is more event-driven and architecture-heavy.

Status label rules:

- Current: already working and verified in the current environment.
- Previous / rebuild required: worked in the old AWS account but is not currently redeployed.
- Planned: not implemented yet.

## AWS Rebuild Progress - 2026-06-24

New AWS account:

- Account name: `cloudlearning`
- Account ID: `001920499658`

### Portfolio Module

#### Portfolio Display

Status: Current

AWS services:

- Amazon S3
- Amazon CloudFront

Notes:

- Successfully redeployed in the new AWS account.
- Amazon S3 bucket created.
- Amazon CloudFront distribution created.
- Origin Access Control configured.
- S3 bucket policy configured.
- React SPA routing configured:
  - `403 -> /index.html -> 200`
  - `404 -> /index.html -> 200`
- Frontend build uploaded to S3.
- CloudFront cache invalidated.
- Production website successfully deployed and verified.

#### Project Documentation

Status: Current

AWS services:

- Amazon S3
- Amazon CloudFront

Notes:

- Hosted through the same S3 + CloudFront frontend deployment.
- Project documentation is part of the deployed React SPA and is served through CloudFront.

### Analytics Module

#### Web View Counter

Status: Planned

Target architecture:

```text
DynamoDB -> Lambda -> API Gateway -> React
```

#### Project View Tracking

Status: Hidden analytics event tracking

Target architecture:

```text
DynamoDB -> Lambda -> API Gateway -> React
```

Frontend behavior:

- Website views are displayed publicly as part of the Cloud Resume Challenge visitor counter requirement.
- Project-level views are collected silently as hidden analytics events and stored in DynamoDB for future analytics dashboard development.
- Opening a project modal increments that project's count with `POST /projects/{projectId}/view`.
- Page-lifetime deduplication uses an in-memory React ref-backed `Set` so each project is counted once while the page remains open, then naturally resets after a refresh.
- Project view counts are not displayed on project cards, modal headers, or project detail content.
- The frontend no longer fetches project counts for public display.
- Known limitation: production tracking depends on the project counter API base URL being available through `VITE_PROJECTS_API_BASE_URL` or derivable from the visitor API URL.

### Contact Module

#### Contact Form

Status: Planned

Target architecture:

```text
React Form -> API Gateway -> Lambda -> SES
```

### Event Notification Module

#### Event Notification

Status: Planned

Target architecture:

```text
EventBridge -> Lambda -> SNS
```

### Completed Milestones

- AWS Account Setup
- IAM User Configuration
- Budget Configuration
- AWS CLI Configuration
- S3 Deployment
- CloudFront Deployment
- Frontend Production Verification
- `frontend-AWS/src/api/visitors.js` updated to read `VITE_VISITOR_API_URL`
- Safe visitor counter fallback implemented while the AWS backend rebuild is pending
- Frontend lint passed
- Frontend build passed
- Project view tracking remains active through `frontend-AWS/src/api/projects.js` and `frontend-AWS/src/pages/Home.jsx`, but project view counts are hidden from the public UI.
- Project view tracking verification passed with mocked API responses for modal increment, page-lifetime deduplication, hidden UI display, and website view counter visibility.

### Next Phase

Web View Counter:

```text
DynamoDB -> Lambda -> API Gateway -> React
```

## Confirmed Portfolio Roadmap

1. AWS Cloud Resume Challenge + GCP RAG Capstone
2. Event-Driven Notification System
3. URL Shortener
4. QR Code Generator
5. Real-Time Chat Application
6. Video Streaming Platform

Older supporting projects such as Recipe Sharing App, Jenkins CI/CD, and EC2 Apache Website are historical learning artifacts unless explicitly reintroduced. They should not be presented as the active planned portfolio roadmap.

## Current Stack

### Frontend

- React + Vite
- JavaScript
- Plain CSS
- Modular component/hook/API structure
- Dark/light mode
- Bilingual UI: English and Traditional Chinese
- Floating homepage AI assistant
- Project-aware AI workspace shell with an external collapsible project sidebar
- Stable project documentation portal with a collapsible sidebar and markdown-style content viewer
- Visitor counter UI integration; AWS endpoint must be rebuilt and retested in the new account

### AWS Visitor Counter

- Previous implementation: S3 static hosting, CloudFront CDN + HTTPS, API Gateway, Lambda, and DynamoDB.
- Current implementation status: rebuild required in the new AWS account.
- Rebuild additions: SNS, EventBridge, IAM roles and policies, and deployment integration.

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
frontend-AWS/src/
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

- `frontend-AWS/` is part of the main capstone repository.
- `frontend-AWS/` should not contain its own `.git` directory.
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
- Featured capstone card supports a Draw.io architecture image at `frontend-AWS/public/architecture/aws-gcp-rag-architecture.png` with `object-fit: contain`; it falls back to the existing architecture preview if the image file is absent.
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
- Homepage AI assistant now presents a project-aware workspace as three sibling UI objects: an external project sidebar, an external sidebar toggle, and the standalone chat panel. The sidebar maps the confirmed six-project roadmap: Cloud Resume Challenge + GCP RAG, Event-Driven Notification System, URL Shortener, QR Code Generator, Real-Time Chat Application, and Video Streaming Platform. Each workspace keeps frontend-local chat state and refresh clears only the active project conversation while preserving the existing `/ask-rag-stream` and `/ask-rag` request contracts.
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
- Optional metadata filtering can narrow retrieval by project, document type, file name, heading, section path, source URI, or version ID before scoring.
- Optional multi-query retrieval can expand ambiguous retrieval queries and dedupe candidates before final selection.
- Public `/ask-rag` and `/ask-rag-stream` routes now have a lightweight configurable in-memory rate limiter; admin-only ingestion and analytics routes remain protected by `X-Admin-Token` instead.
- Ingestion now uses deterministic Firestore chunk IDs and prunes stale duplicate chunk documents.
- Contact form is UI-only.
- Original AWS Lambda/Bedrock RAG path is deferred, not the current implementation.

## Current RAG Maturity

Current classification:

```text
Intermediate RAG with several advanced RAG features implemented.
```

This backend is no longer naive RAG. It has moved beyond basic chunk/embed/retrieve/generate because it now includes Cloud Run FastAPI, Vertex AI Gemini 2.5 Flash, `text-embedding-005`, Firestore `document_chunks`, Firestore `conversations`, Markdown-aware token-budget chunking, configurable chunk overlap, content hashing, expanded chunk metadata, metadata filtering, score thresholds, candidate pool retrieval, optional multi-query retrieval, optional hybrid keyword + vector scoring, optional heuristic reranking, optional Gemini semantic reranking over compact chunk previews, optional parent-child retrieval with token-limited parent context expansion, grounded source IDs, runtime citation validation, persistent chat history, optional conversation-aware query rewriting with backend-only Firestore audit messages, streaming responses, public RAG endpoint rate limiting, protected `/ingest-docs`, structured logging, and health checks.

It is not yet fully production-grade Advanced RAG because production still defaults to local retrieval, Firestore Vector Search did not beat the local baseline in the latest live evaluation, and the new semantic reranking and parent-child retrieval layers still require deployment, reingestion, flag enablement, and a live quality evaluation before they should be treated as production improvements.

## Near-Term Next Steps

### Frontend Next Steps

- Keep current modular frontend stable.
- Avoid visual redesign unless it improves clarity.
- Export the final Draw.io architecture diagram to `frontend-AWS/public/architecture/aws-gcp-rag-architecture.png`.
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
19. Phase 1 Immediate RAG hardening: query rewrite and multi-query validation logs, expanded metadata schema and filters, public endpoint rate limiting, and larger evaluation coverage
20. Phase 4 Advanced RAG local implementation: optional Gemini semantic reranking and parent-child retrieval with safe fallbacks

Next:

1. Deploy Phase 4 code with defaults disabled.
2. Reingest approved source documents so new chunks include parent-child metadata.
3. Enable semantic reranking and parent-child retrieval in a controlled environment, then run the 50-question evaluation once for comparison against the 30/50 local baseline.

### Advanced RAG Roadmap — Phase 1 to Phase 5

| Phase   | Focus                        | Improvements                                                                                     | New GCP Services Required?                                                           | Goal                                                                               |
| ------- | ---------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Phase 1 | Retrieval Quality Quick Wins | Query rewriting, chunk overlap, token-aware chunking, citation validation                        | No new GCP service                                                                   | Improve answer relevance and citation reliability without changing architecture    |
| Phase 2 | Better Retrieval Logic       | Multi-query retrieval, metadata filtering, no-answer confidence handling                         | No new GCP service required                                                          | Make retrieval more accurate and safer for ambiguous or weak-context questions     |
| Phase 3 | Evaluation and Observability | RAG evaluation in CI/CD, project analytics, response/error tracking, monitoring dashboard        | Optional: Cloud Logging, Cloud Monitoring, Firestore analytics collection            | Prove quality, detect failures, and show production-readiness                      |
| Phase 4 | Managed Vector Retrieval     | Firestore Vector Search or Vertex AI Vector Search, managed ANN retrieval, scalable vector index | Yes: Firestore Vector Search or Vertex AI Vector Search                              | Replace Firestore full-scan retrieval with production-style vector search          |
| Phase 5 | Advanced RAG Patterns        | GraphRAG, Agentic RAG, specialist retrievers, multi-source orchestration                         | Yes, likely: Vertex AI Vector Search, Agent Engine/ADK, BigQuery/graph-style storage | Move beyond document similarity into relationship-aware and agent-driven retrieval |

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
20. Phase 1 Immediate hardening with expanded metadata, richer filters, public route rate limiting, and 30-case evaluation coverage.
21. Phase 4 Advanced RAG local implementation with semantic reranking and parent-child context expansion.

Dated improvement summary:

1. 2026-06-15 — CI/CD RAG evaluation gate.
2. 2026-06-15 — Runtime citation validation and safe no-answer handling.
3. 2026-06-15 — Token-aware chunking with configurable chunk overlap.
4. 2026-06-15 — Phase 2A metadata filtering.
5. 2026-06-15 — Phase 2B multi-query retrieval.
6. 2026-06-15 — Phase 3A metadata-only RAG analytics records.
7. 2026-06-15 — Phase 3B admin-only RAG analytics summary endpoint.
8. 2026-06-25 — Phase 1 Immediate RAG hardening.
9. 2026-06-25 — Phase 4 Advanced RAG local implementation.

Phase 1 Immediate status on 2026-06-25: query rewriting and multi-query retrieval remain opt-in features, but their backend paths now have clearer metadata-only logs for enabled/disabled and used/not-used behavior. The final answer prompt remains anchored to the original user question while rewritten or expanded queries are used only for retrieval. Firestore system audit messages for query rewriting remain backend-only and filtered out of user/assistant conversation context.

Expanded metadata status on 2026-06-25: new ingestion writes `project`, `doc_type`, `section_path`, `source_uri`, `version_id`, `file_name`, `heading`, `chunk_index`, `content_hash`, `char_count`, and `updated_at` fields for `document_chunks`. Retrieval remains backward compatible with old chunks that do not yet have the new fields.

Metadata filtering status on 2026-06-25: `/ask-rag` and `/ask-rag-stream` can filter by exact `project`, `doc_type`, `file_name`, and `version_id`, plus case-insensitive substring matching for `heading`, `section_path`, and `source_uri`. If filters remove every chunk, the existing safe no-answer behavior is preserved.

Rate limiting status on 2026-06-25: `RAG_RATE_LIMIT_ENABLED`, `RAG_RATE_LIMIT_REQUESTS`, and `RAG_RATE_LIMIT_WINDOW_SECONDS` control a lightweight in-memory limiter for public RAG endpoints. The deployment workflow currently sets `true`, `20`, and `60`. This is a Phase 1 abuse-control measure, not a distributed production quota system.

Evaluation status on 2026-06-25: `backend-GCP/scripts/evaluate_rag.py` now includes 30 golden questions across architecture, retrieval, ingestion, Firestore memory, SSE streaming, citation validation, AWS visitor counter, Cloud Run, Vertex AI, and limitations/no-answer behavior.

Current limitations after Phase 1 Immediate: production retrieval still defaults to local Firestore scanning, Firestore Vector Search is validated but disabled because it scored below the local baseline, semantic reranking and parent-child retrieval are implemented only as opt-in code paths pending deploy/reingestion/live evaluation, and there is no context compression, GraphRAG, or Agentic RAG.

Phase 2 RAG Evaluation Framework status on 2026-06-25: `backend-GCP/evals/golden_questions.json` now contains 50 golden questions across architecture, retrieval, ingestion, metadata, query rewrite, multi-query, citation validation, rate limiting, Firestore memory, SSE streaming, RAG analytics, AWS visitor counter, Cloud Run, Vertex AI, limitations, and no-answer categories. `backend-GCP/scripts/evaluate_rag.py` now loads that dataset, writes Markdown and JSON reports, tracks pass/fail failure categories, measures average and p95 latency, and enforces configurable thresholds for overall pass rate, source match rate, citation grounding rate, and average latency.

Phase 2 CI behavior: `.github/workflows/deploy-backend-gcp.yml` runs the evaluator after Cloud Run deployment with `--soft-fail`, uploads `rag-evaluation-report`, and uploads `rag-evaluation-json`. Soft-fail is intentional until the 50-question dataset and deployed Firestore index are calibrated.

Phase 2 local command:

```bash
cd backend-GCP
python3 scripts/evaluate_rag.py \
  --base-url http://localhost:8080 \
  --questions evals/golden_questions.json \
  --output rag_eval_report.md \
  --json-output rag_eval_report.json \
  --timeout 45
```

Phase 2 test result: backend unit tests passed with 83 tests, and `python3 -m py_compile main.py app/config/settings.py scripts/evaluate_rag.py` passed.

Phase 2.5 Live RAG Evaluation Calibration status on 2026-06-25: the 50-question evaluator was run against `https://gcp-rag-backend-189047029621.asia-east1.run.app` with `--soft-fail`. `GET /healthz` returned HTTP `404`, but `GET /` returned HTTP `200`, so the documented Cloud Run root URL was used.

Phase 2.5 baseline command:

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

Phase 2.5 baseline result: 4 of 50 cases passed. Overall pass rate was `0.08`, source match rate was `1.0`, required terms rate was `0.28`, forbidden terms rate was `0.98`, citation grounding rate was `0.6`, no-answer accuracy was `0.46`, average latency was `3268.07 ms`, and p95 latency was `5823.98 ms`. Thresholds failed for `overall_pass_rate` and `citation_grounding_rate`.

Phase 2.5 calibration decision: no dataset records were removed or weakened, no thresholds were lowered, and CI remains soft-fail. The baseline shows that returned source files generally match, but live chunks do not return `doc_type` metadata and several answers reflect stale indexed documentation. The next action is controlled reingestion of current docs followed by another live evaluation before making CI blocking.

Phase 2.6 KM Source Audit status on 2026-06-25: live investigation confirmed that the 4/50 score was caused by stale deployed knowledge and stale deployment configuration, not by managed-vector retrieval absence. Cloud Run was serving older backend image commit `8c3a43e`, `GOOGLE_CLOUD_PROJECT` was not configured at runtime, ingestion/default context still referenced `PROJECT_STATE.md,Frontend_Development_Log.md`, GCS held a stale 9 KB `CAPSTONE_PROJECT_STATE.md` from 2026-06-03, and Firestore had 24 old chunks with 0% coverage for `project`, `doc_type`, `section_path`, `source_uri`, and `version_id`.

Phase 2.6 actions: current backend source was deployed to Cloud Run, committed `HEAD:Statement_MD/CAPSTONE_PROJECT_STATE.md` was uploaded to GCS, the previous source and Firestore chunks were backed up, one controlled `/ingest-docs` run created 23 chunks and pruned 1 stale chunk, and the temporary admin token was removed. `RAG_RATE_LIMIT_REQUESTS` is now `100` so the 50-question evaluator can complete without tripping the public route limiter.

Phase 2.6 result: Firestore now has 23 chunks from `CAPSTONE_PROJECT_STATE.md`; `project`, `doc_type`, `source_uri`, and `version_id` are present on 23/23 chunks, and `section_path` is present on 18/23 headed chunks. Evaluation improved from 4/50 to 30/50, pass rate improved from `0.08` to `0.60`, citation grounding improved from `0.60` to `0.90`, and no-answer accuracy improved from `0.46` to `0.86`. CI remains soft-fail because the overall pass threshold is still below `0.80`.

Phase 3A Firestore Vector Search Migration status on 2026-06-25: the backend now has a code-gated Firestore Vector Search retrieval backend with local full-scan fallback. The default remains `RAG_VECTOR_SEARCH_BACKEND=local`; `firestore_vector` is available after the Firestore vector index is created and chunks are reingested with Firestore `Vector` embeddings. Analytics records `retrieval_backend` as `local`, `firestore_vector`, or `firestore_vector_fallback`.

Phase 3A validation: `google-cloud-firestore>=2.27.0` was selected for `Vector`, `DistanceMeasure`, and `find_nearest(...)` support. Current live embeddings are 768-dimensional. Index setup and rollback instructions are documented in `backend-GCP/docs/firestore_vector_search.md`. Backend unit tests passed with 91 tests, and the compile check passed. Live vector-search verification is pending index creation and reingestion.

Phase 3B Firestore Vector Search Live Enablement status on 2026-06-25: the Firestore vector index for `document_chunks.embedding` was created and reached `READY` with dimension `768`. Phase 3A code was deployed to Cloud Run, the approved source document was reingested, and all 23 chunk embeddings now deserialize as Firestore `Vector` values. A live smoke test in `firestore_vector` mode returned HTTP 200 with citations, five sources, `vector_distance`, and analytics `retrieval_backend=firestore_vector`.

Phase 3B evaluation result: Firestore vector mode scored 29/50 with pass rate `0.58`, source match `1.00`, citation grounding `0.92`, and no-answer accuracy `0.86`. The local full-scan baseline remains 30/50 with pass rate `0.60`, citation grounding `0.90`, and no-answer accuracy `0.86`. Because vector mode scored one case below baseline, production was reverted to `RAG_VECTOR_SEARCH_BACKEND=local` on revision `gcp-rag-backend-00022-7jr`. Reports are saved under `backend-GCP/evals/reports/`.

Phase 4 Advanced RAG local implementation status on 2026-06-25: `backend-GCP/app/config/settings.py` now exposes disabled-by-default semantic reranking flags (`RAG_SEMANTIC_RERANK_ENABLED`, `RAG_SEMANTIC_RERANK_MODEL`, `RAG_SEMANTIC_RERANK_TOP_N`, `RAG_SEMANTIC_RERANK_KEEP_K`, and `RAG_SEMANTIC_RERANK_FALLBACK_ENABLED`) and parent-child retrieval flags (`RAG_PARENT_CHILD_ENABLED`, `RAG_PARENT_CONTEXT_MAX_TOKENS`, and `RAG_PARENT_CONTEXT_FALLBACK_ENABLED`). `backend-GCP/app/services/rag_service.py` now runs the optional Gemini reranker after candidate retrieval, metadata filtering, and hybrid scoring, using compact chunk previews and ordered candidate IDs only. Source IDs are assigned after reranking, preserving citation IDs in the existing prompt builder. `backend-GCP/app/services/vector_service.py`, `ingestion_service.py`, and `firestore_service.py` now create and store `parent_id`, `child_id`, `parent_heading`, `parent_section_path`, `parent_chunk_summary`, and `parent_context` for newly ingested chunks. Parent context expansion is token limited and falls back to child chunk text for old chunks or failures. Analytics remain metadata-only and record flags/counts, not prompts, question text, retrieved document text, embeddings, or generated answers.

Phase 4 validation: backend unit tests passed with 96 tests, and `python3 -m py_compile main.py app/config/settings.py app/services/rag_service.py app/services/vector_service.py app/services/firestore_service.py app/services/ingestion_service.py` passed. A live evaluation was not run in this local implementation pass because the running production revision does not contain these changes; evaluating it now would re-measure the old `RAG_VECTOR_SEARCH_BACKEND=local` deployment rather than Phase 4.

Phase 4 deployment and functional validation status on 2026-06-25: Phase 4 was deployed to Cloud Run and functionally validated without running the 50-question evaluator. Initial disabled-feature deploy revision was `gcp-rag-backend-00023-r7j`. The approved `CAPSTONE_PROJECT_STATE.md` RAG source was uploaded to GCS and reingested through a temporary protected `/ingest-docs` run; the ingestion response was `chunks_created=66`, `chunks_pruned=0`. Firestore `document_chunks` parent metadata coverage improved from 0/23 to 66/66 for `parent_id`, `child_id`, `parent_heading`, `parent_section_path`, `parent_chunk_summary`, and `parent_context`.

Final Phase 4 production revision: `gcp-rag-backend-00028-hlc`. Runtime config is `RAG_SEMANTIC_RERANK_ENABLED=true`, `RAG_PARENT_CHILD_ENABLED=true`, `RAG_VECTOR_SEARCH_BACKEND=local`, `RAG_SEMANTIC_RERANK_MODEL=gemini-2.5-flash`, `RAG_SEMANTIC_RERANK_TOP_N=10`, `RAG_SEMANTIC_RERANK_KEEP_K=5`, `RAG_PARENT_CONTEXT_MAX_TOKENS=1200`, and fallback flags enabled. The temporary ingestion token was removed after reingestion, so `/ingest-docs` is blocked unless a future temporary token is configured.

Phase 4 smoke validation used five representative sync questions plus one streaming request. Sync responses returned HTTP 200 with five sources each. Source metadata confirmed five semantic-reranked sources and five parent-expanded sources per response. Factual answers cited returned source IDs, while the semantic-reranking question returned the canonical safe no-answer. Streaming returned one metadata event, thirteen token events, and one done event with status `complete`; streaming metadata also showed five semantic-reranked and five parent-expanded sources. Recent Firestore `rag_analytics` records showed `semantic_rerank_applied=true`, `parent_child_enabled=true`, `parent_context_expanded_count=5`, and `retrieval_backend=local`; Firestore conversation memory was also written for the smoke session.

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
- Project documentation markdown rendering now has Docusaurus/GitBook-style code frames, language labels, theme-aware workflow `text` blocks, and horizontal scrolling for wide code.
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

## Current Frontend State - 2026-06-26 Portfolio Project Markdown Docs

Frontend app in this checkout: `frontend-AWS`

Portfolio documentation status:

- Active portfolio project cards are now covered by Markdown documentation folders loaded through `frontend-AWS/src/content/projectDocs.js`.
- New bilingual placeholder documentation exists for:
  - `url-shortener`
  - `qr-code-generator`
  - `real-time-application`
  - `video-streaming-platform`
- The active portfolio ID `real-time-chat` maps to the documentation folder `real-time-application`.
- Older Markdown folders for `ec2-apache-website`, `jenkins-cicd`, and `recipe-sharing-app` were archived outside the repo at `/Users/jarrett6796/Desktop/portfolio-project-docs-archive/`.

Important status note:

- The new project docs are documentation placeholders only. They should not be described as completed implementations until source code, infrastructure, tests, and deployment evidence exist.

Recent validation:

- Frontend build passed with `npm run build`.
- Frontend lint passed with `npm run lint`.
- Local modal render inspection reported no Markdown warning blocks or Markdown/Mermaid console errors for the new project documentation check.

## Current Frontend State - 2026-06-19 AI Workspace Header and Sidebar Fine Tune

Frontend app in this checkout: `frontend-AWS`

AI workspace status:

- The homepage assistant keeps the external workspace structure: project sidebar, sidebar toggle, and standalone chat panel remain sibling UI objects.
- The chat panel header now uses the active project name instead of the generic `AI Assistant` heading.
- Project 1 renders as `AWS Cloud Resume Challenge + GCP RAG`, with the AWS segment styled in `#ff9900` and the GCP segment styled in `#4285F4`.
- `Project-specific AI workspace` now appears directly under the active project title in the header.
- The duplicate active-project card was removed from the chat body.
- Suggested questions were converted from separate buttons into plain text inside the sample response card.
- The external sidebar now uses a subtle fade and slide transition during panel open and sidebar collapse.
- The expand button and outside-click close behavior are preserved at the frontend shell level.

Preserved behavior:

- Project 1, Project 2, and Project 3 local chat state remains project-specific.
- Refresh clears only the active project conversation.
- The frontend still uses the existing `/ask-rag-stream` primary path and `/ask-rag` fallback path without adding a required `project_id`.
- No backend, GCP, Firestore, or RAG retrieval logic changed.

## Current Frontend State - 2026-06-20 AI Composer Advanced Textarea UX

Frontend app in this checkout: `frontend-AWS`

AI composer status:

- The chat composer textarea now auto-grows while the user types multi-line or wrapped prompts.
- Composer height is clamped between a normal 44px starting height and a 180px max height; after the cap, the textarea scrolls internally.
- A custom top-left resize handle replaces reliance on the browser default bottom-right resize control.
- Dragging the top-left handle upward increases composer height; dragging downward reduces composer height.
- Composer height is stored in `localStorage` with key `portfolioAssistantComposerHeight` and restores when the assistant is closed and reopened.
- Composer height remains stable when toggling expanded mode on and off.
- Enter still sends non-empty messages, Shift + Enter still inserts a newline, and the send button behavior is unchanged.
- Project sidebar, sidebar toggle, Project 1 / Project 2 / Project 3 switching, project-specific local chat state, refresh behavior, outside-click close, launcher dragging, launcher snap-to-edge behavior, dynamic sidebar side switching, open-workspace header dragging, and expanded-mode drag disablement are preserved.
- No backend, GCP, Firestore, API contract, streaming fallback, or RAG retrieval logic changed.

Recent frontend validation:

- Lint: `npm run lint` passed in `frontend-AWS`.
- Build: `npm run build` passed in `frontend-AWS`.
- Local Playwright verification used `http://127.0.0.1:5173` with frontend network stubs for `/views`, `/ask-rag-stream`, and `/ask-rag`.
- Browser checks passed for auto-grow, max-height internal scrolling, visible top-left resize handle, upward/downward handle dragging, expand/collapse height preservation, close/reopen height restoration, Enter send, Shift+Enter newline, send button submit, launcher drag/snap, left-side sidebar switching, project button hover expansion, and absence of console errors.

## Current Frontend State - 2026-06-19 AI Workspace Final UX Fine Tune

Frontend app in this checkout: `frontend-AWS`

AI workspace control status:

- The chat composer textarea is vertically resizable with stable min and max heights.
- Enter sends the message and Shift + Enter inserts a newline.
- The previous dock-position menu was removed.
- The assistant workspace can be dragged by the chat header; the project sidebar, sidebar toggle, and chat panel move together as one unit.
- The collapsed Ask AI launcher can be dragged vertically and horizontally, then snaps back to the nearest left or right viewport edge on release.
- The open assistant workspace respects the snapped side: right-side launch keeps the project sidebar and toggle on the left of the chat panel, while left-side launch moves the sidebar and toggle to the right of the chat panel.
- Dragging the open workspace by the header still moves the sidebar, toggle, and chat panel together, then updates the snapped side on release.
- The snapped side and vertical launcher position persist in localStorage for the current browser session and are restored when reopening the assistant.
- Dragging is disabled while the assistant is expanded, and returning to normal mode restores the last dragged position.
- The expand control remains functional and its icon was visually reduced while preserving the clickable button target.

Preserved behavior:

- External project sidebar remains outside the chat panel.
- Project-specific local chat state remains keyed by Project 1, Project 2, and Project 3.
- Refresh clears only the active project conversation.
- Outside-click close still closes the whole assistant workspace.
- Streaming-first `/ask-rag-stream` behavior and `/ask-rag` fallback remain unchanged.
- No backend, GCP, Firestore, or RAG retrieval logic changed.

## Current Frontend State - 2026-06-18 Markdown Hardening Cleanup

Frontend app in this checkout: `frontend-AWS`

Current markdown documentation status:

- Active-document loading remains in place.
- Sidebar outlines still parse top-level document headings separately from the active document body.
- Full markdown block parsing still runs only for the selected document.
- Mermaid render failures still show `[ Mermaid Diagram Failed To Render ]` with the source block.
- Missing standalone images and gallery images still show `Image Not Found`.
- Invalid markdown block warnings still use the `[Markdown Warning]` prefix.

Cleanup completed after reviewing commit `228a8b7`:

- Unclosed fenced blocks no longer discard the rest of the section; the parser skips the broken fence marker and continues.
- Unclosed callouts no longer discard the rest of the section; the parser skips the broken callout opener and continues.
- The custom syntax-highlighting tokenizer was removed to reduce render-time work and maintenance surface.
- The unused `columns` markdown block experiment was removed from parser, renderer, and CSS.
- Per-block React error boundaries were replaced with one section-level boundary around the markdown renderer.
- Missing image warnings now use the accurate message `Image missing`.
- Gallery item keys now include the image index so repeated image paths do not create duplicate React keys.
- The markdown authoring guide now describes code block language labels instead of syntax highlighting.

Recent validation:

- Lint: `npm run lint` passed in `frontend-AWS`.
- Build: `npm run build` passed in `frontend-AWS`.

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

---

AWS Backend Progress Update - 2026-06-26

Today marked the completion of the core AWS serverless backend implementation, frontend integration, and backend repository export. The AWS portion of the capstone has transitioned from a manual cloud implementation to a version-controlled engineering project that is ready for Infrastructure as Code (Terraform) migration.

⸻

AWS Service Status

Module AWS Services Status
Portfolio Hosting Amazon S3, Amazon CloudFront ✅ Current
Website View Counter API Gateway, Lambda, DynamoDB ✅ Current
Project View Counter API Gateway, Lambda, DynamoDB ✅ Current
Contact Form API Gateway, Lambda, SES ✅ Current
Event Notification EventBridge, Lambda, SNS 🚧 Planned
CloudWatch Monitoring CloudWatch Logs, Dashboards, Alarms 🚧 Planned
Infrastructure as Code Terraform 🚧 Planned

⸻

Analytics Module

Website View Counter

Status: Current

Architecture:

React
↓
API Gateway
↓
AWS Lambda
↓
Amazon DynamoDB

Completed:

- API Gateway endpoint deployed and verified.
- Lambda visitor counter successfully implemented.
- DynamoDB visitor counter table verified.
- React frontend integrated through VITE_AWS_VISITOR_API_URL.
- Local development verified.
- Production endpoint verified.
- Browser CORS validation completed.
- Website visitor count successfully displayed from AWS backend.

⸻

Project View Counter

Status: Current

Architecture:

React
↓
API Gateway
↓
AWS Lambda
↓
Amazon DynamoDB

Completed:

- Hidden project analytics implemented.
- GET /projects/{projectId} verified.
- POST /projects/{projectId}/view verified.
- DynamoDB project counters validated.
- One shared Lambda currently handles both website and project view APIs.
- Project view counts intentionally remain hidden from the public UI.
- API endpoints validated with curl.

⸻

Contact Module

Contact Form

Status: Current

Architecture:

React Contact Form
↓
API Gateway
↓
CloudResumeContactHandler
↓
Amazon SQS
↓
CloudResumeEmailHandler
↓
Amazon SES
↓
Recipient Email

Completed:

- React frontend integration completed.
- Contact API helper implemented.
- API Gateway endpoint deployed.
- Contact Lambda deployed.
- Email Lambda deployed.
- Amazon SQS asynchronous email queue implemented.
- Amazon SES email delivery verified.
- End-to-end contact submission validated.
- DynamoDB submission storage verified.
- Contact form validation completed.

⸻

API Gateway CORS

CORS configuration was fully verified.

Allowed Origins:

- http://localhost:5173
- http://localhost:5174
- https://aws-cloudresume-gcprag-jarrett.cc

Allowed Methods:

- POST
- OPTIONS

Allowed Headers:

- content-type

Verification completed using browser testing and curl preflight requests.

⸻

Frontend Integration

Environment variables were standardized.

Current variables:

VITE_GCP_RAG_API_URL
VITE_AWS_VISITOR_API_URL
VITE_AWS_PROJECTS_API_BASE_URL
VITE_AWS_CONTACT_API_URL

Completed:

- Visitor Counter API integrated.
- Project Counter API integrated.
- Contact API integrated.
- AI Assistant endpoint preserved.
- Local environment configuration standardized.

A local regression was discovered where two environment variables were accidentally merged onto one line inside .env, preventing the visitor counter from loading.

The issue was resolved by separating the variables correctly.

⸻

AWS Backend Repository

A dedicated backend repository now exists.

backend-AWS/
├── architecture/
├── apigateway/
├── iam/
├── lambda/
│ ├── contact-handler/
│ ├── email-handler/
│ ├── visitor-counter/
│ └── project-counter/
└── README.md

The repository now contains:

- Exported Lambda source code
- Lambda runtime configuration
- IAM roles
- IAM policies
- API Gateway documentation
- Backend README files
- Architecture documentation

The repository now serves as the source of truth for the manually implemented AWS backend.

⸻

Lambda Export

Exported Lambda functions:

- CloudResumeContactHandler
- CloudResumeEmailHandler
- portfolio-view-counter

Runtime:

Python 3.12

Handler:

lambda_function.lambda_handler

Project view APIs are implemented by the shared portfolio-view-counter Lambda.

⸻

IAM Export

Execution roles and policies were exported.

Exported:

- CloudResumeContactLambdaRole
- CloudResumeEmailHandler Role
- portfolio-view-counter Role

Both managed and inline policies are now documented locally.

⸻

API Gateway Documentation

Verified routes:

GET /views
GET /projects/{projectId}
POST /projects/{projectId}/view
POST /contact

Route documentation and CORS configuration are stored inside:

backend-AWS/apigateway/

⸻

Completed Milestones

Completed today:

- Website View Counter implementation.
- Project View Counter implementation.
- Contact Form implementation.
- API Gateway CORS verification.
- Amazon SES integration.
- Amazon SQS asynchronous email architecture.
- Backend Lambda export.
- IAM export.
- API Gateway documentation.
- Local backend repository created.
- AWS backend prepared for Terraform migration.

⸻

Current AWS Architecture

Browser
│
▼
React + Vite
│
├───────────────► GET /views
│
├───────────────► GET /projects/{id}
│
├───────────────► POST /projects/{id}/view
│
└───────────────► POST /contact
│
▼
API Gateway
│
┌───────────┴───────────┐
▼ ▼
portfolio-view-counter CloudResumeContactHandler
│ │
▼ ▼
Amazon DynamoDB Amazon DynamoDB
│
▼
Amazon SQS
│
▼
CloudResumeEmailHandler
│
▼
Amazon SES
│
▼
Recipient Email

⸻

Next Phase

The manually built AWS implementation is now considered stable.

Upcoming engineering work:

1. Terraform migration.
2. CloudWatch dashboards.
3. CloudWatch alarms.
4. CloudWatch log retention.
5. Event Notification Module.
6. CI/CD refinement.
7. Production monitoring.

The backend-AWS/ directory will serve as the implementation baseline for the Terraform migration.

---

# DevOps, CI/CD, and Terraform Progress Report

**Date:** 2026-06-27  
**Project:** AWS Cloud Portfolio / AWS Cloud Resume Challenge + GCP RAG  
**Repository:** `AWS-Cloud-Portfolio`  
**Production Domain:** `https://aws-cloudresume-gcprag-jarrett.cc`  
**Author:** Jarrett Tang

---

## 1. Overview

This report documents the DevOps, CI/CD, and Terraform work completed for the AWS Cloud Portfolio / AWS Cloud Resume Challenge + GCP RAG project.

The goal of this phase was to safely improve the project’s infrastructure engineering maturity without breaking the live production system. The work focused on:

- Auditing existing deployment workflows.
- Preventing accidental production deployment.
- Introducing Terraform as an import-ready infrastructure layer.
- Reconciling Terraform mappings against live AWS/GCP inventory.
- Adding check-only CI workflows.
- Fixing stale test expectations related to the current production CloudFront domain.
- Verifying that CI checks are passing.

No production infrastructure was modified through Terraform. No Terraform import, plan, apply, or destroy operation was executed.

---

## 2. Production Environment Context

### AWS Frontend

| Resource                   | Value                               |
| -------------------------- | ----------------------------------- |
| S3 bucket                  | `nkc-201-02-cloudresume-frontend`   |
| CloudFront distribution ID | `E2N94TMVG2LDE7`                    |
| CloudFront domain          | `d338amzpyv3o5b.cloudfront.net`     |
| Production custom domain   | `aws-cloudresume-gcprag-jarrett.cc` |
| AWS account ID             | `001920499658`                      |
| AWS region                 | `ap-northeast-1`                    |
| Origin Access Control ID   | `E1IJNX3IJT2ZYV`                    |

### AWS Backend

The AWS backend includes:

- API Gateway
- Lambda
- DynamoDB
- SQS
- SES
- IAM
- Website View Counter
- Project View Counter
- Contact Form

Known backend resources:

| Service     | Resource                           |
| ----------- | ---------------------------------- |
| Lambda      | `CloudResumeContactHandler`        |
| Lambda      | `CloudResumeEmailHandler`          |
| Lambda      | `portfolio-view-counter`           |
| API Gateway | View counter API ID: `ajqu2ciscd`  |
| API Gateway | Contact API ID: `fh0e0v86nk`       |
| DynamoDB    | `Cloud-Resume-Contact-Submissions` |
| DynamoDB    | `portfolio-views`                  |
| SQS         | `CloudResume-Contact-Email-Queue`  |
| SES         | `jarrett6796@gmail.com`            |

### GCP RAG Backend

| Resource           | Value                                                     |
| ------------------ | --------------------------------------------------------- |
| GCP project        | `cloud-resume-ai-rag`                                     |
| Cloud Run service  | `gcp-rag-backend`                                         |
| Cloud Run region   | `asia-east1`                                              |
| Cloud Run URL      | `https://gcp-rag-backend-189047029621.asia-east1.run.app` |
| Vertex AI location | `us-central1`                                             |
| Docs bucket        | `cloud-resume-ai-rag-docs`                                |

Current production CORS origins:

```text
http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174,https://aws-cloudresume-gcprag-jarrett.cc,https://www.aws-cloudresume-gcprag-jarrett.cc,https://d338amzpyv3o5b.cloudfront.net
```

Known stale values that should no longer be used as live configuration:

```text
dvzu3s2gq6iw.cloudfront.net
dify-vertex-ai-499302
```

---

## 3. Work Completed

### 3.1 CI/CD Workflow Audit

Existing GitHub Actions workflows were inspected.

The deployment workflows were confirmed and adjusted to remain manual-only through:

```yaml
workflow_dispatch:
```

This prevents accidental production deployment on normal `push` events.

Existing manual deployment workflows:

| Workflow                 | Purpose                                         | Status      |
| ------------------------ | ----------------------------------------------- | ----------- |
| `deploy-frontend.yml`    | Deploy frontend to S3 and invalidate CloudFront | Manual-only |
| `deploy-backend-gcp.yml` | Deploy GCP backend to Cloud Run                 | Manual-only |

A safety grep confirmed that deployment commands exist only in the manual deployment workflows, not in the new check-only workflows.

---

### 3.2 Terraform Skeleton and Import-Ready Mapping

Terraform was introduced under:

```text
terraform/
  aws/
    frontend/
    backend/
  gcp/
    rag-backend/
```

The Terraform structure was designed for safe migration of already-existing production resources.

Completed Terraform work:

- Added Terraform skeleton.
- Added AWS frontend mappings.
- Added AWS backend mappings.
- Added GCP Cloud Run backend mappings.
- Added variables and outputs.
- Added import notes.
- Added provider lock files.
- Ensured `.terraform/` provider directories are ignored.
- Ensured raw live inventory files are ignored.
- Ran Terraform formatting and validation.

Important safety decision:

```text
Terraform import/apply was intentionally deferred.
```

This avoids Terraform taking ownership of production resources before remote state and ownership boundaries are finalized.

---

### 3.3 Live Inventory Reconciliation

Read-only AWS and GCP inventory was captured locally and used to reconcile Terraform mappings.

The raw inventory files were stored in ignored local folders:

```text
terraform/**/inventory/
```

These files were not committed to Git.

Confirmed AWS frontend values:

| Resource                       | Confirmed Value                                                   |
| ------------------------------ | ----------------------------------------------------------------- |
| S3 region                      | `ap-northeast-1`                                                  |
| S3 versioning                  | Enabled                                                           |
| S3 public access block         | All true                                                          |
| S3 bucket access model         | Private bucket, CloudFront-only access                            |
| CloudFront status              | Deployed                                                          |
| CloudFront alias               | `aws-cloudresume-gcprag-jarrett.cc`                               |
| CloudFront default root object | `index.html`                                                      |
| S3 origin domain               | `nkc-201-02-cloudresume-frontend.s3.ap-northeast-1.amazonaws.com` |
| OAC ID                         | `E1IJNX3IJT2ZYV`                                                  |

Terraform mappings were reconciled using live inventory while avoiding risky assumptions.

---

### 3.4 Terraform Validation

Terraform formatting and validation were completed.

Validation results:

| Module                      | Result |
| --------------------------- | ------ |
| `terraform/aws/frontend`    | Passed |
| `terraform/aws/backend`     | Passed |
| `terraform/gcp/rag-backend` | Passed |

Commands used:

```bash
terraform fmt -recursive terraform
terraform fmt -check -recursive terraform
terraform init -backend=false
terraform validate
```

No Terraform plan, import, apply, or destroy was executed.

---

### 3.5 CI/CD Check-Only Workflows Added

New check-only GitHub Actions workflows were added:

```text
.github/workflows/frontend-check.yml
.github/workflows/backend-aws-check.yml
.github/workflows/backend-gcp-check.yml
.github/workflows/terraform-check.yml
```

These workflows perform validation only. They do not deploy or mutate production infrastructure.

| Workflow          | Purpose                                   | Production Deployment? |
| ----------------- | ----------------------------------------- | ---------------------- |
| Frontend Check    | Builds the React/Vite frontend            | No                     |
| AWS Backend Check | Performs backend static/syntax checks     | No                     |
| GCP Backend Check | Runs Python compile and unit tests        | No                     |
| Terraform Check   | Runs Terraform format, init, and validate | No                     |

The workflows are safe validation workflows and do not require AWS or GCP deployment credentials.

---

### 3.6 CI/CD Validation Results

The following workflows were verified as passing on GitHub Actions:

| Workflow          | Status |
| ----------------- | ------ |
| Frontend Check    | Passed |
| AWS Backend Check | Passed |
| GCP Backend Check | Passed |
| Terraform Check   | Passed |

Final verified GitHub Actions result:

```text
✓ GCP Backend Check
✓ AWS Backend Check
✓ Frontend Check
✓ Terraform Check
```

This confirms that the project now has functioning CI validation for frontend, AWS backend, GCP backend, and Terraform.

---

### 3.7 GCP Backend Test Fix

The first GCP Backend Check failed because one unit test still expected the old CloudFront domain:

```text
https://dvzu3s2gq6iw.cloudfront.net
```

The production CloudFront domain had already changed to:

```text
https://d338amzpyv3o5b.cloudfront.net
```

The test was updated to check the current expected production origins:

```text
https://aws-cloudresume-gcprag-jarrett.cc
https://www.aws-cloudresume-gcprag-jarrett.cc
https://d338amzpyv3o5b.cloudfront.net
```

Local backend tests passed after the fix:

```text
Ran 98 tests
OK
```

The fix was pushed and GitHub Actions passed.

---

## 4. Git Commits Created

### Terraform Inventory Reconciliation

```text
676e29a chore(terraform): reconcile mappings with live inventory
```

Purpose:

- Reconciled Terraform mappings with live AWS/GCP inventory.
- Added ignored inventory handling.
- Updated Terraform reports.
- Verified Terraform formatting and validation.
- Did not run Terraform import, plan, apply, or destroy.

### CI/CD Check Workflows

```text
094579c ci: add check-only validation workflows
```

Purpose:

- Added frontend check workflow.
- Added AWS backend check workflow.
- Added GCP backend check workflow.
- Added Terraform check workflow.
- Confirmed workflows do not deploy production resources.

### GCP Test Update

```text
98d68a9 test(gcp): update CORS origin expectations
```

Purpose:

- Updated stale CORS test expectations from the old CloudFront domain to the current production domain.

### GCP Test Fix

```text
fix(gcp): correct CORS settings test
```

Purpose:

- Fixed indentation/test structure issue in the GCP settings test.
- Verified local unit tests passed.
- Confirmed GCP Backend Check passed on GitHub Actions.

---

## 5. Safety Controls Confirmed

The following safety controls were confirmed:

| Safety Control                                 | Status    |
| ---------------------------------------------- | --------- |
| No Terraform import executed                   | Confirmed |
| No Terraform plan executed                     | Confirmed |
| No Terraform apply executed                    | Confirmed |
| No Terraform destroy executed                  | Confirmed |
| No AWS production deployment run               | Confirmed |
| No GCP production deployment run               | Confirmed |
| No production resources modified by Terraform  | Confirmed |
| `.terraform/` directories ignored              | Confirmed |
| `terraform/**/inventory/` files ignored        | Confirmed |
| Raw inventory JSON files not tracked           | Confirmed |
| Production deploy workflows manual-only        | Confirmed |
| Check workflows contain no deployment commands | Confirmed |

---

## 6. Current Final Status

### CI/CD

```text
CI/CD validation workflows are implemented and passing.
```

The project now validates:

- Frontend build
- AWS backend checks
- GCP backend tests
- Terraform formatting and validation

Production deployment workflows remain manual-only.

### Terraform

```text
Terraform preparation and reconciliation are complete.
```

Terraform has been introduced as an import-ready infrastructure layer and reconciled against live AWS/GCP inventory.

However, Terraform does not yet own production resources because these steps are intentionally deferred:

- `terraform import`
- `terraform plan`
- `terraform apply`
- remote state setup

This is an intentional safety decision.

---

## 7. Honest Portfolio Status Statement

The current status can be described as:

```text
Implemented CI/CD validation workflows for frontend, AWS backend, GCP backend, and Terraform. Production deployment workflows remain manual-only for safety.

Terraform was introduced as an import-ready infrastructure layer and reconciled against live AWS/GCP inventory. Terraform validation passes, while import/apply is intentionally deferred until remote state and production ownership boundaries are finalized.
```

---

## 8. Remaining Work

The following work remains for future phases:

### Terraform Advanced Phase

- Configure remote Terraform state.
- Import existing AWS/GCP resources one module at a time.
- Run Terraform plan after import.
- Reconcile drift.
- Keep Terraform apply manual and protected.

### CI/CD Advanced Phase

- Add protected deployment workflows later if needed.
- Use GitHub Environments for production approvals.
- Add cloud authentication through OIDC instead of static secrets.
- Keep deployment workflows manual until production confidence is higher.

### Monitoring Phase

Recommended next AWS improvement:

- Lambda log retention.
- Lambda error alarms.
- API Gateway 4xx/5xx alarms.
- SQS queue depth and message age alarms.
- DynamoDB throttling alarms.
- CloudWatch dashboard.
- Monitoring documentation.

---

## 9. Conclusion

This phase successfully improved the project’s DevOps maturity while preserving production safety.

The project now has:

- Passing CI validation workflows.
- Manual-only production deployment workflows.
- Terraform import-ready infrastructure mappings.
- Live inventory reconciliation.
- Terraform validation.
- Updated GCP backend tests aligned with current production CORS configuration.

Terraform import/apply and full deployment automation are intentionally deferred to a later, higher-control phase.

---

## 2026-06-27 — Portfolio Card Architecture Preview Image

Updated the AWS Cloud Resume + GCP RAG Portfolio card to use the real architecture overview image instead of the previous placeholder mini-diagram.

Changes:

- Added/updated `previewImage.src` for EN and zh-TW project content.
- Confirmed Vite public asset path: `/projects-images/Architecture-Overview.png`.
- Copied image into `frontend-AWS/public/projects-images/Architecture-Overview.png`.
- Preserved fallback mini-diagram for projects without preview images.
- Confirmed `npm run build` passes.
- Verified image renders in browser and card size remains stable.

No backend, Terraform, CI/CD, AWS, GCP, Lambda, API Gateway, DynamoDB, or environment files were changed.

---

GCP RAG Backend Maintainability Refactor and Test Restructure Update

Update Date

2026-06-27

Summary

The GCP RAG backend completed a maintainability-focused refactor and test restructuring pass. The objective was to reduce large-file risk, improve backend modularity, and prepare the system for future Adaptive RAG, guardrail, retrieval, and streaming improvements without changing production behavior.

This work was intentionally scoped as a safe engineering improvement. No deployment, Terraform command, GitHub Actions run, production mutation, environment variable change, endpoint contract change, SSE format change, retrieval behavior change, Firestore/GCS behavior change, or Vertex AI / Gemini configuration change was performed.

⸻

1. RAG Service Refactor

Objective

The original rag_service.py had grown into a large service file responsible for orchestration, prompt construction, analytics payload shaping, retrieval, ranking, fallback handling, SSE streaming, Firestore writes, and Gemini calls.

The refactor goal was to keep rag_service.py as the main RAG workflow orchestrator while extracting low-risk helper responsibilities into dedicated modules.

Result

File Before After Purpose
backend-GCP/app/services/rag_service.py 1440 lines 1104 lines Main RAG orchestration
backend-GCP/app/services/rag_prompt_builder.py 0 lines 161 lines Prompt and context construction helpers
backend-GCP/app/services/rag_analytics_helpers.py 0 lines 220 lines Analytics payload and source summary helpers

New Service Modules

rag_prompt_builder.py

This module now owns pure prompt-building responsibilities, including prompt/context assembly and reusable prompt helper logic.

The purpose is to separate prompt construction from the main RAG orchestration flow.

rag_analytics_helpers.py

This module now owns analytics payload and summary shaping logic.

The Firestore analytics write remains inside rag_service.py; the new analytics helper only prepares metadata and summary structures. This keeps side-effect behavior unchanged.

⸻

2. Behavior Preservation

The refactor explicitly preserved the following production behaviors:

Area Status
/ask-rag endpoint contract Unchanged
/ask-rag-stream endpoint contract Unchanged
SSE event names and structure Unchanged
Retrieval logic Unchanged
Ranking / reranking logic Unchanged
Fallback behavior Unchanged
Query rewrite behavior Unchanged
Firestore writes Unchanged
GCS ingestion behavior Unchanged
Vertex AI / Gemini calls Unchanged
Environment variable names and defaults Unchanged
CORS behavior Unchanged
Response schema Unchanged

This means the refactor improved maintainability without changing runtime behavior.

⸻

3. Validation Results After Refactor

Validation was run locally from backend-GCP/.

Command Result Notes
python3 -m compileall . Passed Python syntax/import validation passed
python3 -m unittest discover -s tests Passed 104 tests passed
python3 -m pytest Not run pytest is not installed locally
git diff --check -- <task files> Passed Task-scope whitespace check passed

The backend test count increased from 98 to 104 after the helper-focused tests were added.

⸻

4. RAG Test Structure Refactor

Objective

After the service refactor, the next step was to improve the test structure before touching higher-risk RAG internals such as retrieval and SSE streaming.

The original test_rag_service.py had become too large and mixed multiple behavior areas. The goal was to split it by feature area while preserving all assertions and avoiding any production code changes.

Result

backend-GCP/tests/test_rag_service.py was reduced from approximately 1104 lines to 257 lines.

A shared test-only helper file was created to centralize fake service setup and common test fixtures.

New Test Files

File Purpose
backend-GCP/tests/rag_test_helpers.py Shared test-only fakes, fixtures, and helper setup
backend-GCP/tests/test_rag_service_retrieval.py Retrieval, source selection, metadata filters, rerank, parent context, vector fallback
backend-GCP/tests/test_rag_service_streaming.py SSE formatting, metadata events, token events, done events, stream filtering
backend-GCP/tests/test_rag_service_query_rewrite.py Query rewrite parsing, dedupe, enabled/disabled behavior, fallback, history filtering
backend-GCP/tests/test_rag_service_errors.py Error handling, analytics tolerance, model fallback, uncited answer replacement, vector fallback
backend-GCP/tests/test_rag_service.py Core service contracts, source formatting, grounded-answer validation, analytics smoke tests

Test Split Summary

Destination File Test Groups Moved
test_rag_service.py Core service contracts, source formatting, grounded-answer validation, analytics smoke tests
test_rag_service_retrieval.py Metadata filters, retrieval selection, rerank success, parent context, no-context, vector backend
test_rag_service_streaming.py SSE formatting, metadata/token/done events, stream filtering, streamed uncited answer handling
test_rag_service_query_rewrite.py Query parsing/dedupe, rewrite enabled/disabled/standalone/fallback, rewrite history filtering
test_rag_service_errors.py Analytics write tolerance, model/fallback paths, uncited answer replacement, vector fallback

⸻

5. Validation Results After Test Split

Validation was run again after the test split.

Command Result Notes
python3 -m compileall . Passed From backend-GCP/
python3 -m unittest discover -s tests Passed 104 tests, OK
python3 -m pytest Not run pytest is not installed locally
git diff --check -- backend-GCP/tests Passed Test-scope whitespace clean

No production files under backend-GCP/app, frontend-AWS, backend-AWS, terraform, or .github/workflows were changed during the test split.

⸻

6. Current RAG Backend Architecture After Refactor

The backend is now organized more cleanly:

backend-GCP/app/services/
├── rag_service.py
├── rag_prompt_builder.py
└── rag_analytics_helpers.py
backend-GCP/tests/
├── rag_test_helpers.py
├── test_rag_service.py
├── test_rag_service_retrieval.py
├── test_rag_service_streaming.py
├── test_rag_service_query_rewrite.py
├── test_rag_service_errors.py
├── test_rag_prompt_builder.py
└── test_rag_analytics_helpers.py

Responsibility Boundary

Module Responsibility
rag_service.py Main RAG orchestration, retrieval flow, fallback handling, SSE streaming, Firestore side effects, Gemini calls
rag_prompt_builder.py Prompt construction and context formatting helpers
rag_analytics_helpers.py Analytics metadata and summary shaping
rag_test_helpers.py Test-only fake services, fixtures, and common assertions

⸻

7. Remaining Risks

The following areas remain intentionally untouched because they are high-risk production behavior areas:

Area Risk Recommendation
Retrieval pipeline High Refactor only after retrieval tests are reviewed and expanded
SSE streaming High Refactor last because frontend depends on the stream contract
Query rewrite Medium/High Add policy/adaptive routing tests before changing behavior
Firestore write behavior Medium Preserve side-effect behavior unless explicitly redesigned
Adaptive RAG routing Medium Add as metadata-only first before affecting retrieval strategy
Guardrail/policy layer Medium Start with tests and simple classification before enforcing behavior

⸻

8. Recommended Next Step

The next recommended RAG improvement is to design and test a lightweight policy / guardrail layer before introducing Adaptive RAG behavior.

Suggested next sequence:

Step Task
1 Add policy and guardrail test cases
2 Add simple rag_policy.py for input classification
3 Add metadata-only adaptive routing decision output
4 Log policy/adaptive decisions in analytics
5 Later allow adaptive routing to influence retrieval depth
6 Refactor retrieval pipeline only after stronger tests
7 Refactor SSE streaming last

This creates a clean maturity path:

Maintainable RAG backend
→ Feature-isolated test suite
→ Policy-aware RAG
→ Adaptive RAG routing
→ Safer retrieval refactor
→ Safer streaming refactor

⸻

9. Engineering Status

Current status:

Capability Status
RAG backend working Completed
Prompt helper extraction Completed
Analytics helper extraction Completed
Test split by feature Completed
Backend validation Passed
Production behavior preserved Yes
Adaptive RAG Planned
Policy / guardrails Planned
Retrieval pipeline extraction Future
SSE streaming extraction Future

The GCP RAG backend is now better prepared for advanced RAG features because its service boundaries and test structure are more maintainable.

---

# GCP RAG Backend Maintainability Refactor and Feature-Isolated Test Restructure Report

## Update Date

2026-06-27

## Summary

The GCP RAG backend completed a maintainability-focused refactor and test restructuring pass. The work was designed to improve code organization, reduce large-file risk, and prepare the RAG backend for future improvements such as policy / guardrail enforcement, Adaptive RAG routing, retrieval pipeline extraction, and SSE streaming refactor.

This update was intentionally scoped as a safe engineering improvement. The main production behavior of the RAG system was preserved. No deployment, Terraform command, GitHub Actions run, cloud resource mutation, environment variable change, endpoint contract change, retrieval behavior change, SSE event format change, Firestore/GCS behavior change, or Vertex AI / Gemini configuration change was performed.

The result is a cleaner backend service structure and a more maintainable test suite that can validate individual RAG behavior areas independently.

---

## 1. Background

The GCP RAG backend had reached a point where both the main service file and the main test file were becoming too large.

Before this work:

```text
backend-GCP/app/services/rag_service.py
```

handled many responsibilities in one file, including:

- Main RAG orchestration
- Prompt construction
- Retrieval flow
- Ranking / reranking behavior
- Parent-child context handling
- Query rewrite behavior
- Fallback behavior
- SSE streaming
- Firestore analytics writes
- Source formatting
- Gemini / Vertex AI calls
- Response formatting

The main test file also contained many unrelated behavior areas in one place:

```text
backend-GCP/tests/test_rag_service.py
```

This made future refactoring risky because retrieval, streaming, query rewriting, error handling, analytics behavior, and core service contracts were all mixed together.

The engineering goal was to improve maintainability without changing runtime behavior.

---

## 2. RAG Service Refactor

### Objective

The objective was to reduce the responsibility scope of `rag_service.py` while keeping it as the main RAG workflow orchestrator.

The refactor followed a conservative approach:

```text
Do not rewrite the RAG backend.
Do not change production behavior.
Only extract low-risk helper logic.
Keep high-risk runtime paths in rag_service.py.
```

### Result

| File                                                |     Before |      After | Responsibility                               |
| --------------------------------------------------- | ---------: | ---------: | -------------------------------------------- |
| `backend-GCP/app/services/rag_service.py`           | 1440 lines | 1104 lines | Main RAG workflow orchestration              |
| `backend-GCP/app/services/rag_prompt_builder.py`    |    0 lines |  161 lines | Prompt and context construction helpers      |
| `backend-GCP/app/services/rag_analytics_helpers.py` |    0 lines |  220 lines | Analytics payload and source summary helpers |

### Explanation

The refactor moved low-risk pure helper logic out of `rag_service.py`.

The extracted logic was limited to:

1. Prompt construction
2. Context formatting
3. Analytics payload shaping
4. Source summary preparation

The following runtime-sensitive areas were intentionally left inside `rag_service.py`:

- Retrieval flow
- Ranking / reranking
- Parent-child retrieval behavior
- Fallback behavior
- Query rewrite orchestration
- SSE streaming
- Firestore write side effects
- Gemini / Vertex AI calls
- Endpoint response handling

This means `rag_service.py` is now smaller, but it still owns the high-risk orchestration behavior.

---

## 3. New Service Modules

### `rag_prompt_builder.py`

This module contains prompt and context construction helpers.

Purpose:

```text
Separate prompt construction from the main RAG orchestration flow.
```

Examples of responsibilities:

- Build RAG prompt sections
- Format context blocks
- Prepare prompt instructions
- Handle prompt-related helper logic

This improves readability because prompt-building logic no longer needs to live directly inside the main service orchestration file.

### `rag_analytics_helpers.py`

This module contains analytics payload and source summary helpers.

Purpose:

```text
Separate analytics payload shaping from the main RAG orchestration flow.
```

Examples of responsibilities:

- Build analytics metadata structures
- Format source summaries
- Normalize analytics payload values
- Prepare metadata for logging or evaluation

Important boundary:

```text
The Firestore analytics write remains in rag_service.py.
rag_analytics_helpers.py only prepares payloads and summaries.
```

This preserves production side-effect behavior while improving maintainability.

---

## 4. Production Behavior Preserved

The refactor did not change the production behavior of the RAG backend.

| Area                                    | Status    |
| --------------------------------------- | --------- |
| `/ask-rag` endpoint contract            | Unchanged |
| `/ask-rag-stream` endpoint contract     | Unchanged |
| SSE event names and structure           | Unchanged |
| Retrieval logic                         | Unchanged |
| Ranking / reranking logic               | Unchanged |
| Parent-child retrieval behavior         | Unchanged |
| Fallback behavior                       | Unchanged |
| Query rewrite behavior                  | Unchanged |
| Firestore writes                        | Unchanged |
| GCS ingestion behavior                  | Unchanged |
| Vertex AI / Gemini calls                | Unchanged |
| CORS behavior                           | Unchanged |
| Environment variable names and defaults | Unchanged |
| Response schema                         | Unchanged |

This confirms that the refactor was a maintainability improvement, not a runtime behavior change.

---

## 5. Validation After Service Refactor

Validation was completed locally from `backend-GCP/`.

| Command                                 | Result  | Notes                                      |
| --------------------------------------- | ------- | ------------------------------------------ |
| `python3 -m compileall .`               | Passed  | Python syntax and import validation passed |
| `python3 -m unittest discover -s tests` | Passed  | 104 tests, `OK`                            |
| `python3 -m pytest`                     | Not run | `pytest` is not installed locally          |
| `git diff --check -- <task files>`      | Passed  | Task-scope whitespace check passed         |

The backend test suite passed after the refactor, confirming that the helper extraction did not break the existing RAG behavior.

---

## 6. Feature-Isolated Test Restructure

### Objective

After the service refactor, the next step was to improve the RAG test structure.

The original test file:

```text
backend-GCP/tests/test_rag_service.py
```

contained multiple behavior areas in one large file. This made it harder to target specific behavior during future refactors.

The goal was to split the RAG service tests by feature area so that retrieval, streaming, query rewrite, and error/fallback behavior could be tested independently.

### Result

The original `test_rag_service.py` was reduced from approximately 1104 lines to 257 lines.

A shared test-only helper file was added:

```text
backend-GCP/tests/rag_test_helpers.py
```

New feature-focused test files were created:

```text
backend-GCP/tests/test_rag_service_retrieval.py
backend-GCP/tests/test_rag_service_streaming.py
backend-GCP/tests/test_rag_service_query_rewrite.py
backend-GCP/tests/test_rag_service_errors.py
```

No production code was changed during the test split.

---

## 7. Current Test File Structure

The RAG backend test structure is now:

```text
backend-GCP/tests/
├── rag_test_helpers.py
├── test_rag_service.py
├── test_rag_service_retrieval.py
├── test_rag_service_streaming.py
├── test_rag_service_query_rewrite.py
├── test_rag_service_errors.py
├── test_rag_prompt_builder.py
└── test_rag_analytics_helpers.py
```

### Test File Responsibilities

| Test File                           | Responsibility                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `test_rag_service.py`               | Core service contracts, source formatting, grounded-answer validation, analytics smoke tests                       |
| `test_rag_service_retrieval.py`     | Metadata filters, retrieval selection, rerank success, parent context, no-context behavior, vector backend         |
| `test_rag_service_streaming.py`     | SSE formatting, metadata events, token events, done events, stream filtering, streamed uncited answer handling     |
| `test_rag_service_query_rewrite.py` | Query parsing, dedupe behavior, rewrite enabled/disabled behavior, standalone rewrite, fallback, history filtering |
| `test_rag_service_errors.py`        | Analytics write tolerance, model fallback paths, uncited answer replacement, vector fallback                       |
| `test_rag_prompt_builder.py`        | Prompt helper behavior                                                                                             |
| `test_rag_analytics_helpers.py`     | Analytics helper behavior                                                                                          |
| `rag_test_helpers.py`               | Shared test-only fakes, fixtures, and setup helpers                                                                |

---

## 8. What Feature-Isolated Tests Mean

Feature-isolated tests mean that each important RAG behavior area can now be tested separately.

Before the split, testing RAG behavior mainly meant running the entire test suite or the large `test_rag_service.py` file.

After the split, specific behavior areas can be tested directly.

For example:

| Behavior Area             | Targeted Test Command                                                          |
| ------------------------- | ------------------------------------------------------------------------------ |
| Core RAG service          | `python3 -m unittest discover -s tests -p "test_rag_service.py"`               |
| Retrieval behavior        | `python3 -m unittest discover -s tests -p "test_rag_service_retrieval.py"`     |
| Streaming behavior        | `python3 -m unittest discover -s tests -p "test_rag_service_streaming.py"`     |
| Query rewrite behavior    | `python3 -m unittest discover -s tests -p "test_rag_service_query_rewrite.py"` |
| Error/fallback behavior   | `python3 -m unittest discover -s tests -p "test_rag_service_errors.py"`        |
| Prompt builder behavior   | `python3 -m unittest discover -s tests -p "test_rag_prompt_builder.py"`        |
| Analytics helper behavior | `python3 -m unittest discover -s tests -p "test_rag_analytics_helpers.py"`     |
| Full backend suite        | `python3 -m unittest discover -s tests`                                        |

This gives the backend a stronger safety harness before future production refactors.

---

## 9. Feature-Isolated Test Validation

The feature-isolated tests were manually validated.

### Individual Test Group Results

| Test Group             | Command                                                                        | Result            |
| ---------------------- | ------------------------------------------------------------------------------ | ----------------- |
| Compile check          | `python3 -m compileall .`                                                      | Passed            |
| Core RAG service tests | `python3 -m unittest discover -s tests -p "test_rag_service.py"`               | Passed, 14 tests  |
| Retrieval tests        | `python3 -m unittest discover -s tests -p "test_rag_service_retrieval.py"`     | Passed, 14 tests  |
| Streaming tests        | `python3 -m unittest discover -s tests -p "test_rag_service_streaming.py"`     | Passed, 4 tests   |
| Query rewrite tests    | `python3 -m unittest discover -s tests -p "test_rag_service_query_rewrite.py"` | Passed, 7 tests   |
| Error/fallback tests   | `python3 -m unittest discover -s tests -p "test_rag_service_errors.py"`        | Passed, 5 tests   |
| Prompt builder tests   | `python3 -m unittest discover -s tests -p "test_rag_prompt_builder.py"`        | Passed, 4 tests   |
| Analytics helper tests | `python3 -m unittest discover -s tests -p "test_rag_analytics_helpers.py"`     | Passed, 2 tests   |
| Full backend suite     | `python3 -m unittest discover -s tests`                                        | Passed, 104 tests |

The full backend suite passed with 104 tests.

---

## 10. Targeted Test Command Note

During manual validation, the direct module style command failed for split tests that import `rag_test_helpers.py`.

The failing style was:

```bash
python3 -m unittest tests.test_rag_service_errors
```

This failed because the split test files use:

```python
from rag_test_helpers import BaseRagServiceTest
```

The direct module invocation treats `tests` as a package module and does not add the `tests/` directory to the import path in the same way as discovery mode.

The correct targeted command style is:

```bash
python3 -m unittest discover -s tests -p "test_rag_service_errors.py"
```

The full suite also works correctly:

```bash
python3 -m unittest discover -s tests
```

This is now the recommended pattern for feature-specific RAG test execution.

---

## 11. What Each Test Group Protects

### Core RAG Service Tests

These tests protect the main RAG service contract.

They check core behavior such as:

- Service response shape
- Source formatting
- Grounded-answer validation
- Basic analytics smoke behavior
- Main RAG orchestration contracts

### Retrieval Tests

These tests protect retrieval behavior.

They check areas such as:

- Metadata filtering
- Retrieval candidate selection
- Source metadata handling
- Reranking success paths
- Parent context behavior
- No-context behavior
- Vector/local backend behavior

This test group is important before changing retrieval logic.

### Streaming Tests

These tests protect the `/ask-rag-stream` behavior.

They check areas such as:

- SSE formatting
- Metadata events
- Token events
- Done events
- Stream filtering
- Streamed uncited answer handling

This test group is important because the frontend AI assistant depends on the SSE event contract.

### Query Rewrite Tests

These tests protect query rewrite behavior.

They check areas such as:

- Query parsing
- Duplicate candidate handling
- Rewrite enabled/disabled behavior
- Standalone query generation
- Rewrite fallback behavior
- Conversation history filtering

This test group is important for multi-turn RAG quality.

### Error and Fallback Tests

These tests protect system reliability.

They check areas such as:

- Analytics write tolerance
- Model fallback paths
- Retrieval fallback paths
- Uncited answer replacement
- Vector fallback behavior

This test group helps ensure the backend fails safely instead of crashing or returning unsupported responses.

### Prompt Builder Tests

These tests protect the extracted prompt-building helper module.

They check that prompt helper logic continues to produce required prompt sections and context formatting.

### Analytics Helper Tests

These tests protect the extracted analytics helper module.

They check that analytics metadata and source summaries are shaped correctly and safely.

---

## 12. Why This Matters

The RAG backend now has two important maintainability improvements:

1. The production service file is smaller and better organized.
2. The test suite is split by behavior area.

This reduces risk for future work.

Before this update, a future retrieval or streaming refactor would be harder to validate because the tests were mixed together.

After this update, a future retrieval refactor can first run:

```bash
python3 -m unittest discover -s tests -p "test_rag_service_retrieval.py"
```

A future streaming refactor can first run:

```bash
python3 -m unittest discover -s tests -p "test_rag_service_streaming.py"
```

Then the full suite can be run:

```bash
python3 -m unittest discover -s tests
```

This creates a safer workflow:

```text
Targeted feature test
→ Full backend test suite
→ Manual smoke test if needed
→ Deployment only after separate approval
```

---

## 13. Current Backend State

### Service Structure

```text
backend-GCP/app/services/
├── rag_service.py
├── rag_prompt_builder.py
└── rag_analytics_helpers.py
```

### Test Structure

```text
backend-GCP/tests/
├── rag_test_helpers.py
├── test_rag_service.py
├── test_rag_service_retrieval.py
├── test_rag_service_streaming.py
├── test_rag_service_query_rewrite.py
├── test_rag_service_errors.py
├── test_rag_prompt_builder.py
└── test_rag_analytics_helpers.py
```

### Current Validation Status

| Area                            | Status            |
| ------------------------------- | ----------------- |
| Python compile check            | Passed            |
| Core RAG service tests          | Passed            |
| Retrieval tests                 | Passed            |
| Streaming tests                 | Passed            |
| Query rewrite tests             | Passed            |
| Error/fallback tests            | Passed            |
| Prompt builder tests            | Passed            |
| Analytics helper tests          | Passed            |
| Full backend test suite         | Passed, 104 tests |
| Production behavior changed     | No                |
| Production deployment performed | No                |

---

## 14. Remaining Risks

The following high-risk areas remain intentionally untouched:

| Area                     | Risk        | Recommendation                                                    |
| ------------------------ | ----------- | ----------------------------------------------------------------- |
| Retrieval pipeline       | High        | Refactor only after reviewing and expanding retrieval tests       |
| SSE streaming            | High        | Refactor last because the frontend depends on the stream contract |
| Query rewrite behavior   | Medium/High | Add policy/adaptive routing tests before changing behavior        |
| Firestore write behavior | Medium      | Preserve side effects unless explicitly redesigned                |
| Adaptive RAG routing     | Medium      | Introduce as metadata-only first                                  |
| Policy / guardrails      | Medium      | Start with tests and simple classification before enforcement     |

---

## 15. Recommended Next Step

The next recommended RAG improvement is policy / guardrail test design before introducing Adaptive RAG behavior.

Recommended sequence:

```text
1. Add policy and guardrail test cases.
2. Add a simple input policy classification module.
3. Add metadata-only adaptive routing decision output.
4. Log policy/adaptive decisions in analytics.
5. Later allow adaptive routing to influence retrieval depth.
6. Refactor retrieval only after stronger retrieval test coverage.
7. Refactor SSE streaming last.
```

This gives the RAG backend a controlled maturity path:

```text
Maintainability refactor
→ Feature-isolated test suite
→ Policy-aware RAG
→ Adaptive RAG routing
→ Safer retrieval extraction
→ Safer streaming extraction
```

---

## 16. Final Status

The GCP RAG backend is now in a stronger engineering state.

Completed:

- `rag_service.py` maintainability refactor
- Prompt helper extraction
- Analytics helper extraction
- Feature-isolated RAG test split
- Targeted feature test validation
- Full backend test validation with 104 passing tests

Not changed:

- Retrieval behavior
- SSE stream contract
- Query rewrite behavior
- Firestore/GCS side effects
- Gemini / Vertex AI configuration
- Endpoint response schemas
- Environment defaults

The backend is now better prepared for future Adaptive RAG and policy / guardrail development.

---

2026-06-28 — Phase 5 Adaptive RAG / Policy Router completed locally.

Completed:

- Policy guardrails for prompt injection and secret/credential requests.
- Adaptive routing for direct, clarify, standard RAG, and strict-source RAG.
- Non-streaming and streaming integration.
- QA script for /ask-rag and /ask-rag-stream.
- Fixed punctuation normalization bug where "Tell me more." and "Hi." incorrectly entered RAG.

Validation:

- compileall passed
- policy/router tests passed
- non-streaming integration tests passed
- streaming integration tests passed
- QA runner tests passed
- full backend test suite passed: 153 tests
- live local QA passed: PASS=13 WARNING=3 FAIL=0

Status:

- Completed locally.
- Not deployed to Cloud Run yet.

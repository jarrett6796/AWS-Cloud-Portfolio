# Source Code Inspection Report

Date: 2026-06-25

Scope: read-only inspection of the current repository at `/Users/jarrett6796/Desktop/NKC-02-Capstone Projects`.

Important context: the worktree was already dirty before this inspection. This report evaluates the files currently present on disk. It does not treat committed state as the only source of truth.

## 1. Executive Summary

This repository is a multi-cloud portfolio capstone with three real implementation centers:

- `frontend-AWS/`: React/Vite portfolio, project documentation modal, visitor/project view clients, and AI chat workspace.
- `backend-GCP/`: FastAPI Cloud Run backend for chat, document ingestion, Firestore-backed RAG retrieval, streaming SSE, analytics, and tests.
- `.github/workflows/`: deployment automation for the AWS-hosted frontend and GCP Cloud Run backend.

There is no deployable AWS Lambda source code, no Terraform implementation, and no `backend/` directory separate from `backend-GCP/`. AWS backend features are represented by frontend API clients, documentation, workflows, and planned architecture, not by Lambda/IaC code in this repository.

Architecture maturity is above average for a portfolio project. The frontend has a clear modular structure, and the backend is service-oriented with routes, schemas, config, provider wrappers, structured errors, logging, tests, and RAG evaluation tooling. The main weakness is that several modules have grown large: `frontend-AWS/src/App.css`, `frontend-AWS/src/components/ChatPanel.jsx`, `frontend-AWS/src/content/projectDocs.js`, and `backend-GCP/app/services/rag_service.py` are all doing enough work that future changes will become harder without further decomposition.

Production readiness is partial. The project can build and deploy through GitHub Actions, and the backend has meaningful automated tests. However, frontend tests are mostly screenshot scripts rather than CI-gated test coverage, AWS backend code is missing, Terraform is planning-only, rate limiting is in-memory, the frontend has hard-coded fallback Cloud Run configuration, and the deployment workflow does not currently inject all frontend API environment variables used by the source code.

## 2. Repository Map

```text
repo-root/
|-- .github/
|   `-- workflows/
|       |-- deploy-frontend.yml
|       `-- deploy-backend-gcp.yml
|-- backend-GCP/
|   |-- app/
|   |   |-- config/
|   |   |-- routes/
|   |   |-- schemas/
|   |   `-- services/
|   |-- docs/
|   |-- evals/
|   |-- scripts/
|   |-- tests/
|   |-- Dockerfile
|   |-- main.py
|   `-- requirements.txt
|-- frontend-AWS/
|   |-- public/
|   |-- screenshots/
|   |-- scripts/
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- content/
|   |   |-- hooks/
|   |   |-- pages/
|   |   `-- utils/
|   |-- package.json
|   |-- vite.config.js
|   `-- eslint.config.js
|-- Statement_MD/
|-- tools/
|-- PROJECT_DOCUMENTATION_AUDIT.md
|-- FRONTEND_ENGINEERING_REPORT.md
|-- BACKEND_ENGINEERING_REPORT.md
|-- TECHNICAL_MASTER_DOCUMENT.md
|-- TERRAFORM_ADOPTION_PLANNING_REPORT.md
|-- CAPSTONE_RAG_DRAWIO_SPECIFICATIONS.drawio
`-- AWS_GCP_RAG_Portfolio_Presentation.pptx
```

Top-level folder roles:

| Path | Role | Notes |
|------|------|-------|
| `.github/workflows/` | CI/CD | Deploys frontend to AWS S3/CloudFront and backend to GCP Cloud Run. |
| `backend-GCP/` | Backend | Active FastAPI RAG backend. This is the real backend directory. |
| `frontend-AWS/` | Frontend | Active React/Vite portfolio app. |
| `Statement_MD/` | Documentation | Gitignored project state/log documents. Important for project knowledge and RAG sources. |
| `tools/` | Utility | Contains document generation tooling. |
| `outputs/` | Generated artifacts | Excluded from source inspection except as deliverable evidence. |

Absent requested folders:

| Requested path | Finding |
|----------------|---------|
| `backend/` | Not present. Active backend is `backend-GCP/`. |
| `lambda/` | Not present. No Lambda function source in repo. |
| `terraform/` | Not present. Terraform exists only as planning documentation. |
| `docs/` at repo root | Not present. Docs are spread across root markdown, `Statement_MD/`, `backend-GCP/docs/`, and frontend content. |

## 3. Frontend Inspection

### `frontend-AWS/src/main.jsx`

Purpose: React entry point.

Responsibilities: mounts `<App />` into `#root` under React `StrictMode`.

Dependencies: `react`, `react-dom/client`, `./index.css`, `./App.jsx`.

How it works: creates a root on `document.getElementById("root")` and renders the application.

Problems: formatting style differs from most other source files because it uses no semicolons and single quotes. Functionally fine.

Recommendation: keep. Let formatter/lint enforce style if desired.

### `frontend-AWS/src/App.jsx`

Purpose: top-level application wrapper.

Responsibilities: imports global app CSS and renders `Home`.

Dependencies: `./pages/Home`, `./App.css`.

How it works: intentionally thin. All page orchestration is delegated to `Home.jsx`.

Problems: none.

Recommendation: keep thin.

### `frontend-AWS/src/pages/Home.jsx`

Purpose: main portfolio page and application orchestrator.

Responsibilities: owns page sections, language state, theme state, visitor count, selected project modal state, project-view tracking, and chat workspace state.

Dependencies: `ChatPanel`, `Navbar`, `PortfolioCaseStudies`, `PortfolioSection`, `ProjectModal`, `contentByLanguage`, `useAssistantChat`, `useScrollTracker`, `useTheme`, `fetchVisitorCount`, `incrementProjectView`.

How it works: renders hero/about/skills/portfolio/contact sections, opens `ProjectModal` when a project card is selected, fetches visitor count on mount, increments project view once per page lifetime, and passes chat state into `ChatPanel`.

External services: calls the AWS visitor counter through `fetchVisitorCount`; calls project view API through `incrementProjectView`; chat ultimately calls GCP Cloud Run through `useAssistantChat`.

Problems:

- The contact form prevents default submit but has no backend behavior. It is UI-only.
- `PROJECT_WORKSPACES` includes future projects that are not fully implemented in source code.
- `Home.jsx` does broad orchestration and could become crowded if more sections/features are added.

Recommendation: keep current behavior, but extract contact form and workspace metadata when implementing real contact/API features.

### `frontend-AWS/src/content/portfolioContent.js`

Purpose: bilingual static content and project metadata.

Responsibilities: stores English and Traditional Chinese labels, hero/about/skills/contact text, project card metadata, modal data, chat prompts, and service lists.

Dependencies: consumed by `Home.jsx`, `Navbar`, `PortfolioCaseStudies`, `ProjectModal`, and `ChatPanel`.

How it works: exports `contentByLanguage`, where `Home.jsx` selects `contentByLanguage[language]`.

External services: none directly.

Problems:

- Large file at 817 lines.
- Mixes display labels, project roadmap, modal narrative, and chat prompts.
- Some project entries are roadmap/planned concepts rather than implemented code.

Recommendation: split into `siteContent`, `projectContent`, and `chatContent` if more projects are added.

### `frontend-AWS/src/api/chat.js`

Purpose: frontend API client for GCP RAG.

Responsibilities: send sync `/ask-rag` requests, send streaming `/ask-rag-stream` requests, parse SSE events, and provide fallback compatibility for `useAssistantChat`.

Dependencies: browser `fetch`, `ReadableStream`, `TextDecoder`, `import.meta.env.VITE_GCP_RAG_API_URL`.

How it works: resolves base URL from `VITE_GCP_RAG_API_URL` or a hard-coded Cloud Run fallback, POSTs question/session/history JSON, parses SSE frames split by blank lines, and calls an event callback.

External services: GCP Cloud Run FastAPI backend.

Problems:

- Hard-coded Cloud Run fallback couples built frontend artifacts to a specific backend.
- SSE parser assumes valid JSON data lines; malformed events throw into the caller.
- No request timeout or abort support.

Recommendation: remove hard-coded production fallback before a release, document env requirements, and add abort/timeout support.

### `frontend-AWS/src/api/visitors.js`

Purpose: frontend API client for public website view count.

Responsibilities: fetch visitor count from `VITE_AWS_VISITOR_API_URL` and fail closed to `0`.

Dependencies: `import.meta.env.VITE_AWS_VISITOR_API_URL`, browser `fetch`.

How it works: returns `0` when env var is missing, response is non-OK, fetch throws, or response does not include `views`.

External services: intended AWS API Gateway/Lambda/DynamoDB visitor counter.

Current status:

- `frontend-AWS/.env.example` documents `VITE_AWS_VISITOR_API_URL`.
- GitHub Actions frontend deploy writes `VITE_AWS_VISITOR_API_URL` into `.env` when the corresponding secret exists.

Recommendation: keep the local `.env` and GitHub secret value aligned with the rebuilt AWS visitor counter endpoint.

### `frontend-AWS/src/api/projects.js`

Purpose: frontend API client for per-project view tracking.

Responsibilities: read project counter API base URL, fetch project views, increment project views, and fail closed.

Dependencies: `VITE_AWS_PROJECTS_API_BASE_URL`, browser `fetch`.

How it works: reads `VITE_AWS_PROJECTS_API_BASE_URL` directly. Exposes `getProjectViews` and `incrementProjectView`.

External services: intended AWS API Gateway/Lambda/DynamoDB project counter.

Problems:

- `getProjectViews` is not currently used by the active UI.
- Project view tracking still depends on an external AWS API Gateway/Lambda/DynamoDB path that is not implemented in this repository.

Recommendation: keep fail-closed behavior and keep explicit env vars for each API in deployment.

### `frontend-AWS/src/hooks/useAssistantChat.js`

Purpose: chat state and RAG request orchestration hook.

Responsibilities: per-project chat state, session ID persistence, streaming-first request flow, sync fallback, message history, response status timer, new chat behavior, and chat input state.

Dependencies: `askRag`, `streamAskRag`, browser `localStorage`, `crypto.randomUUID`, `performance`, `requestAnimationFrame`.

How it works: keeps chat state by project workspace, stores session IDs in localStorage, submits to `/ask-rag-stream`, updates assistant message content token-by-token, falls back to `/ask-rag`, and saves rolling history.

External services: GCP RAG backend through `api/chat.js`.

Problems:

- Hook has many responsibilities: persistence, request lifecycle, timer state, message mutation, and fallback logic.
- `persistSessionId` uses `window.localStorage` without guarding every call for non-browser contexts.
- The frontend sends short local history even though backend prefers Firestore stored history.

Recommendation: split request transport/timer/session persistence into smaller helpers if chat complexity grows.

### `frontend-AWS/src/components/ChatPanel.jsx`

Purpose: floating AI assistant workspace UI.

Responsibilities: launcher, draggable/docked workspace, expanded mode, project sidebar, source rendering, composer auto-grow, manual composer resize, Enter-to-send, Shift+Enter newline, close/new chat controls, and message display.

Dependencies: React state/effects/refs, `cleanAnswerText`, `useAssistantChat` props, localStorage.

How it works: receives chat state from `Home.jsx`, renders workspace shell and launcher, handles pointer events for drag/resize, persists position and composer height, and displays sources in compact `[S#] file / heading` rows.

External services: no direct calls; uses chat callbacks.

Problems:

- Large component at 849 lines.
- Mixes layout, pointer behavior, persistence, message rendering, and source rendering.
- Uses text symbols (`‹`, `›`) rather than icon components.
- Complex pointer handling deserves focused tests.

Recommendation: split into `ChatLauncher`, `ChatWorkspace`, `ChatComposer`, `ChatMessages`, and drag/resize hooks when the next UI change is needed.

### `frontend-AWS/src/components/AIChat.jsx`

Purpose: simple legacy AI chat component.

Responsibilities: local question/answer/source state and one-shot `/ask-rag` call.

Dependencies: `askRag`, `cleanAnswerText`.

How it works: renders textarea and button, calls `askRag`, displays answer and sources.

External services: GCP RAG backend.

Problems:

- Not imported anywhere in `frontend-AWS/src`.
- Duplicates older chat behavior now handled by `ChatPanel` and `useAssistantChat`.

Recommendation: remove or move to an examples/dev-only folder if not intentionally kept.

### `frontend-AWS/src/components/ProjectModal.jsx`

Purpose: project documentation modal shell.

Responsibilities: modal lifecycle, language/theme controls, active document and section state, sidebar expansion, section scrolling, and Escape/backdrop close support through parent.

Dependencies: `ProjectDocsSidebar`, `ProjectDocsViewer`, `getProjectDocument`, `getProjectDocumentOutlines`.

How it works: loads outlines for all three default docs, parses only the active document body, scrolls to selected sections, and tracks active section while the viewer scrolls.

External services: none.

Problems:

- Assumes default document/section IDs exist; fallback behavior is okay but should stay tested.
- Some accessibility improvement possible around focus trapping and return focus.

Recommendation: keep architecture; add focus management before calling this production-grade.

### `frontend-AWS/src/content/projectDocs.js`

Purpose: custom markdown loader/parser for the modal documentation system.

Responsibilities: import markdown files, parse frontmatter, parse headings/sections/tables/fences/callouts/images/lists/quotes/galleries, build document outlines, and provide fallback markdown.

Dependencies: Vite `import.meta.glob`, markdown files under `src/content/projects`.

How it works: eagerly imports raw markdown strings, maps project IDs to folders, builds outlines from `#` headings, and parses active document content into block objects for `MarkdownContent`.

External services: none.

Problems:

- Large custom parser at 593 lines.
- Supports a deliberate subset of Markdown; unsupported inline features will not render.
- Fallback markdown can make incomplete project docs appear more complete than they are.

Recommendation: keep for now, but document supported syntax and add parser unit tests before adding more syntax.

### `frontend-AWS/src/components/MarkdownContent.jsx`

Purpose: render parsed markdown blocks.

Responsibilities: inline links/bold, code blocks, Mermaid diagrams, callouts, tables, images, galleries, blockquotes, links, and section error boundary.

Dependencies: dynamic `import("mermaid")`, React, parsed block format from `projectDocs.js`.

How it works: renders block objects with specialized components; Mermaid is rendered client-side with strict security level and theme awareness.

External services: none.

Problems:

- Uses `dangerouslySetInnerHTML` for Mermaid SVG output, mitigated by Mermaid `securityLevel: "strict"` but still worth tracking.
- Inline markdown supports only links and bold.

Recommendation: keep. Add renderer tests and keep Mermaid version pinned through lockfile.

### `frontend-AWS/src/components/ProjectDocsViewer.jsx`

Purpose: document viewer for active modal document.

Responsibilities: render sections and pass blocks to `MarkdownContent`.

Dependencies: `MarkdownContent`.

How it works: maps parsed document sections into `<section>` elements with IDs and `data-section-id`.

Problems: none significant.

Recommendation: keep.

### `frontend-AWS/src/components/ProjectDocsSidebar.jsx`

Purpose: modal documentation navigation.

Responsibilities: document expand/collapse and section selection.

Dependencies: document outlines from `ProjectModal`.

How it works: renders buttons for each document and nested section buttons.

Problems: uses text arrows (`v`, `>`) and no icons. Fine functionally.

Recommendation: keep; consider icon components later.

### `frontend-AWS/src/components/Navbar.jsx`

Purpose: sticky site navigation.

Responsibilities: brand link, visitor count, nav links, language switch, theme toggle, and scroll progress.

Dependencies: content labels and state passed from `Home.jsx`.

How it works: renders header/nav and progressbar tied to `useScrollTracker`.

External services: none directly; displays visitor count from API state.

Problems: none major.

Recommendation: keep.

### `frontend-AWS/src/components/PortfolioCaseStudies.jsx`

Purpose: project card list.

Responsibilities: render project preview image/fallback, project title/body/services, and open modal.

Dependencies: project metadata from `portfolioContent.js`.

How it works: maps projects to button-backed cards, uses image fallback when preview image fails.

Problems: cards for future projects can make planned work look implemented if content is not clearly labeled.

Recommendation: keep, but make project status more explicit in card UI.

### `frontend-AWS/src/components/PortfolioSection.jsx`

Purpose: small section wrapper.

Responsibilities: normalize section class name and ID.

Dependencies: none.

Problems: none.

Recommendation: keep.

### `frontend-AWS/src/hooks/useScrollTracker.js`

Purpose: scroll progress and active section tracking.

Responsibilities: compute page scroll percentage and current active nav section.

Dependencies: DOM APIs, CSS variable `--portfolio-sticky-offset`.

Problems:

- `sectionIds` default array is stable, but if a caller passes a new array each render, the effect reruns.

Recommendation: keep.

### `frontend-AWS/src/hooks/useTheme.js`

Purpose: light/dark theme state.

Responsibilities: toggle theme and write `data-theme` on `<html>`.

Dependencies: DOM dataset.

Problems:

- No localStorage persistence.
- No system preference initialization.

Recommendation: add persistence only if users expect theme to survive refresh.

### `frontend-AWS/src/utils/ragDisplay.js`

Purpose: answer text cleanup utility.

Responsibilities: remove `[S#]` citation markers from visible answer text and normalize whitespace.

Dependencies: regex only.

Problems:

- Removing citations from answer display while separately showing sources is a product choice. It may reduce visible grounding clarity.

Recommendation: keep if source list remains visible; reconsider if recruiter-facing traceability matters.

### `frontend-AWS/src/App.css` and `src/index.css`

Purpose: application styling.

Responsibilities: all layout, responsive behavior, modal styling, markdown rendering, chat workspace, cards, contact form, theme tokens, and base styles.

Dependencies: component class names.

Problems:

- `App.css` is 3,527 lines. This is the largest frontend maintainability risk.
- Styling is tightly coupled to several complex components.

Recommendation: split CSS by surface (`layout`, `portfolio`, `modal-docs`, `chat`, `markdown`) or adopt CSS modules only when changing related components.

### `frontend-AWS/scripts/*.mjs`

Purpose: Playwright screenshot capture utilities.

Responsibilities: serve built `dist/` assets through Playwright routing, mock backend responses, capture desktop/mobile screenshots, and validate UI states.

Dependencies: `playwright`, built `frontend-AWS/dist`.

How it works: launches Chromium headless, intercepts requests, serves static files, simulates RAG success/error states, and writes screenshots.

Problems:

- Useful but not wired as package scripts or CI gates.
- Depends on built `dist/`; failures may be confusing if build is stale.

Recommendation: add `npm run screenshots` or a smoke-test script if these remain part of the verification workflow.

### Frontend Environment Variables

| Variable | Used By | Status |
|----------|---------|--------|
| `VITE_GCP_RAG_API_URL` | `src/api/chat.js` | In `.env.example` and frontend deploy workflow. |
| `VITE_AWS_VISITOR_API_URL` | `src/api/visitors.js` | In `.env.example` and frontend deploy workflow. |
| `VITE_AWS_PROJECTS_API_BASE_URL` | `src/api/projects.js` | In `.env.example` and frontend deploy workflow. |
| `VITE_AWS_CONTACT_API_URL` | Reserved for future Contact Form integration | In `.env.example` and frontend deploy workflow; not used by active UI yet. |

## 4. Backend Inspection

### `backend-GCP/main.py`

Purpose: FastAPI application entry point.

Responsibilities: configure logging, create app, apply CORS, register error handler, add request logging middleware, and include route modules.

Dependencies: FastAPI, CORS middleware, `settings`, `configure_logging`, route modules, backend errors.

How it works: creates `app`, logs public config/startup warnings, applies CORS origins from settings, adds request ID and duration headers, and includes health/chat/rag routers.

External services: none directly.

Problems:

- App title still says `GCP RAG Backend MVP`, which undersells current maturity.
- CORS allows credentials with explicit origins; acceptable but should be reviewed with auth/cookie plans.

Recommendation: rename title and keep middleware.

### `backend-GCP/app/config/settings.py`

Purpose: runtime configuration object.

Responsibilities: environment variable parsing, defaults, public config summary, startup warnings, RAG feature flags, Firestore collection names, model names, CORS origins, and chunk settings.

Dependencies: `os`, dataclass.

How it works: creates frozen `Settings` instance at import time. Exposes `public_summary()` and `startup_warnings()`.

External services: configures GCP, Firestore, Gemini, Cloud Storage, Cloud Run behavior.

Problems:

- Defaults for `DIRECT_CONTEXT_DOCUMENTS` and `INGEST_DOCUMENTS` still reference older filenames (`PROJECT_STATE.md`, `Frontend_Development_Log.md`) unless deployment overrides them.
- Many advanced RAG features are code-supported but default-off.
- Secrets are correctly summarized as booleans, not values.

Recommendation: align defaults with current source documents or make required production variables explicit.

### `backend-GCP/app/routes/health.py`

Purpose: health and runtime summary routes.

Responsibilities: `GET /` full public status/config summary and `GET /healthz` lightweight health.

Dependencies: `settings`.

External services: none directly.

Problems:

- Root endpoint exposes non-secret config details. Useful for debugging, but review before public production.

Recommendation: keep `/healthz`; restrict or reduce root config output if this becomes a public production service.

### `backend-GCP/app/routes/chat.py`

Purpose: basic Gemini chat and direct document-context chat endpoints.

Responsibilities: `/chat` plain Gemini generation; `/chat-with-docs` reads configured GCS markdown files and passes them directly as context.

Dependencies: `ChatRequest`, response schemas, `settings`, `gcs_service`, `gemini_service`.

External services: Vertex AI Gemini, GCS.

Problems:

- These endpoints are less mature than `/ask-rag`.
- `/chat` is ungrounded and could answer outside project docs.
- `/chat-with-docs` loads entire configured documents and may be expensive for large docs.

Recommendation: keep for debugging/internal use, but document them as non-primary or consider disabling in public production.

### `backend-GCP/app/routes/rag.py`

Purpose: public and admin RAG API routes.

Responsibilities: protected ingestion, protected analytics summary, sync RAG, streaming RAG, and rate-limit enforcement.

Dependencies: FastAPI, `StreamingResponse`, schemas, `require_admin_token`, `ingestion_service`, `rag_service`, `rate_limit_service`.

External services: indirectly Firestore, GCS, Vertex AI through services.

Problems:

- Rate limit key uses client host before session ID. Behind proxies/load balancers this may not identify users accurately.
- Admin analytics and ingestion share the same token setting.

Recommendation: keep. Later split admin tokens/scopes and move to distributed rate limiting.

### `backend-GCP/app/schemas/chat_schema.py`

Purpose: Pydantic request/response contracts.

Responsibilities: chat request, metadata filters, source metadata, chat responses, RAG responses, ingestion response.

Dependencies: Pydantic.

Problems:

- `ChatMessage.role` is unrestricted string; service filters known roles later.
- `question` has no length validation.

Recommendation: add field constraints before public scale.

### `backend-GCP/app/security.py`

Purpose: admin-token guard.

Responsibilities: require configured token and compare provided token using constant-time comparison.

Dependencies: `hmac`, `settings`, `AdminAuthError`.

External services: none.

Problems:

- Single token protects both ingestion and analytics.
- No token rotation mechanism in code.

Recommendation: keep simple guard for now; split scopes for production.

### `backend-GCP/app/errors.py`

Purpose: typed backend errors and FastAPI error handler.

Responsibilities: convert internal service failures into public JSON error responses with request IDs and safe messages.

Dependencies: FastAPI request/response, logging.

Problems: error messages are intentionally generic, which is good. No major issue.

Recommendation: keep.

### `backend-GCP/app/logging_config.py`

Purpose: JSON structured logging.

Responsibilities: configure root logger, serialize log extras, include exceptions.

Dependencies: Python logging, JSON, UTC datetime, `settings.log_level`.

Problems: none major.

Recommendation: keep. Add log sampling/PII policy later.

### `backend-GCP/app/services/gemini_service.py`

Purpose: Vertex AI Gemini provider wrapper.

Responsibilities: text generation, streaming generation, embeddings, and provider error mapping.

Dependencies: `google.genai`, `GenerateContentConfig`, `settings`, `ProviderServiceError`.

External services: Vertex AI Gemini and embedding model.

Problems:

- Provider client is instantiated at import time; tests often need module fakes.
- Streaming method does not accept alternate model parameter, unlike `generate_text`.

Recommendation: keep; consider lazy client construction or dependency injection if tests become painful.

### `backend-GCP/app/services/gcs_service.py`

Purpose: Cloud Storage provider wrapper.

Responsibilities: read text source documents from configured bucket.

Dependencies: `google.cloud.storage`, `settings`, `StorageServiceError`.

External services: Google Cloud Storage.

Problems:

- No explicit missing-file handling beyond generic storage error.
- No cache; repeated `/chat-with-docs` calls re-download configured docs.

Recommendation: keep for ingestion; avoid using direct-doc endpoint for public high traffic.

### `backend-GCP/app/services/firestore_service.py`

Purpose: Firestore provider/data access layer.

Responsibilities: write chunks, vector search, local chunk streaming, stale chunk pruning, conversation message storage, query rewrite audit messages, recent message loading, analytics write/read.

Dependencies: Firestore client, Firestore `Vector`, `DistanceMeasure`, `settings`, `DatabaseServiceError`.

External services: Firestore.

Problems:

- Client is instantiated at import time.
- Local retrieval streams all chunks, which does not scale.
- Conversation messages store user and assistant content; retention/privacy policy is not in code.
- `build_chunk_document_id(file_name, chunk_index)` means document IDs are stable by position, not content. Pruning handles stale extras, but changed chunk ordering rewrites many records.

Recommendation: keep, but introduce repository interfaces and formal retention/index policies before production scale.

### `backend-GCP/app/services/vector_service.py`

Purpose: chunking, metadata inference, and scoring utilities.

Responsibilities: markdown-aware chunking, parent-child metadata, token overlap splitting, content hashes, doc type/project inference, cosine similarity, keyword score, hybrid score, reranking, top-k selection.

Dependencies: `settings`, regex, SHA-256.

Problems:

- Token counting is whitespace-based, not model-token-based.
- Metadata inference depends on filenames/headings and can misclassify.
- `_split_markdown_sections` splits on any line starting with `#`, including code blocks if present in raw source text.

Recommendation: keep for current size; add parser-aware chunking before broad RAG corpus expansion.

### `backend-GCP/app/services/ingestion_service.py`

Purpose: ingestion orchestrator.

Responsibilities: read configured docs from GCS, build parent-child chunks, embed chunks, write Firestore records, and prune stale records.

Dependencies: `settings`, `gcs_service`, `gemini_service`, `firestore_service`, `vector_service`.

External services: GCS, Vertex AI embeddings, Firestore.

Problems:

- Embedding/write loop is sequential; large corpora will be slow.
- No dry-run mode.
- No per-document partial failure reporting.

Recommendation: keep for current corpus; add batch/concurrency and dry-run before scaling.

### `backend-GCP/app/services/rate_limit_service.py`

Purpose: lightweight in-memory public RAG rate limiter.

Responsibilities: track request timestamps per key and block over-limit callers.

Dependencies: `settings`, monotonic time, collections.

Problems:

- In-memory only. It does not coordinate across Cloud Run instances or survive restarts.
- Key quality depends on request client host.

Recommendation: acceptable as Phase 1 abuse control; replace with Redis/Firestore/API Gateway/Cloud Armor style control for real production.

### `backend-GCP/app/services/rag_service.py`

Purpose: main RAG orchestration service.

Responsibilities: sync answers, streaming answers, context preparation, Firestore/local retrieval, Firestore vector retrieval fallback, query rewriting, multi-query generation, metadata filtering, semantic reranking, parent-child expansion, prompt construction, citation validation, analytics, and SSE formatting.

Dependencies: `settings`, `firestore_service`, `gemini_service`, `vector_service`, backend errors.

External services: Firestore, Vertex AI Gemini/embeddings.

How it works:

1. Loads stored Firestore conversation history or uses request history fallback.
2. Optionally rewrites follow-up questions into standalone retrieval queries.
3. Optionally generates multiple retrieval queries.
4. Embeds each retrieval query.
5. Retrieves candidates from Firestore vector search or local full scan.
6. Scores candidates with vector/keyword/hybrid logic.
7. Applies optional reranking and optional semantic reranking.
8. Adds source IDs and optional parent context expansion.
9. Builds grounded prompt with retrieved context and recent conversation.
10. Generates answer, validates citations, saves conversation, writes metadata-only analytics, and returns JSON or SSE.

Problems:

- 1,440 lines in one service class. It is the backend's main maintainability risk.
- Many advanced RAG features are controlled by global settings, which makes per-request experimentation harder.
- Citation validation only accepts explicit `[S#]` citations or exact canonical no-answer; this is safe but can suppress useful answers when the model formats citations differently.
- Analytics write failures are swallowed as warnings, which is acceptable but should be observable.

Recommendation: split into retrieval service, prompt builder, citation validator, analytics builder, and query expansion/reranking modules.

### `backend-GCP/scripts/evaluate_rag.py`

Purpose: RAG quality evaluation CLI.

Responsibilities: load golden questions, call `/ask-rag`, validate source matches, doc types, required/forbidden terms, citations, no-answer behavior, latency, thresholds, and write markdown/JSON reports.

Dependencies: standard library only.

External services: configured RAG backend URL.

Problems:

- Uses simple term containment, which is useful but brittle.
- Evaluates sync `/ask-rag`, not streaming `/ask-rag-stream`.
- Soft-fail in workflow means poor RAG quality does not block deployment.

Recommendation: keep; add streaming checks and consider hard gates once baseline stabilizes.

### `backend-GCP/tests/`

Purpose: backend unit test suite.

Responsibilities: cover settings warnings, vector/chunking, schema fields, Firestore service behavior, ingestion auth, RAG service logic, rate limiting, and RAG eval helper logic.

Dependencies: Python unittest and extensive module fakes/mocks.

Problems:

- Tests fake many cloud modules, which is necessary locally but can hide provider integration issues.
- No true integration tests against emulator or staging services.

Recommendation: keep and expand. Add a small staging smoke suite for deployed Cloud Run.

### `backend-GCP/Dockerfile`

Purpose: Cloud Run container image definition.

Responsibilities: install Python dependencies and run `uvicorn main:app` on `$PORT`.

Dependencies: Python 3.11 slim, `requirements.txt`.

Problems:

- Single-stage image, no non-root user.
- No healthcheck.

Recommendation: acceptable for current capstone; harden before production claims.

### `backend-GCP/requirements.txt`

Purpose: backend dependency list.

Responsibilities: declare FastAPI, Uvicorn, Google GenAI, Cloud Storage, Firestore.

Problems:

- Most dependencies are unpinned except Firestore lower bound.

Recommendation: pin major/minor versions or use a lock strategy for reproducible builds.

## 5. AWS Backend / Lambda Inspection

No AWS Lambda source code is present. No API Gateway configuration, DynamoDB schema, Lambda handler, IAM policy, CloudFormation, SAM, Serverless Framework, or Terraform implementation exists in the repository.

Current AWS-related source code:

| Area | File | Current Behavior |
|------|------|------------------|
| Visitor counter client | `frontend-AWS/src/api/visitors.js` | Reads `VITE_AWS_VISITOR_API_URL`; returns `0` on missing config or failure. |
| Project view client | `frontend-AWS/src/api/projects.js` | Reads `VITE_AWS_PROJECTS_API_BASE_URL`; returns `null` on missing config or failure. |
| View count display | `frontend-AWS/src/components/Navbar.jsx` | Displays `viewCount` supplied by `Home.jsx`. |
| Project view increment | `frontend-AWS/src/pages/Home.jsx` | Increments each project once per page lifetime when modal opens. |
| Frontend AWS deploy | `.github/workflows/deploy-frontend.yml` | Builds frontend and syncs `dist/` to S3, then invalidates CloudFront. |

Expected but missing AWS backend components:

- Lambda handler for `/views`.
- Lambda handler for `/projects/{projectId}` and `/projects/{projectId}/view`.
- DynamoDB table schema and access patterns.
- IAM execution role and policies.
- API Gateway routes and CORS configuration.
- Contact form Lambda/SES implementation.
- EventBridge/SNS implementation.
- IaC for all of the above.

Recommendation: do not describe AWS backend counters as currently implemented in source code until Lambda/IaC files exist.

## 6. Infrastructure Inspection

### GitHub Actions

`deploy-frontend.yml`:

- Trigger: push to `main`.
- Installs Node 20 dependencies.
- Writes `.env` with `VITE_GCP_RAG_API_URL`.
- Runs `npm run build`.
- Configures AWS credentials.
- Syncs `dist/` to S3.
- Invalidates CloudFront.

Problems:

- No frontend lint step in deploy workflow.
- Writes `VITE_AWS_VISITOR_API_URL`, `VITE_AWS_PROJECTS_API_BASE_URL`, and `VITE_AWS_CONTACT_API_URL` when corresponding GitHub secrets exist.
- No preview environment or manual approval.
- Uses long-lived AWS access key secrets rather than OIDC.

`deploy-backend-gcp.yml`:

- Trigger: push to `main` affecting `backend-GCP/**` or the workflow.
- Installs Python dependencies.
- Runs backend unit tests.
- Compiles selected files.
- Authenticates to GCP with Workload Identity Federation.
- Builds/pushes Docker image.
- Deploys to Cloud Run.
- Runs soft-fail RAG evaluation and uploads reports.

Problems:

- Deployment sets many RAG feature flags false, while docs may describe later manually enabled revisions.
- RAG evaluation is soft-fail, so quality regressions do not block deploy.
- Cloud Run env var ownership is workflow-based, not Terraform-governed.

### Terraform / IaC

No Terraform files exist. `TERRAFORM_ADOPTION_PLANNING_REPORT.md` is planning documentation only.

Current automation:

- Frontend artifact deployment to S3/CloudFront.
- Backend image build/deploy to Cloud Run.
- Backend unit tests and RAG eval report generation.

Still manual or missing:

- AWS resource creation.
- GCP resource creation/import.
- Terraform state management.
- Drift detection.
- IAM policy governance.
- Secret rotation policy.
- Rollback runbooks.
- Monitoring dashboards/alerts.

## 7. Data Flow Analysis

### Website Visitor Counter Flow

```text
User
-> React Home.jsx mount
-> fetchVisitorCount()
-> VITE_AWS_VISITOR_API_URL
-> API Gateway / Lambda / DynamoDB (expected external AWS path)
-> JSON { views }
-> Navbar displays count
```

Current source-code reality: frontend client exists; AWS Lambda/API/IaC source does not exist.

### Project View Counter Flow

```text
User opens Project Modal
-> Home.jsx selectedProject effect
-> page-lifetime Set dedupe
-> incrementProjectView(projectId)
-> VITE_AWS_PROJECTS_API_BASE_URL
-> POST /projects/{projectId}/view
-> DynamoDB-backed AWS API (expected external path)
-> UI does not display project count
```

Current source-code reality: frontend client and modal trigger exist; AWS backend source does not.

### AI Chat / RAG Flow

```text
User
-> ChatPanel composer
-> useAssistantChat.handleChatSubmit
-> streamAskRag()
-> POST /ask-rag-stream
-> FastAPI rag route
-> rate_limit_service
-> rag_service.stream_answer
-> Firestore conversation history
-> optional query rewrite / multi-query
-> Gemini embeddings
-> Firestore local scan or vector search
-> optional rerank / semantic rerank / parent expansion
-> Gemini answer generation
-> citation validation
-> SSE metadata/token/done
-> React message rendering
```

Fallback:

```text
stream failure
-> askRag()
-> POST /ask-rag
-> JSON answer/sources
```

### Document Ingestion Flow

```text
Admin caller
-> POST /ingest-docs with X-Admin-Token
-> require_admin_token
-> ingestion_service
-> GCS read configured markdown files
-> vector_service.build_parent_child_chunks
-> Gemini embedding per chunk
-> Firestore document_chunks upsert
-> Firestore stale chunk pruning
```

Current risk: ingestion source filenames are environment-sensitive; local defaults are stale unless overridden.

## 8. Dependency Analysis

| Area | File/Module | Depends On | Used By | Risk |
|------|-------------|------------|---------|------|
| Frontend entry | `src/main.jsx` | React DOM, App | Browser | Low |
| Frontend root | `src/App.jsx` | `Home`, `App.css` | `main.jsx` | Low |
| Page orchestration | `src/pages/Home.jsx` | components, hooks, API clients, content | App | Medium |
| Chat transport | `src/api/chat.js` | Cloud Run URL, fetch/SSE | `useAssistantChat`, `AIChat` | Medium |
| Visitor API | `src/api/visitors.js` | `VITE_AWS_VISITOR_API_URL` | `Home.jsx` | Medium |
| Project view API | `src/api/projects.js` | AWS API env vars | `Home.jsx` | Medium |
| Chat state | `src/hooks/useAssistantChat.js` | `api/chat`, localStorage | `Home.jsx` | Medium |
| Chat UI | `src/components/ChatPanel.jsx` | chat props, localStorage | `Home.jsx` | High |
| Markdown parser | `src/content/projectDocs.js` | markdown files, Vite glob | `ProjectModal` | High |
| Markdown renderer | `src/components/MarkdownContent.jsx` | Mermaid, block schema | `ProjectDocsViewer` | Medium |
| CSS | `src/App.css` | component class names | Whole frontend | High |
| Backend app | `backend-GCP/main.py` | routes, settings, errors | Cloud Run/Uvicorn | Medium |
| Backend settings | `settings.py` | env vars | all backend modules | High |
| RAG routes | `routes/rag.py` | RAG/ingestion/rate limit/security | FastAPI app | Medium |
| RAG service | `services/rag_service.py` | Firestore, Gemini, vector service | RAG routes | High |
| Firestore service | `services/firestore_service.py` | Firestore client | RAG/ingestion | High |
| Vector service | `services/vector_service.py` | settings | ingestion/RAG | Medium |
| Gemini service | `services/gemini_service.py` | Vertex AI | chat/RAG/ingestion | Medium |
| GCS service | `services/gcs_service.py` | Cloud Storage | chat-with-docs/ingestion | Medium |
| Rate limiter | `services/rate_limit_service.py` | settings | RAG routes | Medium |
| Eval script | `scripts/evaluate_rag.py` | `/ask-rag` endpoint | CI/manual eval | Medium |
| Frontend deploy | `.github/workflows/deploy-frontend.yml` | AWS secrets, npm | AWS hosting | High |
| Backend deploy | `.github/workflows/deploy-backend-gcp.yml` | GCP secrets, Docker, tests | Cloud Run | High |

## 9. Code Quality Review

| Category | Score | Review |
|----------|------:|--------|
| Naming | 8/10 | File and function names are generally clear. Some historical names remain, such as `AIChat` and `GCP RAG Backend MVP`. |
| Modularity | 7/10 | Good frontend/backend separation, but several large modules need decomposition. |
| Duplication | 6/10 | Chat logic has legacy duplicate `AIChat`; docs/content repeat roadmap concepts; API env handling is inconsistent. |
| Error handling | 7/10 | Backend has typed errors and frontend API clients fail closed. Some frontend errors are swallowed by returning `0`/`null`, which can hide configuration problems. |
| Testing | 7/10 | Backend tests are strong for a portfolio. Frontend lacks CI-gated unit/component tests. |
| Logging | 8/10 | Backend JSON logging and request IDs are strong. Frontend uses console warnings/errors only. |
| Configuration | 6/10 | Backend config is centralized; frontend env workflow is incomplete; local defaults can drift. |
| Security | 5/10 | Admin token and CORS exist; public RAG unauthenticated; no threat model; in-memory rate limiting only. |
| Scalability | 5/10 | Local Firestore full scan and sequential ingestion are fine for small corpus but not large scale. |
| Maintainability | 6/10 | Clear architecture, but large CSS/chat/RAG/parser files and missing IaC increase maintenance cost. |

## 10. Technical Debt

High-signal technical debt:

- No AWS Lambda source code for visitor/project counters.
- No Terraform implementation.
- Contact Form API env var exists, but Contact Form submission is not implemented yet.
- `frontend-AWS/src/api/chat.js` hard-codes Cloud Run fallback URL.
- `frontend-AWS/src/components/AIChat.jsx` appears unused.
- `frontend-AWS/src/App.css` is too large.
- `frontend-AWS/src/components/ChatPanel.jsx` is too large.
- `backend-GCP/app/services/rag_service.py` is too large.
- Backend local/default ingest document names are stale.
- Public root health endpoint exposes detailed non-secret config.
- Backend dependencies are mostly unpinned.
- Rate limiting is in-memory.
- Frontend contact form is UI-only.
- RAG evaluation is soft-fail in CI.
- Frontend has screenshot scripts but no formal test suite.
- Documentation/code alignment is inconsistent around AWS current state and RAG feature flags.

Dead or likely dead code:

- `frontend-AWS/src/components/AIChat.jsx`: not imported by active frontend.
- `getProjectViews` in `frontend-AWS/src/api/projects.js`: exported but not used by current UI.

Fragile areas:

- Custom markdown parser and renderer.
- Chat drag/resize pointer handling.
- RAG citation validation and prompt behavior.
- Firestore local full-scan retrieval.
- Workflow-managed Cloud Run environment variables.

## 11. Production Readiness Review

| Area | Readiness | Assessment |
|------|-----------|------------|
| CI/CD | Partial | Backend tests and deploy exist; frontend build deploy exists; missing frontend lint/test in workflow and infra plans. |
| Terraform/IaC | Not ready | No `.tf` files. Planning only. |
| Logging | Moderate | Backend JSON logs, request IDs, duration headers. |
| Monitoring | Low/partial | RAG analytics exist, but dashboards/alerts/SLOs not implemented in source. |
| Security | Partial | Admin token, CORS, and basic rate limit exist; no full threat model or IAM/IaC. |
| Secrets management | Partial | GitHub secrets used; frontend hard-coded fallback remains; no rotation policy. |
| Rate limiting | Basic | In-memory only; not distributed. |
| CORS | Partial | Explicit origins configured; must track CloudFront changes. |
| Cost control | Low | No source-level budgets/quotas; semantic rerank can add extra Gemini call. |
| Rollback strategy | Low | Workflows deploy, but rollback runbooks/previous revision automation not in source. |
| Testing | Moderate | Backend good; frontend weak. |
| Disaster recovery | Low | No backup/restore runbook or IaC state. |

Production verdict: not fully production-ready. It is a strong capstone and a deployable portfolio, but it should be described as production-style or production-oriented unless the missing AWS backend source, IaC, monitoring, security docs, frontend test coverage, and runbooks are completed.

## 12. RAG Readiness Review

Source documents:

- Rich markdown exists in `Statement_MD/`, root reports, backend eval reports, and frontend docs.
- The corpus is too redundant and contains historical/current/planned content mixed together.

Chunking quality:

- `vector_service` does markdown-aware section splitting and parent-child metadata.
- It uses whitespace token counting, not model tokenization.
- It can mis-handle markdown code blocks if headings appear inside them.

Metadata:

- Good metadata fields exist: project, doc_type, file_name, heading, section_path, source_uri, version_id, content_hash, parent/child fields.
- Metadata inference is heuristic and filename-dependent.

Retrieval accuracy:

- RAG evaluation exists with 50 golden questions.
- Recent documented pass rates are below the configured target threshold.
- Firestore vector mode was evaluated but underperformed local full scan by one case in stored reports.

Hallucination control:

- Prompt requires citations.
- Citation validation blocks unsupported answers by returning canonical no-answer.
- This is conservative and useful, but it can over-block when citation formatting is imperfect.

Project isolation:

- Metadata filters exist but frontend does not currently send metadata filters per workspace.
- Project workspace selection is mostly frontend UI state; backend retrieval still depends on available corpus/filter request.

Conversation memory:

- Firestore conversation storage exists.
- Frontend also sends local rolling history fallback.
- System query-rewrite audit messages are filtered out of visible history.

Test coverage:

- Backend RAG logic has unit tests.
- RAG eval script has unit tests and CI use.
- No live streaming evaluator in current script.

Source citation quality:

- Backend returns `source_id`, file, heading, chunk, scores, metadata, and Phase 4 fields.
- Frontend displays compact source rows but removes inline citation markers from answer text.

RAG verdict: the code supports a strong RAG knowledge base, but the corpus and evaluation maturity are not yet production-grade. The next RAG improvement should be corpus governance and retrieval filtering, not another advanced feature.

## 13. Final Recommendations

### High Priority

1. Add real AWS backend source or stop treating AWS counters as source-implemented.
   Reason: frontend clients exist, but Lambda/API/DynamoDB/IAM/IaC source does not.

2. Keep frontend environment alignment current as AWS APIs are rebuilt.
   Reason: `.env.example` and `deploy-frontend.yml` now use explicit GCP/AWS env vars, but GitHub secrets must be updated to match the new names.

3. Remove or parameterize hard-coded Cloud Run fallback in `frontend-AWS/src/api/chat.js`.
   Reason: production frontend artifacts should not silently point to a fixed backend.

4. Split `backend-GCP/app/services/rag_service.py`.
   Reason: it is the main backend complexity hotspot.

5. Add frontend tests for chat and modal behavior.
   Reason: the most complex frontend surfaces are not covered by formal tests.

6. Create Terraform or an explicit "manual infra" source of truth before adding more AWS services.
   Reason: infrastructure ownership is currently outside the repo.

7. Mark `AIChat.jsx` as legacy or remove it.
   Reason: unused duplicate chat code creates confusion.

### Medium Priority

1. Split `frontend-AWS/src/App.css` by surface.
2. Split `ChatPanel.jsx` into smaller components and hooks.
3. Add field validation to backend schemas.
4. Align backend default ingest documents with current corpus.
5. Add distributed rate limiting or gateway-level throttling.
6. Pin backend dependency versions.
7. Add deployment rollback runbooks.
8. Add streaming checks to RAG evaluation.
9. Add metadata filters from frontend project workspace to backend RAG request.

### Low Priority

1. Persist theme choice in localStorage.
2. Replace text arrows with icon components.
3. Add focus trap/return focus to project modal.
4. Add contact form only after backend spam/security design exists.
5. Convert screenshot scripts into named npm scripts.
6. Refresh `tools/generate_technical_master_document.py` to remove stale visitor-counter claims.

## Final Assessment

The source code is stronger than the infrastructure story. The frontend and GCP backend show real engineering maturity, especially around modular React structure, RAG service boundaries, Firestore memory, SSE streaming, metadata, and evaluation. The weak side is production completeness: AWS backend source is absent, Terraform is absent, frontend env wiring is incomplete, and several large modules need decomposition before the next major feature wave.

The next responsible engineering move is not another feature. It is source-of-truth cleanup: env alignment, unused-code removal, RAG service decomposition, frontend test coverage, and real AWS/IaC implementation.

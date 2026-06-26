# Frontend Development Log

This file is the frontend history and current frontend state record. It tracks how the portfolio evolved from a single-file MVP into a modular React + Vite portfolio application.

For the overall project source of truth, see `CAPSTONE_PROJECT_STATE.md`.

## Current Frontend Status

The frontend is now modularized and production-style enough to support continued work without growing `App.jsx` into a monolith.

Latest portfolio alignment note:

- The confirmed visible portfolio roadmap is now:
  1. AWS Cloud Resume Challenge + GCP RAG Capstone
  2. Event-Driven Notification System
  3. URL Shortener
  4. QR Code Generator
  5. Real-Time Chat Application
  6. Video Streaming Platform
- Recipe Sharing App, Jenkins CI/CD, and EC2 Apache Website are retained as historical learning artifacts, not the active portfolio roadmap.
- The original AWS account is no longer available. Previous S3, CloudFront, API Gateway, Lambda, and DynamoDB work remains historical evidence, but AWS infrastructure must be rebuilt and redeployed in the new account before being described as current.
- Frontend-facing content now avoids presenting Bedrock/S3 Vectors as the current RAG path. The current AI/RAG implementation remains GCP Cloud Run, Gemini, Firestore, and Cloud Storage.

## 2026-06-26 - Project Modal Documentation Reader Redesign

Scope: Frontend-only Project Modal UI redesign.

Changed:

- Redesigned the project modal body into a lightweight documentation reader inspired by Docusaurus, GitBook, AWS Documentation, and IDE explorer navigation.
- Preserved the existing modal header with project title, EN / 繁中 language switch, theme toggle, and close button.
- Removed the top `Overview / Architecture / Implementation` document tabs.
- Replaced the old section-only sidebar with a compact documentation tree.
- Parent navigation is now derived from discovered Markdown filenames such as `overview.md`, `architecture.md`, and `implementation.md`.
- Future Markdown files under the same project/language folder will appear automatically as new parent navigation entries without editing project metadata.
- Sidebar navigation includes Markdown H1 and H2 headings only; H3+ headings render inside the document but do not appear in the sidebar.
- Added tighter IDE-style sidebar typography, compact spacing, expand/collapse arrows, hover state, active state, and smooth tree expansion.
- Increased the documentation reading area and improved spacing for headings, paragraphs, code blocks, tables, Mermaid diagrams, images, galleries, and callouts.
- Switched the frontend font stack to `Roboto`, `Noto Sans TC`, and sans-serif fallback.

Files changed:

- `frontend-AWS/src/components/ProjectModal.jsx`
- `frontend-AWS/src/components/ProjectDocsSidebar.jsx`
- `frontend-AWS/src/components/ProjectDocsViewer.jsx`
- `frontend-AWS/src/components/MarkdownContent.jsx`
- `frontend-AWS/src/content/projectDocs.js`
- `frontend-AWS/src/App.css`
- `Statement_MD/REACT_Frontend_Development_Log.md`

Validation:

- Captured before screenshot: `frontend-AWS/screenshots/project-modal-docs-before-cloud-zh.png`.
- Captured after screenshots:
  - `frontend-AWS/screenshots/project-modal-docs-after-cloud-zh-overview.png`
  - `frontend-AWS/screenshots/project-modal-docs-after-cloud-zh-expanded.png`
  - `frontend-AWS/screenshots/project-modal-docs-after-cloud-en-architecture.png`
  - `frontend-AWS/screenshots/project-modal-docs-after-cloud-en-dark.png`
- Playwright verified all six visible projects in EN and zh-TW.
- Playwright verified discovered `Overview`, `Architecture`, and `Implementation` parent navigation for every project/language combination.
- Playwright verified H1-style document titles, H2 rendering, parent active state, H2 active state after internal scrolling, expand/collapse behavior, language switching, theme switching, and absence of the removed top tablist.
- Browser console check reported no errors during the final Playwright verification.
- `npm run lint` passed in `frontend-AWS`.
- `npm run build` passed in `frontend-AWS`; Vite still reports the existing large-chunk warning from Mermaid-related bundles.

## 2026-06-24 - AWS-Only Frontend Rebuild Planning Note

Today the frontend planning focus is AWS-only. GCP RAG, AI Assistant, Knowledge Management, Advanced RAG, Memory, and RAG Analytics are outside this AWS execution scope and should continue later.

Frontend AWS rebuild plan:

- Redeploy the frontend to the new AWS account.
- Rebuild S3 and CloudFront first because they are the frontend foundation for the portfolio and project documentation.
- Treat the visitor counter as Previous / rebuild required until a new API Gateway endpoint, Lambda function, and DynamoDB table exist and are verified in the new account.
- Treat the project view counter as Planned. It should reuse the API Gateway + Lambda + DynamoDB pattern after the web view counter is rebuilt.
- Treat the contact form as Planned. It should use React Form + API Gateway + Lambda + SES, but it comes later because SES setup, spam controls, validation, and abuse handling need careful design.
- Treat event notification as Planned. EventBridge + Lambda + SNS should come after the foundational frontend, counters, and contact path because it is more event-driven and architecture-heavy.

Hard-coded visitor API note:

- `frontend-AWS/src/api/visitors.js` currently hard-codes the old API Gateway endpoint:
  `https://9u8ml80foj.execute-api.ap-northeast-1.amazonaws.com/views`
- That value belongs to the previous AWS account evidence and should not be treated as the new current endpoint.
- After the new API Gateway endpoint exists, the frontend should read the visitor API URL from environment configuration, for example `VITE_VISITOR_API_URL`.
- Until the new endpoint exists, the visitor counter should be treated as rebuild-required or temporarily unavailable.

## 2026-06-24 - AWS Frontend Redeployment

Completed AWS Phase 1: Portfolio Hosting.

New AWS account:

- Account name: `cloudlearning`
- Account ID: `001920499658`

Completed:

- New AWS account configured.
- AWS CLI reconfigured for the new account.
- Frontend built successfully.
- S3 deployment completed.
- CloudFront deployment completed.
- Origin Access Control configured.
- S3 bucket policy configured for CloudFront access.
- React SPA routing configured with:
  - `403 -> /index.html -> 200`
  - `404 -> /index.html -> 200`
- CloudFront cache invalidation completed.
- Production website verified through CloudFront.
- `frontend-AWS/src/api/visitors.js` no longer uses a hard-coded API Gateway URL.
- Visitor API endpoint is now read from `VITE_VISITOR_API_URL`.
- Visitor counter has a safe fallback while the backend rebuild is pending.

Current status:

- Portfolio Display: Current.
- Project Documentation: Current through the same S3 + CloudFront deployment.
- Web View Counter: Planned.
- Project View Counter: Frontend integrated; backend endpoint required.
- Contact Form: Planned.
- Event Notification: Planned.

Visitor counter note:

- The visitor counter is temporarily unavailable through the AWS backend because API Gateway, Lambda, and DynamoDB have not been rebuilt in the new account yet.
- The frontend does not break when `VITE_VISITOR_API_URL` is missing.
- Next frontend/backend integration phase is Web View Counter: `DynamoDB -> Lambda -> API Gateway -> React`.

Latest backend security note:

- `POST /ingest-docs` is now admin-token protected on the GCP backend.
- No React assistant behavior changed.
- The public frontend still uses `POST /ask-rag-stream` first and `/ask-rag` as fallback.
- The GCP backend now supports optional Advanced RAG Phase 1 query rewriting before retrieval.
- Rewritten queries are backend-only retrieval/audit data and are not displayed in the frontend.
- `ChatPanel.jsx` filters visible chat messages to `user` and `assistant` roles so Firestore `system` audit messages cannot appear if server-loaded messages are added later.
- The homepage assistant now uses a project-aware workspace shell where the project sidebar and sidebar toggle are external siblings beside the standalone chat panel, not embedded inside the chat card. This is frontend UI/state only; the assistant still sends the same `/ask-rag-stream` and `/ask-rag` payload shape.
- The assistant header now shows the active project title and subtitle directly in the chat panel header. Project 1 uses AWS orange for `AWS Cloud Resume Challenge` and Google blue for `+ GCP RAG`; suggested questions are plain text inside the sample response card instead of separate buttons.
- The assistant composer auto-grows while typing, keeps its current height across expand/collapse and close/reopen, exposes a custom top-left resize handle, Enter sends messages, Shift + Enter creates a newline, and the Ask AI launcher can be dragged and snapped to the nearest screen edge. The open workspace follows that side while keeping the sidebar, toggle, and chat panel attached.

## 2026-06-25 - Project View Tracking Frontend Integration

Implemented project view tracking as hidden analytics while keeping the public UI focused on the website visitor counter.

Files modified:

- `frontend-AWS/src/api/projects.js`
- `frontend-AWS/src/components/PortfolioCaseStudies.jsx`
- `frontend-AWS/src/components/ProjectModal.jsx`
- `frontend-AWS/src/pages/Home.jsx`
- `frontend-AWS/src/content/portfolioContent.js`
- `frontend-AWS/src/App.css`
- `frontend-AWS/.env.example`

Frontend behavior:

- Website views remain public-facing and visible in the navbar as the Cloud Resume Challenge visitor counter.
- Project-level views are collected silently as hidden analytics events and stored in DynamoDB for future analytics dashboard development.
- Modal open increments only the selected project with `POST /projects/{projectId}/view`.
- Page-lifetime deduplication uses an in-memory React ref-backed `Set`.
- Reopening the same project while the page remains open does not call `POST` again.
- Refreshing the page naturally resets project view deduplication, so opening the same project after a refresh counts again.
- Opening a different project increments that different project.
- Project count responses are not used for visible UI display.

UI placement:

- Project cards no longer show category labels such as `CAPSTONE PROJECT` or `EVENT-DRIVEN AWS`.
- Project cards keep `View more ->`, title, description, diagram, and tags.
- Project view counts are no longer rendered under `View more ->`.
- Project modal headers no longer show project view counts near the title.
- Modal language toggle, theme toggle, and close button remain in the top-right header controls.

Project ID mapping:

- `cloud-resume-rag` uses API project ID `aws-gcp-rag`.
- `event-system` uses API project ID `event-notification`.
- `url-shortener`, `qr-code-generator`, `real-time-chat`, and `video-streaming-platform` use API-compatible project IDs through `projectId`.
- The current visible roadmap does not include `recipe-sharing`; if it is reintroduced as a visible card, it should use API project ID `recipe-sharing`.

Testing performed:

- `npm run lint`
- `npm run build`
- Playwright mocked API verification confirmed website views remain visible.
- Playwright mocked API verification confirmed modal open still sends project view `POST` requests.
- Playwright mocked API verification confirmed page-lifetime deduplication and reset-after-refresh behavior.
- Playwright mocked UI verification confirmed project view counts are no longer visible in cards or modal headers.

Known limitation:

- Future project analytics dashboard work can reuse the stored DynamoDB project view data and `GET /projects/{projectId}` endpoint.

## Advanced RAG Roadmap — Phase 1 to Phase 5

Frontend context:

```text
The portfolio assistant currently sits on an Intermediate RAG backend with several advanced RAG features implemented.
```

The current RAG system is beyond naive RAG because it already includes Cloud Run FastAPI, Vertex AI Gemini 2.5 Flash, `text-embedding-005`, Firestore `document_chunks`, Firestore `conversations`, Firestore `rag_analytics`, Markdown-aware token-budget chunking, configurable chunk overlap, content hashing, chunk metadata, optional metadata filtering, score thresholds, candidate pool retrieval, optional multi-query retrieval, optional hybrid keyword + vector scoring, optional heuristic reranking, grounded source IDs, runtime citation validation, persistent chat history, optional conversation-aware query rewriting, streaming responses, protected `/ingest-docs`, structured logging, and health checks.

Backend update: `/ask-rag` and `/ask-rag-stream` now perform runtime citation validation before returning or saving generated answers. If retrieval produces no selected chunks, or if generated factual text does not cite a valid returned source ID, the backend returns `I do not know based on the indexed project documents.`

Backend update recorded on `2026-06-15`: `/ask-rag` and `/ask-rag-stream` now accept optional metadata filters for `file_name` and `heading`. The current frontend does not send filters by default, so visible chat behavior is unchanged.

Backend update recorded on `2026-06-15`: the GCP backend now supports optional multi-query retrieval behind `RAG_MULTI_QUERY_ENABLED`. When enabled, retrieval generates query variants, embeds each variant, merges scored candidates, and dedupes by file name and chunk index before final selection. The frontend does not need an API change because the feature is backend-only and disabled by default in deployment config.

Backend update recorded on `2026-06-15`: the GCP backend now writes metadata-only RAG analytics records after successful sync and streaming RAG responses. Records track latency, source count, no-answer status, citation-validation block status, query rewrite usage, multi-query usage, and metadata-filter usage without storing prompt text, question text, retrieved document text, embeddings, or generated answer text. The frontend API contract is unchanged.

Backend update recorded on `2026-06-15`: the GCP backend now exposes admin-only `GET /rag-analytics/summary` for aggregate RAG monitoring metrics. The endpoint is protected with `X-Admin-Token` and returns derived metrics only. The public chat UI contract is unchanged.

Previous backend improvements recorded on `2026-06-15`: CI/CD RAG evaluation gate, runtime citation validation and safe no-answer handling, token-aware chunking with configurable overlap, Phase 2A metadata filtering, Phase 2B multi-query retrieval, Phase 3A metadata-only RAG analytics records, and Phase 3B admin-only analytics summary endpoint.

It is not fully production-grade Advanced RAG yet because retrieval still scans Firestore in memory and the system does not yet include a managed vector index, a real semantic reranker, a visible frontend/internal monitoring dashboard, GraphRAG, or Agentic RAG.

| Phase   | Focus                        | Improvements                                                                                     | New GCP Services Required?                                                           | Goal                                                                               |
| ------- | ---------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Phase 1 | Retrieval Quality Quick Wins | Query rewriting, chunk overlap, token-aware chunking, citation validation                        | No new GCP service                                                                   | Improve answer relevance and citation reliability without changing architecture    |
| Phase 2 | Better Retrieval Logic       | Multi-query retrieval, metadata filtering, no-answer confidence handling                         | No new GCP service required                                                          | Make retrieval more accurate and safer for ambiguous or weak-context questions     |
| Phase 3 | Evaluation and Observability | RAG evaluation in CI/CD, project analytics, response/error tracking, monitoring dashboard        | Optional: Cloud Logging, Cloud Monitoring, Firestore analytics collection            | Prove quality, detect failures, and show production-readiness                      |
| Phase 4 | Managed Vector Retrieval     | Firestore Vector Search or Vertex AI Vector Search, managed ANN retrieval, scalable vector index | Yes: Firestore Vector Search or Vertex AI Vector Search                              | Replace Firestore full-scan retrieval with production-style vector search          |
| Phase 5 | Advanced RAG Patterns        | GraphRAG, Agentic RAG, specialist retrievers, multi-source orchestration                         | Yes, likely: Vertex AI Vector Search, Agent Engine/ADK, BigQuery/graph-style storage | Move beyond document similarity into relationship-aware and agent-driven retrieval |

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

1. Enable and validate query rewriting in deployed Cloud Run when ready
2. Citation validation and no-answer guardrails
3. Chunk overlap and token-aware chunking
4. Metadata filtering
5. Multi-query retrieval
6. Project analytics / monitoring dashboard
7. Firestore Vector Search or Vertex AI Vector Search
8. GraphRAG / Agentic RAG only after the core system is stable.

Current structure:

```text
frontend-AWS/src/
├── api/
│   ├── chat.js
│   ├── projects.js
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

`App.jsx` now only imports `Home` and global app CSS.

## Current Frontend Responsibilities

### `pages/Home.jsx`

Owns page composition and state orchestration:

- selected project state
- modal tab state
- language state
- visitor count state
- chat panel open/expanded state
- composition of navbar, sections, chat panel, and project modal

### `content/portfolioContent.js`

Owns bilingual portfolio text and project content.

### `api/chat.js`

Owns the `/ask-rag` fallback call, the `/ask-rag-stream` primary streaming call, SSE parsing, and `session_id` request payloads.

### `api/visitors.js`

Owns the visitor counter API call.

### `api/projects.js`

Owns project view tracking calls. The public frontend uses `POST /projects/{projectId}/view` on modal open for hidden analytics events; `GET /projects/{projectId}` remains available for future analytics/dashboard work but is not used for public UI display.

### `hooks/useAssistantChat.js`

Owns assistant question, loading, streamed answer, source, error state, local visible messages, fallback behavior, persistent RAG `session_id` state, and frontend-local project-keyed conversations for Project 1, Project 2, and Project 3.

### `hooks/useTheme.js`

Owns global theme state and `document.documentElement.dataset.theme` behavior.

### `hooks/useScrollTracker.js`

Owns scroll percentage and active section detection.

### `components/ChatPanel.jsx`

Owns homepage floating assistant presentation, including the external project workspace sidebar, external sidebar toggle, standalone chat card, active project header, suggested questions, visible messages, source rendering, composer, refresh, expand, and close controls.

### `components/ProjectModal.jsx`

Owns project modal presentation and project AI workspace presentation.

### `components/Navbar.jsx`

Owns sticky navigation, language controls, theme button, view counter, and progress bar presentation.

### `components/PortfolioCaseStudies.jsx`

Owns the Portfolio case-study card layout:

- featured capstone card
- vertically stacked supporting project cards
- card click behavior that delegates to the existing project modal opener
- architecture preview rendering for cards without image assets
- featured Draw.io architecture image rendering with fallback preview

### `components/PortfolioSection.jsx`

Owns reusable section wrapper behavior.

## Refactor Milestones

### 2026-05-22 — Portfolio Foundation

- Built initial React + Vite portfolio.
- Established minimal cloud/SaaS visual direction.
- Created Hero, About, Skills, Projects, Architecture, and Contact sections.

### 2026-05-23 — Bilingual UI, Theme State, and Assistant Shell

- Added English and Traditional Chinese content.
- Added light/dark mode.
- Added scroll progress.
- Added first floating AI assistant shell.

### 2026-05-23 — Project Cards and Modal Storytelling

- Added project card system.
- Added modal details for problem, solution, architecture, services, and notes.
- Moved deeper architecture detail into project modals.

### 2026-05-24 — Navigation, Modal Tabs, and Dark Mode Depth

- Added active navbar section highlighting.
- Added modal tabs.
- Improved dark-mode hierarchy and surface layering.

### 2026-05-24 — Integrated Project AI Workspace

- Converted project AI behavior into an integrated modal workspace.
- Separated homepage floating assistant from project modal AI workspace.

### 2026-05-25 — AWS Visitor Counter Integration

- Connected visitor count UI to live AWS API Gateway -> Lambda -> DynamoDB path.
- Preserved compact navbar placement.
- Documented local React StrictMode double-call behavior.

### 2026-05-27 — Homepage AI Window Containment

- Added viewport-safe sizing for homepage floating AI assistant.
- Added subtle backdrop/focus layer behind homepage chat window.

### 2026-06-18 — Project-Aware AI Workspace Shell

- Added project workspace mapping for Project 1, Project 2, and Project 3.
- Added frontend-local conversation buckets so switching projects restores each project chat independently.
- Refactored the assistant layout into sibling UI objects: external project sidebar, external sidebar toggle, and standalone chat panel.
- Kept the chat panel visually separate from the sidebar so suggested questions, sample response, messages, and input area are no longer internally split by project navigation.
- Preserved the existing streaming-first `/ask-rag-stream` behavior and `/ask-rag` fallback without adding project IDs or changing backend contracts.

### 2026-06-19 — AI Workspace Header and Sidebar Fine Tune

- Removed the small `CAPSTONE CHAT` context label from the assistant header.
- Replaced the generic `AI Assistant` heading with the active project title.
- Styled the Project 1 title as `AWS Cloud Resume Challenge + GCP RAG`, with AWS orange and GCP blue title segments.
- Moved `Project-specific AI workspace` into the header subtitle and removed the duplicate project info card from the chat body.
- Removed separate suggested-question buttons and rendered suggestions as compact plain text inside the sample response card.
- Preserved the external sidebar layout while adding a fade and slide transition for sidebar open/collapse.
- Restored expand/fullscreen sizing through the outer assistant workspace shell and kept outside-click close behavior scoped to the whole workspace.
- Kept API contracts, backend behavior, Firestore, GCP, and RAG retrieval unchanged.

### 2026-06-19 — AI Workspace Final UX Fine Tune

- Enabled vertical resizing on the chat textarea with stable min and max heights so the input can grow upward without changing backend behavior.
- Preserved keyboard behavior: Enter submits non-empty messages and Shift + Enter creates a soft line break.
- Removed the compact dock position selector and did not replace it with another position menu.
- Added launcher dragging with left/right edge snap so the collapsed Ask AI button never remains floating in the middle of the viewport.
- Added dynamic sidebar placement: right-side assistant uses `Project Sidebar + Toggle + Chat Panel`; left-side assistant uses `Chat Panel + Toggle + Project Sidebar`.
- Preserved manual workspace dragging from the assistant header so the external project sidebar, sidebar toggle, and chat panel move together, then update the snapped side on release.
- Persisted the snapped side and vertical launcher position in localStorage and restored them when reopening the assistant.
- Disabled dragging while expanded so fullscreen mode remains fixed, then restored the last dragged normal position after collapse.
- Reduced the expand icon visually while keeping the button target and expand/fullscreen behavior intact.
- Kept streaming/non-streaming assistant behavior, Firestore, GCP, backend APIs, and RAG retrieval unchanged.

### 2026-06-20 — AI Composer Advanced Textarea UX

- Added frontend-only auto-growing behavior to the assistant textarea so longer prompts expand the composer up to a 180px cap, then scroll inside the textarea.
- Replaced reliance on the browser default resize affordance with a subtle custom top-left resize handle that supports pointer dragging upward to increase height and downward to reduce height.
- Persisted the composer height in `localStorage` under `portfolioAssistantComposerHeight`, restoring the previous height after closing and reopening the assistant.
- Preserved the current composer height while toggling expanded mode on and off.
- Preserved Enter-to-send, Shift+Enter soft line breaks, disabled empty sends, send button behavior, project-specific local chat state, sidebar side switching, launcher dragging/snap behavior, workspace dragging, and expanded-mode drag disablement.
- Kept the change frontend-only; backend APIs, Firestore, GCP services, streaming fallback behavior, and RAG retrieval logic were not modified.

### 2026-05-28 — Production-Style Frontend Refactor

Completed modular extractions:

- `src/content/portfolioContent.js`
- `src/hooks/useAssistantChat.js`
- `src/components/ChatPanel.jsx`
- `src/components/ProjectModal.jsx`
- `src/api/visitors.js`
- `src/hooks/useTheme.js`
- `src/hooks/useScrollTracker.js`
- `src/components/PortfolioSection.jsx`
- `src/components/Navbar.jsx`
- `src/pages/Home.jsx`

Result:

- `App.jsx` reduced from roughly 1314 lines to a thin shell.
- Frontend now has clearer separation between content, API calls, hooks, page composition, and presentation components.
- `npm run lint` passes.
- `npm run build` passes.

### 2026-06-04 — Portfolio Gallery Refresh

Completed:

- Renamed the visible project section from `Projects` to `Portfolio`.
- Added `src/components/PortfolioGallery.jsx`.
- Converted the project display into a Notion-gallery-style layout.
- Made `AWS Cloud Resume + GCP RAG` the larger featured capstone card.
- Kept the remaining four project cards in a clean 2-by-2 supporting grid.
- Preserved project modal behavior by continuing to open projects through existing selected-project state.
- Preserved `/ask-rag` behavior by leaving assistant API and chat state modules untouched.
- Preserved the AWS visitor counter by leaving `src/api/visitors.js`, `Navbar.jsx`, and visitor-count orchestration untouched.
- Added featured-card support for a Draw.io architecture export at:

```text
frontend-Vite/public/architecture/aws-gcp-rag-architecture.png
```

- The featured image uses `object-fit: contain`.
- The featured card had a subtle AWS-orange accent border and a `Featured Capstone` label at this step.

### 2026-06-18 — Markdown Documentation System Hardening

Completed:

- Hardened the shared project markdown parser in `frontend-AWS/src/content/projectDocs.js`.
- Added validation warnings for unclosed fenced code blocks, unclosed Mermaid blocks, unclosed gallery blocks, unclosed callouts, invalid custom block syntax, invalid table-like blocks, and missing top-level markdown sections.
- Preserved active-document loading: the sidebar still reads document outlines separately, and the viewer still parses only the selected document through `getProjectDocument(...)`.
- Hardened `frontend-AWS/src/components/MarkdownContent.jsx` so rendering errors are isolated to the affected block.
- Added Mermaid fallback behavior: failed diagrams show `[ Mermaid Diagram Failed To Render ]` and include the Mermaid source for debugging.
- Added image/gallery fallback behavior: missing image assets show `Image Not Found` and log `[Markdown Warning]` messages.
- Added markdown authoring guidance at `frontend-AWS/src/content/projects/MARKDOWN_AUTHORING_GUIDE.md`.
- Reverted the Recipe Sharing App split-document proof of concept back to the standard `overview.md`, `architecture.md`, and `implementation.md` structure.
- Moved the former split Frontend and Backend content back into `implementation.md` under top-level `# Frontend` and `# Backend` sections.
- Validation proof: `npm run lint` passes.
- Validation proof: `npm run build` passes.
- The component falls back to the existing architecture-style preview if the Draw.io image is not present yet.

Verification:

```bash
cd frontend-Vite
npm run lint
npm run build
```

Result:

- `npm run lint` passed.
- `npm run build` passed.
- Existing local Vite server on `http://localhost:5173` returned `200`.
- No second Vite server was started.

### 2026-06-04 — Portfolio Case Studies Layout

Completed:

- Replaced the previous gallery/grid display with vertically stacked wide case-study cards.
- Added `src/components/PortfolioCaseStudies.jsx`.
- Removed the unused `src/components/PortfolioGallery.jsx`.
- Kept the visible section title as `Portfolio`.
- Used the same horizontal card structure for every project.
- Preserved the featured capstone emphasis through an AWS-orange accent line/frame.
- Kept supporting cards visually neutral and consistent.
- Preserved click-to-modal behavior through the existing selected-project state in `Home.jsx`.
- Preserved `/ask-rag`, visitor counter, project modal tabs, and project AI workspace behavior.

### 2026-06-04 — Portfolio Case Study Card Refinement

Completed:

- Normalized all Portfolio case-study cards to use the same shape, ratio, layout, preview size, title size, spacing, and typography.
- Removed the `Featured Capstone` badge from the capstone card.
- Changed the capstone type label from `Featured Platform` to `Capstone Project`, which renders as `CAPSTONE PROJECT`.
- Added a non-interactive `View more →` affordance in the top-right of every card.
- Kept the whole card as the only clickable button.
- Kept the capstone visual distinction limited to the AWS-orange `#FF9900` frame/border.
- Preserved existing project modal opening behavior.
- Preserved `/ask-rag`, visitor counter, AI assistant, navbar, and backend behavior.

Verification:

```bash
cd frontend-Vite
npm run lint
npm run build
```

### 2026-06-04 — Project Modal Documentation Tabs

Completed:

- Refined the existing project modal tab structure to:
  - `Overview`
  - `Architecture`
  - `Challenges`
  - `Documentation`
- Removed the old `Tech Stack` and `Lessons Learned` modal tabs.
- Kept modal rendering logic inside `ProjectModal.jsx`.
- Kept the tab list state in `Home.jsx` small and explicit.
- Added keyboard arrow/Home/End navigation across modal tabs.
- Kept the project title and technology tags visible in the modal header.
- Added richer capstone modal content in `portfolioContent.js`:
  - summary, goal, primary technologies, and current status
  - architecture diagram placeholder/image fallback, service flow, architecture explanation, and system layers
  - challenge/solution/outcome engineering challenge cards
  - documentation hub cards
- Kept supporting project modal content populated through fallbacks from existing project fields.
- Preserved Project AI workspace behavior and modal open/close behavior.
- Preserved language switching and dark/light theme controls.
- Preserved `/ask-rag`, visitor counter, backend files, navbar, hero, contact, AI assistant, and Portfolio case-study cards.

Verification:

```bash
cd frontend-Vite
npm run lint
npm run build
```

Result:

- `npm run lint` passed.
- `npm run build` passed.

### 2026-06-04 — Project Modal Shared Layout Stabilization

Completed:

- Consolidated the Project Modal tab content into shared layout rules in `App.css`.
- Kept the modal shell centered and stable across `Overview`, `Architecture`, `Challenges`, and `Documentation`.
- Kept header and tab controls fixed inside the modal while only the tab content area scrolls.
- Normalized modal section cards, nested documentation/system-layer cards, gaps, padding, border radius, border color, and background behavior.
- Removed modal AI layout dependencies from the modal frame; the global Ask AI assistant remains independent and layered above the modal.
- Preserved project card behavior, project data, `/ask-rag`, visitor counter behavior, backend files, and global AI assistant behavior.

Verification:

```bash
cd frontend-Vite
npm run lint
npm run build
```

Result:

- `npm run lint` passed.
- `npm run build` passed.

### 2026-06-04 — Unified Project Modal Tab Rendering

Completed:

- Performed a root-cause pass on Project Modal layout drift across all project cards.
- Normalized all modal tabs to the same rendering hierarchy:
  - `project-modal`
  - `project-modal-header`
  - `project-modal-tabs`
  - `project-workspace`
  - `project-tab-panel`
  - `project-tab-stack`
  - `project-modal-card`
- Used the Challenges tab card stack as the reference pattern.
- Updated Overview, Architecture, and Documentation to use the same shared tab stack and shared card/grid classes.
- Made the modal shell height stable while keeping `project-tab-panel` as the only scrollable modal container.
- Standardized tab button sizing through one grid-based tab row.
- Preserved project data, project card behavior, global Ask AI behavior, `/ask-rag`, visitor counter behavior, and backend files.

Verification:

```bash
cd frontend-Vite
npm run lint
npm run build
```

Result:

- `npm run lint` passed.
- `npm run build` passed.

### 2026-06-05 — Project Modal Footprint Adjustment

Completed:

- Increased the Project Modal desktop footprint from the previous `1120px` cap to a wider `95vw` / `1400px` bounded shell.
- Reduced backdrop padding to tighten the empty space around the centered modal.
- Increased modal vertical footprint while preserving the existing header, tab, content, and scroll behavior.
- Kept mobile sizing guarded against horizontal overflow.

Verification:

```bash
cd frontend-Vite
npm run lint
npm run build
```

Result:

- `npm run lint` passed.
- `npm run build` passed.

### 2026-06-05 — Persistent RAG Chat Session ID

Completed:

- Feature completed:
  - Persistent Firestore Chat History frontend session support.
- Previous state:
  - Frontend stored conversation history only in browser memory.
  - History disappeared after page refresh.
- Added persistent assistant `session_id` management in `src/hooks/useAssistantChat.js`.
- Stored the active chat session ID in `localStorage` with key:

```text
portfolioAssistantSessionId
```

- Updated `src/api/chat.js` so each `/ask-rag` request can include `session_id`.
- Sent `session_id` with every `/ask-rag` request.
- Preserved visible local chat messages for UI rendering.
- Kept recent local history as backend fallback compatibility.
- Added New Chat behavior that clears local visible messages and creates a new session ID.
- Existing Firestore conversations remain stored.
- Preserved project modal behavior, visitor counter behavior, portfolio cards, and existing assistant UI structure.

Backend dependency:

- Persistent message storage is handled by the GCP backend in Firestore:

```text
conversations/{session_id}/messages/{message_id}
```

Verification:

```bash
cd frontend-Vite
npm run lint
npm run build
```

Result:

- `npm run lint` passed.
- `npm run build` passed.

Next planned assistant UX feature:

- Completed next: Frontend Streaming Response Support.

### 2026-06-05 — Production CloudFront AI Assistant Connection Fix

Completed:

- Investigated the live production site:
  - `https://dvzu3s2gq6iw.cloudfront.net`
- Confirmed production frontend loaded successfully.
- Confirmed visitor counter continued to work.
- Confirmed production JavaScript bundle contained:
  - `gcp-rag-backend-189047029621.asia-east1.run.app`
  - `/ask-rag-stream`
  - `/ask-rag`
- Confirmed the frontend was no longer failing before `fetch()`.
- Browser console showed runtime network failures:
  - streaming request failed with `TypeError: Failed to fetch`
  - fallback `/ask-rag` request also failed with `TypeError: Failed to fetch`

Root cause:

- Backend CORS did not allow the production CloudFront origin:
  - `https://dvzu3s2gq6iw.cloudfront.net`
- This caused browser requests from production CloudFront to be blocked before the backend response could be read.

Backend fix:

- Added production CloudFront origin to backend CORS defaults.
- Updated backend Cloud Run deployment workflow to set `CORS_ALLOWED_ORIGINS`.
- Fixed gcloud comma-separated env-var syntax with custom delimiter escaping.
- Redeployed backend to:
  - `gcp-rag-backend-00012-pbg`

Live browser verification:

- Opened the deployed CloudFront site.
- Opened the AI assistant.
- Submitted:

```text
Explain my RAG architecture
```

- Result:
  - assistant sent the request successfully
  - assistant returned a grounded RAG response
  - citations and sources rendered
  - previous connection error did not recur

Verification commands:

```bash
npm --prefix frontend-AWS run lint
npm --prefix frontend-AWS run build
```

Result:

- `npm --prefix frontend-AWS run lint` passed.
- `npm --prefix frontend-AWS run build` passed.

Commits:

- `47e1aa9` — backend CORS fix and regression test.
- `c0b52f8` — Cloud Run deployment env-var delimiter fix.

### 2026-06-05 — Frontend Streaming Response Support

Completed:

- Added streaming assistant support for:
  - `POST /ask-rag-stream`
- Added `streamAskRag(...)` in `src/api/chat.js`.
- Implemented manual POST-compatible SSE parsing with:
  - `response.body.getReader()`
  - `TextDecoder`
  - buffered event parsing
  - CRLF normalization for streamed frames
- Updated `src/hooks/useAssistantChat.js` so streaming is attempted first.
- Preserved `/ask-rag` fallback if streaming fails.
- Preserved:
  - `session_id`
  - `portfolioAssistantSessionId`
  - Firestore chat history behavior
  - source rendering from metadata
  - New Chat behavior
- Updated `src/components/ChatPanel.jsx` so streamed answer text renders while loading.
- Removed temporary visible debug UI after verification.

Browser verification:

- Used Playwright against:
  - `http://localhost:5173`
- Test question:
  - `Explain my RAG architecture`
- Network result:
  - frontend called `POST /ask-rag-stream`
  - request payload included `session_id`
  - response was `text/event-stream`
  - `/ask-rag` fallback was not called on the successful stream path
- UI result:
  - answer text visibly grew before the request completed
  - sources rendered from metadata
  - final answer remained after `done`
  - `portfolioAssistantSessionId` remained in `localStorage`

Verification:

```bash
cd frontend-Vite
npm run lint
npm run build
```

Result:

- `npm run lint` passed.
- `npm run build` passed.

### 2026-06-05 — Near Full-Screen Project Modal

Completed:

- Converted the Project Modal footprint from a large centered card to a near full-screen modal.
- Kept the backdrop overlay and close button behavior.
- Reduced backdrop margin to a thin `10px` frame around the modal.
- Removed desktop width and height caps so the modal uses `calc(100vw - 20px)` and `calc(100svh - 20px)`.
- Preserved the fixed header/tabs and internal tab-panel scrolling behavior.
- Preserved project data, project cards, global Ask AI behavior, backend/API/RAG behavior, and visitor counter behavior.

Verification:

```bash
cd frontend-Vite
npm run lint
npm run build
```

Result:

- `npm run lint` passed.
- `npm run build` passed.

## Current Design Direction

Keep the frontend:

- minimal
- recruiter-friendly
- cloud/SaaS inspired
- compact and dashboard-oriented
- readable in light and dark mode
- free of flashy animations
- free of unnecessary UI libraries

Avoid:

- large decorative hero redesigns
- neon/glow-heavy styling
- new UI dependencies for simple behavior
- mixing API calls directly into page JSX
- growing `Home.jsx` into another long-term monolith

## Current Frontend Verification

```bash
cd frontend-Vite
npm run lint
npm run build
```

Both passed after the latest Project Modal shared layout stabilization.

Local development convention:

- The developer runs the Vite server manually.
- Use `http://localhost:5173` for local frontend testing.
- Reuse the existing development server when it is available.
- Do not start a second Vite server or use a fallback port such as `5174`.

## Frontend Next Steps

- Keep frontend stable while backend is modularized.
- Consider removing unused starter files/assets later.
- Add frontend tests only when behavior becomes complex enough to justify them.
- Keep documentation updated after meaningful changes.

React Frontend Development Log

## 2026-06-05 - Modal, Portfolio Navigation, and Language Defaults

Scope: frontend-only update in `frontend-AWS`.

Changes:

- Refined the project modal from a near-full-page shell into a centered premium workspace panel at roughly 90vw and up to 88svh on desktop.
- Preserved internal modal scrolling, backdrop close behavior, dark/light theme support, and Project AI workspace behavior.
- Confirmed the modal information architecture uses four tabs: Overview, Architecture, Challenges, Documentation.
- Updated the portfolio section identity from `projects` to `portfolio` so the visible Portfolio navbar item, anchor target, and active section tracking match.
- Changed the initial website language from English to Traditional Chinese (`zh-TW`) while preserving the EN / 繁中 switch.

Files modified:

- `frontend-AWS/src/pages/Home.jsx`
- `frontend-AWS/src/hooks/useScrollTracker.js`
- `frontend-AWS/src/components/Navbar.jsx`
- `frontend-AWS/src/App.css`
- `frontend-AWS/scripts/capture-screenshots.mjs`
- `Statement_MD/CAPSTONE_PROJECT_STATE.md`
- `Statement_MD/REACT_Frontend_Development_Log.md`

Validation:

- `npm run lint` passed.
- `npm run build` passed.
- Browser screenshots captured under `frontend-AWS/screenshots/` using the built frontend at `http://localhost:5173`.
- Screenshot automation confirmed default Traditional Chinese content, EN / 繁中 language switching, Portfolio `is-active` navbar state, desktop modal size `1280px x 880px` in a `1440px x 1000px` viewport, and narrow modal size `370px x 800px`.
- Existing CI/CD workflows were inspected; no workflow changes were required.
- Production CloudFront URL returned HTTP 200 for comparison only; no deployment was performed.

Screenshot evidence:

- `01-home-zh-tw.png` - Home page loaded in Traditional Chinese; verifies `zh-TW` default.
- `02-navbar-portfolio-active.png` - Portfolio navbar active state; verifies section anchor and underline behavior.
- `03-portfolio-overview.png` - Portfolio section overview; verifies section scroll target and layout continuity.
- `04-capstone-card.png` - Capstone portfolio card; verifies existing card layout and click target are preserved.
- `05-modal-overview.png` - Project modal Overview tab; verifies compact modal shell and overview content.
- `06-modal-architecture.png` - Architecture tab; verifies architecture diagram area, service flow, and system layers.
- `07-modal-challenges.png` - Challenges tab; verifies challenge/problem/solution/outcome structure.
- `08-modal-documentation.png` - Documentation tab; verifies documentation hub cards.
- `09-project-ai-workspace.png` - Project AI workspace open; verifies assistant panel remains available with modal context.
- `10-mobile-modal.png` - Mobile/narrow modal layout; verifies responsive modal sizing and internal scrolling.

## 2026-06-05 - AI Assistant Panel UX Refinement

Scope: AI Assistant panel only in `frontend-AWS`.

Changes:

- Replaced the AI panel backdrop blur with a dim-only overlay so the panel visually relates to the project modal without glassmorphism.
- Changed the new-chat control from `+` to `↻` and updated the tooltip/label to Start New Chat.
- Added request lifecycle timing with whole-second status messages inside the conversation area: Analyzing question, Retrieving context, Generating answer, and Response generated in Ns / Failed after Ns.
- Added Enter-to-send and Shift+Enter newline behavior while preserving empty-message and loading-state safeguards.
- Tightened AI panel typography, message spacing, suggestion spacing, composer sizing, and header spacing.
- Reduced AI panel open/resize motion to subtle 220-240ms transitions.

Files modified:

- `frontend-AWS/src/components/ChatPanel.jsx`
- `frontend-AWS/src/hooks/useAssistantChat.js`
- `frontend-AWS/src/pages/Home.jsx`
- `frontend-AWS/src/content/portfolioContent.js`
- `frontend-AWS/src/App.css`
- `frontend-AWS/scripts/capture-ai-panel-screenshots.mjs`
- `Statement_MD/REACT_Frontend_Development_Log.md`

Validation:

- `npm run lint` passed.
- `npm run build` passed.
- Browser screenshot automation confirmed no overlay blur, dim background, refresh/new-chat clearing behavior, Shift+Enter newline behavior, Enter-to-send behavior, and `Response generated in 4s`.
- Screenshot automation used deterministic local interception of the RAG stream for UI timing evidence only; production `/ask-rag` and Cloud Run integration code were not modified.

Screenshot evidence:

- `ai-01-panel-closed.png` - AI panel closed; verifies default page state.
- `ai-02-panel-open.png` - AI panel open; verifies panel position and compact styling.
- `ai-03-dim-background.png` - Dim background effect; verifies overlay without blur.
- `ai-04-analyzing-question.png` - Analyzing question stage; verifies first processing state.
- `ai-05-retrieving-context.png` - Retrieving context stage; verifies second processing state.
- `ai-06-generating-answer.png` - Generating answer stage; verifies third processing state.
- `ai-07-response-generated.png` - Response generated message; verifies elapsed response timer.
- `ai-08-refresh-icon-visible.png` - Refresh icon visible; verifies `↻` new-chat control.
- `ai-09-enter-to-send.png` - Enter-to-send working example; verifies keyboard send behavior.
- `ai-10-mobile-ai-panel.png` - Mobile AI panel layout; verifies narrow viewport usability.

## 2026-06-06 - AI Assistant Publish Validation

Scope: final frontend validation before commit/push/deploy for the AI chatbox UI pass.

Changes confirmed:

- AI chatbox messages use compact spacing and readable typography.
- Assistant response status is inside the assistant card header beside the `GCP RAG` label.
- Expanded AI panel content width now tracks the expanded panel instead of staying constrained to collapsed width.
- Refresh/new-chat, close, expand/collapse, Enter-to-send, Shift+Enter newline, Sources Used, response timer, error timer, streaming-first request behavior, and `/ask-rag` fallback are preserved.
- No backend files, visitor counter files, or deployment workflow files were modified.

Files changed:

- `frontend-AWS/src/App.css`
- `frontend-AWS/src/components/ChatPanel.jsx`
- `frontend-AWS/src/content/portfolioContent.js`
- `frontend-AWS/src/hooks/useAssistantChat.js`
- `frontend-AWS/scripts/capture-ai-panel-screenshots.mjs`
- `frontend-AWS/scripts/capture-screenshots.mjs`
- `Statement_MD/CAPSTONE_PROJECT_STATE.md`
- `Statement_MD/REACT_Frontend_Development_Log.md`

Validation:

- `npm run lint` passed in `frontend-AWS`.
- `npm run build` passed in `frontend-AWS`.

## 2026-06-26 - Portfolio Project Markdown Content Audit

Scope: Frontend content and documentation only.

Changes:

- Created `frontend-AWS/src/content/projects/PROJECT_CONTENT_AUDIT.md` to compare active `portfolioContent.js` project IDs against Markdown documentation folders.
- Archived older project Markdown folders outside the repo under `/Users/jarrett6796/Desktop/portfolio-project-docs-archive/`:
  - `ec2-apache-website`
  - `jenkins-cicd`
  - `recipe-sharing-app`
- Added bilingual Markdown documentation for:
  - `url-shortener`
  - `qr-code-generator`
  - `real-time-application`
  - `video-streaming-platform`
- Marked new non-implemented project docs as `Status: Planned / Documentation Placeholder`.
- Updated `frontend-AWS/src/content/projectDocs.js` so active portfolio IDs load the new Markdown folders, including `real-time-chat` -> `real-time-application`.

Files changed:

- `frontend-AWS/src/content/projectDocs.js`
- `frontend-AWS/src/content/projects/PROJECT_CONTENT_AUDIT.md`
- `frontend-AWS/src/content/projects/url-shortener/**`
- `frontend-AWS/src/content/projects/qr-code-generator/**`
- `frontend-AWS/src/content/projects/real-time-application/**`
- `frontend-AWS/src/content/projects/video-streaming-platform/**`
- `Statement_MD/REACT_Frontend_Development_Log.md`

Notes:

- The UI was not redesigned.
- Backend code was not modified.
- Archived folders were moved, not deleted.
- Stale mappings for archived projects remain in `projectDocs.js` pending a later approved cleanup.

Validation:

- `npm run build` passed in `frontend-AWS`.
- `npm run lint` passed in `frontend-AWS`.
- Playwright opened the new project documentation modals through the local Vite dev server and reported no Markdown warning blocks or Markdown/Mermaid console errors during the checked render path.
- Local browser test evidence used `http://127.0.0.1:5173`.
- General regression screenshot automation confirmed Traditional Chinese default, language switch, Portfolio active state, capstone card/modal opening, modal tabs, mobile modal, and AI workspace availability.
- AI screenshot automation confirmed status stages, success timer, error timer, expanded chat width, refresh/new-chat, Sources Used, Enter-to-send, Shift+Enter newline, mobile AI panel, and dim overlay without blur.
- Expanded AI measurement: panel `1110px`, assistant card `1104px`, composer `1094px`.

Screenshot evidence:

- `01-home-zh-tw.png`
- `02-navbar-portfolio-active.png`
- `04-capstone-card.png`
- `05-modal-overview.png`
- `09-project-ai-workspace.png`
- `10-mobile-modal.png`
- `ai-compact-collapsed-messages.png`
- `ai-04-analyzing-question.png`
- `ai-05-retrieving-context.png`
- `ai-06-generating-answer.png`
- `ai-07-response-generated.png`
- `ai-error-failed-after.png`
- `ai-expanded-wide-chatbox.png`
- `ai-expanded-input-area.png`
- `ai-08-refresh-icon-visible.png`
- `ai-09-enter-to-send.png`
- `ai-10-mobile-ai-panel.png`

## 2026-06-06 - AI Chat Source ID Labels

Scope: small frontend-only display fix for the visible AI chat history source list.

Changes:

- Updated `frontend-AWS/src/components/ChatPanel.jsx` to render each source item with a visible source ID label such as `[S1]`.
- Added a shared source-list renderer used by both visible chat history messages and the legacy single-response branch.
- Source rows now show source ID, filename, and heading or chunk fallback in one compact line.
- Preserved per-message source grouping under each assistant response.
- Preserved streaming, visible chat history, `session_id`, New Chat, response status, and `/ask-rag` fallback behavior.
- Backend files were not modified.

Files changed:

- `frontend-AWS/src/components/ChatPanel.jsx`
- `frontend-AWS/src/App.css`
- `Statement_MD/CAPSTONE_PROJECT_STATE.md`
- `Statement_MD/GCP_RAG_PROJECT_STATE.md`
- `Statement_MD/GCP_RAG_DEVELOPMENT_LOG.md`
- `Statement_MD/REACT_Frontend_Development_Log.md`

Validation:

- `npm run lint` passed in `frontend-AWS`.
- `npm run build` passed in `frontend-AWS`.
- Browser verification at `http://localhost:5173/` submitted a real assistant question, expanded Sources Used under the assistant message, and confirmed source rows rendered labels such as `[S1]`, `[S2]`, and `[S3]`.

## 2026-06-06 - Project Modal Overview Cleanup

Scope: small Project Modal content cleanup across shared Overview rendering.

Changes:

- Removed the repeated `Primary Technologies` card from the Project Modal Overview tab.
- Kept Project Summary, Goal, Current Status, Key Features, Business Value, Results, and other existing Overview content.
- Kept project technology tags visible in the modal header.
- Preserved Architecture, Challenges, Documentation tabs, modal sizing, modal scroll behavior, backend, AI assistant, visitor counter, and portfolio card layout.

Files changed:

- `frontend-AWS/src/components/ProjectModal.jsx`
- `frontend-AWS/src/App.css`

Validation:

- `npm run lint` passed in `frontend-AWS`.
- `npm run build` passed in `frontend-AWS`.

## 2026-06-06 - Assistant Per-Message Status Cleanup

Scope: frontend-only AI assistant state and response card label cleanup.

Changes:

- Replaced assistant response card label `Response` with `GCP RAG`.
- Changed response status from one global `chatStatus` rendered in every assistant message to per-message `status` stored on the active assistant message.
- Historical assistant messages now keep their final generated/failed status and do not update when a later response is running.
- Preserved `/ask-rag-stream`, `/ask-rag` fallback, Firestore session ID behavior, backend routes, visitor counter, and modal layout.

Files changed:

- `frontend-AWS/src/hooks/useAssistantChat.js`
- `frontend-AWS/src/components/ChatPanel.jsx`

Validation:

- Before browser verification on deployed CloudFront reproduced the repeated-status behavior.
- After browser verification on local `localhost` showed `GCP RAG` labels and separate frozen response statuses.
- Before screenshot: `/private/tmp/assistant-status-before.png`
- After screenshot: `/private/tmp/assistant-status-after.png`
- `npm run lint` passed in `frontend-AWS`.
- `npm run build` passed in `frontend-AWS`.

## 2026-06-06 - Query Rewrite System Message Visibility Guard

Scope: frontend display safeguard for backend Advanced RAG Phase 1 query rewriting.

Changes:

- Added a visible role filter in `frontend-AWS/src/components/ChatPanel.jsx`.
- Chat history rendering now displays only `role = user` and `role = assistant`.
- Backend `role = system` query rewrite audit messages remain hidden from the frontend UI.
- No chat bubble styling, streaming behavior, `GCP RAG` label behavior, New Chat behavior, source rendering, or `portfolioAssistantSessionId` behavior changed.

Backend context:

- The GCP backend can optionally rewrite vague follow-up questions into standalone retrieval queries before embedding and retrieval.
- Original user messages remain unchanged.
- Rewritten queries are stored only as backend Firestore system audit messages when a rewrite is used.

Validation:

- `npm run lint` passed in `frontend-AWS`.
- `npm run build` passed in `frontend-AWS`.

## 2026-06-10 - Project Modal Stability Refinement

Scope: shared Project Modal layout refinement for the portfolio case-study modal.

Changes:

- Set the shared Project Modal shell to fixed viewport-bounded dimensions so Overview, Architecture, Challenges, and Documentation no longer resize the modal.
- Kept the modal header, close/language/theme controls, and tab navigation outside the scrolling region.
- Preserved independent scrolling on the tab content panel only.
- Removed technology, service, and skill tag badges from the modal header across all project modals.
- Tightened internal spacing around the title/header, tab row, content panel, cards, grids, and architecture diagram area while preserving readability.
- Added scroll-to-top behavior when switching tabs so each selected tab starts at the top of its content.

Files changed:

- `frontend-AWS/src/components/ProjectModal.jsx`
- `frontend-AWS/src/App.css`
- `Statement_MD/REACT_Frontend_Development_Log.md`

Screenshot evidence:

- Before screenshots captured in `frontend-AWS/screenshots/modal-before/`:
  - `modal-overview-before.png`
  - `modal-architecture-before.png`
  - `modal-challenges-before.png`
  - `modal-documentation-before.png`
- After screenshots captured in `frontend-AWS/screenshots/modal-after/`:
  - `modal-overview-after.png`
  - `modal-architecture-after.png`
  - `modal-challenges-after.png`
  - `modal-documentation-after.png`
  - `modal-scrollable-content.png`
  - `modal-fixed-header.png`
  - `modal-fixed-tabs.png`

Browser verification:

- Production before check at `https://dvzu3s2gq6iw.cloudfront.net/` showed Overview at `1280x558` and the other tabs at `1280x880`, confirming the modal height jump.
- Local after check at `http://127.0.0.1:5173/` showed all desktop tabs at `1280x880`.
- Local mobile check showed all tabs at `370x824`.
- Modal shell remained `overflow: hidden`.
- Tab panel remained `overflow-y: auto`.
- Header and tabs stayed fixed while the content panel scrolled.
- Technology tag count in the modal header was `0`.
- Switching tabs after scrolling reset the content panel from `420px` back to `0px`.

Validation:

- `npm run lint` passed in `frontend-AWS`.
- `npm run build` passed in `frontend-AWS`.

## 2026-06-16 - Project Modal Documentation Portal Refactor

Scope: Project Modal information architecture and documentation viewer in `frontend-AWS`.

Changes:

- Replaced the old top tab row with a Docusaurus/GitBook-style documentation portal layout.
- Replaced page-based navigation with three markdown-style document contexts:
- Replaced hardcoded documentation blocks inside `ProjectModal.jsx` with standalone markdown files loaded through `src/content/projectDocs.js`.
- Each project now uses three markdown files:
  - `overview.md`
  - `architecture.md`
  - `implementation.md`
- Added a left sidebar with user-controlled collapsible categories:
  - Overview
  - Architecture
  - Implementation
- Category clicks expand or collapse the sidebar group without changing the active document.
- Section links load the correct document if needed and smoothly scroll to anchors inside the current document.
- Added section anchors such as Project Summary, Features, Architecture Diagram, System Module, Workflow, Technology Stack, Frontend, Backend, GCP-RAG, Database, API, Network, Security, Deployment, CI/CD, IaC, Monitoring, and Troubleshooting.
- Added centralized bilingual navigation labels in `src/content/projectDocsNavigation.js` so sidebar labels and section headings can render in English or Traditional Chinese without hardcoding display text inside navigation components.
- Added reusable Project Modal documentation components:
  - `ProjectDocsSidebar.jsx`
  - `ProjectDocsViewer.jsx`
  - `MarkdownContent.jsx`
- Added markdown-style rendering support for headings, paragraphs, lists, tables, code blocks, blockquotes, links, and image/diagram figures.
- Added a markdown parser that converts headings into section anchors and preserves fenced code language metadata, including future `mermaid` blocks.
- Removed `project-doc-viewer-header`; markdown section headings now own document titles.
- Reduced the sidebar width moderately and added smooth dropdown animation for collapsible groups.
- Preserved the fixed modal shell and content-only scrolling behavior from the previous stability refinement.
- Kept language switching, theme switching, close behavior, project card behavior, global AI assistant behavior, AWS visitor counter behavior, and backend API behavior unchanged.
- Updated screenshot automation to navigate the new sidebar section anchors instead of old tab roles.

Files changed:

- `frontend-AWS/src/components/ProjectModal.jsx`
- `frontend-AWS/src/components/ProjectDocsSidebar.jsx`
- `frontend-AWS/src/components/ProjectDocsViewer.jsx`
- `frontend-AWS/src/components/MarkdownContent.jsx`
- `frontend-AWS/src/content/projectDocs.js`
- `frontend-AWS/src/content/projectDocsNavigation.js`
- `frontend-AWS/src/content/projects/*/*.md`
- `frontend-AWS/src/pages/Home.jsx`
- `frontend-AWS/src/App.css`
- `frontend-AWS/scripts/capture-screenshots.mjs`
- `Statement_MD/CAPSTONE_PROJECT_STATE.md`
- `Statement_MD/REACT_Frontend_Development_Log.md`
- `FRONTEND_ENGINEERING_REPORT.md`

Validation:

- `npm run lint` passed in `frontend-AWS`.
- `npm run build` passed in `frontend-AWS`.
- Browser verification at `http://127.0.0.1:5173/` confirmed the capstone modal opens with no old tab roles, a two-column desktop docs layout, a stacked mobile/narrow layout, category clicks that do not navigate content, section clicks that load and scroll to Architecture/Implementation anchors, English and Traditional Chinese navigation labels, markdown-style content rendering, and a scrollable right-side content viewer.

## 2026-06-16 - Markdown-Driven Documentation Navigation

Scope: Project Modal documentation source of truth in `frontend-AWS`.

Changes:

- Removed duplicated sidebar structure from `src/content/projectDocsNavigation.js`.
- Changed markdown loading to use language-specific project folders under `src/content/projects/<project>/<language>/`.
- Added frontmatter titles to markdown files so document group labels are stored with the documentation content.
- Changed section navigation generation to read top-level `#` headings directly from the active markdown file.
- Added Traditional Chinese markdown files for every current project so the sidebar can reflect the active language without a separate translation map.
- Updated `ProjectModal.jsx`, `ProjectDocsSidebar.jsx`, and `ProjectDocsViewer.jsx` to render document and section labels from parsed markdown data.
- Preserved the existing modal shell, sidebar collapse behavior, smooth section scrolling, and markdown rendering flow.

Files changed:

- `frontend-AWS/src/content/projectDocs.js`
- `frontend-AWS/src/components/ProjectModal.jsx`
- `frontend-AWS/src/components/ProjectDocsSidebar.jsx`
- `frontend-AWS/src/components/ProjectDocsViewer.jsx`
- `frontend-AWS/src/content/projects/*/{en,zh-TW}/*.md`
- `Statement_MD/CAPSTONE_PROJECT_STATE.md`
- `Statement_MD/REACT_Frontend_Development_Log.md`
- `FRONTEND_ENGINEERING_REPORT.md`

Validation:

- `npm run lint` passed in `frontend-AWS`.
- `npm run build` passed in `frontend-AWS`.
- `node scripts/capture-screenshots.mjs` passed in `frontend-AWS`, confirming Traditional Chinese default content, EN and 繁中 switching, modal sizing, Architecture > 工作流程 navigation, Implementation > 安全性 navigation, and Troubleshooting navigation.

## 2026-06-17 - Technical Markdown Renderer Enhancements

Scope: Project Modal markdown rendering in `frontend-AWS`.

Changes:

- Added Docusaurus-style admonition parsing with `:::` blocks.
- Supported callout types: `note`, `info`, `tip`, `warning`, `danger`, `success`, `aws`, and `gcp`.
- Added AWS and GCP branded callout accents using `#FF9900` and `#4285F4`.
- Added Mermaid rendering for fenced `mermaid` code blocks.
- Lazy-loaded the Mermaid dependency so the main app bundle does not eagerly load the diagram engine.
- Added plain text workflow rendering for fenced `text` blocks.
- Kept blockquote rendering separate from callout rendering.
- Added dark-mode-compatible styling for callouts, Mermaid diagrams, and workflow blocks.
- Added capstone architecture markdown examples for AWS/GCP callouts, Mermaid workflow, and plain text workflow rendering.

Validation:

- `npm run lint` passed in `frontend-AWS`.
- `npm run build` passed in `frontend-AWS`; Vite reports a large lazy Mermaid parser chunk, which is expected for the Mermaid dependency.
- `node scripts/capture-screenshots.mjs` passed in `frontend-AWS`.
- Local dev server verification at `http://127.0.0.1:5174/` confirmed one AWS callout, one GCP callout, one rendered Mermaid SVG, one workflow block, one separate blockquote, zero blockquotes inside callouts, and zero browser console errors.
- The local `npm run dev` server was stopped after verification.

## 2026-06-18 - Project Documentation Markdown Readability Pass

Scope: Project documentation markdown rendering and readability inside the Project Modal in `frontend-AWS`.

Changes:

- Added Docusaurus/GitBook-style code block frames with language labels and documentation-oriented spacing.
- Added lightweight local syntax highlighting for common project documentation languages:
  - `js`
  - `jsx`
  - `python`
  - `bash`
  - `json`
  - `yaml`
  - `html`
  - `css`
  - `md`
- Kept fenced `text` blocks as workflow-style blocks, but moved them onto theme-aware code-frame styling so they remain readable in light and dark mode.
- Added light-mode and dark-mode CSS tokens for code backgrounds, code headers, code text, workflow text, and syntax token colors.
- Preserved whitespace and added horizontal scrolling for wide code and workflow blocks.
- Adjusted Mermaid rendering configuration for larger, less cramped diagrams:
  - disabled Mermaid `useMaxWidth`
  - increased flowchart padding
  - increased node and rank spacing
  - set a stable diagram font family and font size
- Adjusted Mermaid container CSS so diagrams are slightly larger, responsive inside the modal, and scrollable when wider than the viewer.
- Changed Mermaid SVG styling to avoid forcing diagrams into a small max-width box and to allow visible overflow around SVG groups, labels, text, and `foreignObject` content.
- Tuned markdown typography by slightly reducing heading/body sizes, improving line-height, tightening paragraph defaults, and reducing excessive section gaps.
- Kept the existing Project Modal shell, sidebar behavior, markdown file structure, gallery behavior, callout behavior, global AI assistant, backend API behavior, and deployment files unchanged.

Cause:

- Code fences previously rendered through a single generic `pre` style with no syntax token rendering or code-frame structure.
- Workflow `text` blocks shared basic styling that did not provide enough theme-aware contrast.
- Mermaid SVGs were being constrained by wrapper sizing and `max-width: 100%`, which could compress node boxes enough for labels such as `APIService` and `CloudFront` to clip.
- Markdown typography inside the modal was readable but slightly oversized and loose for dense technical documentation.

Files changed:

- `frontend-AWS/src/components/MarkdownContent.jsx`
- `frontend-AWS/src/App.css`
- `Statement_MD/REACT_Frontend_Development_Log.md`

Dependencies:

- No new dependencies were added.

Validation:

- `npm run lint` passed in `frontend-AWS`.
- `npm run build` passed in `frontend-AWS`.
- Vite still reports the existing large lazy Mermaid/parser chunk warning during build.

## 2026-06-18 - Mermaid Diagram Sizing Correction

Scope: Mermaid diagram sizing only inside the Project Modal documentation viewer in `frontend-AWS`.

Reason for follow-up:

- The previous clipping fix preserved Mermaid labels by increasing diagram spacing and removing restrictive SVG sizing.
- That solved clipped labels such as `APIService` and `CloudFront`, but it also made diagrams too large in the modal.
- Large diagrams consumed too much vertical space and made documentation pages require excessive scrolling.

Changes:

- Reduced Mermaid flowchart spacing while keeping enough padding for node labels:
  - `nodeSpacing`: `54` -> `38`
  - `rankSpacing`: `58` -> `42`
  - `padding`: `20` -> `14`
- Reduced Mermaid sequence diagram margins:
  - `boxMargin`: `12` -> `10`
  - `diagramMarginX`: `28` -> `20`
  - `diagramMarginY`: `18` -> `14`
- Reduced Mermaid theme font size:
  - `15px` -> `13px`
- Centered Mermaid diagrams in the modal content area.
- Replaced the unbounded SVG sizing with responsive caps:
  - SVG `max-width`: `min(100%, 1000px)`
  - SVG `max-height`: `min(520px, 62svh)`
- Removed the previous `620px` minimum diagram width so Mermaid diagrams no longer stretch or force a large footprint by default.
- Kept `htmlLabels: false`, `useMaxWidth: false`, SVG `overflow: visible`, and visible overflow on SVG groups/labels/text so node labels remain fully visible.
- Kept horizontal overflow support on the Mermaid container with `overflow-x: auto`.

Files changed:

- `frontend-AWS/src/components/MarkdownContent.jsx`
- `frontend-AWS/src/App.css`
- `Statement_MD/REACT_Frontend_Development_Log.md`

Not changed:

- Sidebar behavior
- Modal layout
- Markdown file structure
- Code block styling
- Callouts
- Gallery rendering
- Backend code
- Deployment files

Validation:

- `npm run lint` passed in `frontend-AWS`.
- No screenshots were run, per task scope.
- No build was run, per task scope.

## 2026-06-18 - Light Theme Code Block Softening

Scope: Light-theme code block readability inside the Project Modal documentation viewer in `frontend-AWS`.

Changes:

- Softened light-mode code block colors to reduce visual heaviness.
- Updated light-theme code block tokens:
  - `--markdown-code-bg`: `#fafbfc`
  - `--markdown-code-header`: `#f4f6f8`
  - `--markdown-code-ink`: `#2d3748`
  - `--markdown-code-muted`: `#7b8794`
- Softened light-theme syntax highlighting colors for comments, functions, keywords, numbers, properties, selectors, strings, and tags.
- Reduced the code block header visual weight in light mode:
  - smaller header font size
  - lighter font weight
  - reduced letter spacing
  - reduced vertical padding
  - softer header border
- Kept dark-mode code block styling unchanged by adding explicit dark-theme overrides for the previous header size, weight, spacing, padding, border, and shadow.
- Preserved syntax highlighting, markdown rendering logic, modal layout, sidebar behavior, callouts, gallery rendering, Mermaid rendering, backend code, and deployment files.

Files changed:

- `frontend-AWS/src/App.css`
- `Statement_MD/REACT_Frontend_Development_Log.md`

Validation:

- `npm run lint` passed in `frontend-AWS`.
- No screenshots were run.
- No build was run.

## 2026-06-18 - Performance Optimization Phase A: Recipe Implementation Split Proof of Concept

Scope: Recipe Sharing App project documentation only.

Problem:

- Phase 1 deferred inactive document parsing, but selecting the Recipe Sharing App `implementation.md` could still lag because the file remained very large.
- The implementation document previously mixed frontend, backend, database, network, compute, traffic, security, deployment, IaC, CI/CD, monitoring, and troubleshooting sections in one active markdown render.

Change:

- Split the existing top-level `# Frontend` section into `frontend-AWS/src/content/projects/recipe-sharing-app/en/frontend.md`.
- Split the existing top-level `# Backend` section into `frontend-AWS/src/content/projects/recipe-sharing-app/en/backend.md`.
- Left the remaining content, beginning at `# Database`, inside `frontend-AWS/src/content/projects/recipe-sharing-app/en/implementation.md`.
- Updated the project document registry so Recipe Sharing App English docs load in this order:

```text
Overview
Architecture
Frontend
Backend
Implementation
```

Implementation details:

- The markdown renderer was not changed.
- Mermaid, gallery, columns, callouts, syntax highlighting, tables, and existing markdown parsing behavior were preserved.
- Extra Recipe Sharing App documents are added only when `frontend.md` and `backend.md` exist for the active language.
- Other projects and missing translations keep the original document set: `overview`, `architecture`, and `implementation`.

Size impact:

- Previous Recipe Sharing App English `implementation.md`: about `2968` lines.
- New `frontend.md`: `322` lines.
- New `backend.md`: `505` lines.
- New remaining `implementation.md`: `2148` lines.
- Selecting the remaining Implementation document now avoids rendering the moved Frontend and Backend sections, reducing that active document by about `820` lines, or roughly `28%`.

Assessment:

- This confirms document size is a material bottleneck when a large markdown file is selected.
- It does not eliminate all lag because the remaining implementation document still contains many Mermaid diagrams, tables, and code blocks.

Validation:

- `npm run lint` passed in `frontend-AWS`.
- No screenshots were run.
- No build was run.

## 2026-06-18 - Light Theme Code Block Inner Background Fix

Scope: Project documentation code block inner background in light theme only.

Issue:

- The code block wrapper and language header were softened, but the nested `<code>` element could still show the global `code { background: var(--code-bg) }` styling from `src/index.css`.
- On systems using a dark preferred color scheme, that global `--code-bg` value could make the actual code area appear black even while the Project Modal was in light theme.

Changes:

- Overrode the nested project markdown code selector:
  - `.project-markdown-code`
  - `.project-markdown-code code`
- Set `.project-markdown-code` to use `background: var(--markdown-code-bg)` so the visible code body uses the soft documentation background.
- Reset the nested `<code>` element to:
  - `background: transparent`
  - `color: inherit`
  - `padding: 0`
  - `border-radius: 0`
- Preserved syntax token colors because token spans still render inside the nested `<code>` element.
- Kept dark theme code blocks dark because `--markdown-code-bg` and `--markdown-code-ink` still switch under `:root[data-theme="dark"]`.

Files changed:

- `frontend-AWS/src/App.css`
- `Statement_MD/REACT_Frontend_Development_Log.md`

Not changed:

- Modal layout
- Sidebar behavior
- Markdown files
- Mermaid rendering
- Gallery rendering
- Backend code

Validation:

- No screenshots were run.
- No build was run.

## 2026-06-18 - Project Docs Performance Investigation

Scope: Investigation only for the project documentation modal slowdown after adding Markdown `columns` support.

Findings:

- No code fixes were applied in this pass.
- Current markdown content does not yet contain any ` ```columns ` blocks, so the new columns renderer is not actively rendering author-written column layouts yet.
- `MarkdownContent.jsx` does not parse markdown strings during render; it renders already-parsed block trees.
- `ProjectModal.jsx` memoizes `getProjectDocuments(selectedProject, language)`, so markdown parsing runs on selected project or language changes rather than on every React render.
- The main performance pressure appears to come from eager parsing and full rendering of large documentation documents, especially `frontend-AWS/src/content/projects/recipe-sharing-app/en/implementation.md`.
- That implementation document is unusually large:
  - about `2968` lines
  - `103` fenced blocks
  - `33` Mermaid diagrams
  - `26` text workflow blocks
  - `28` bash blocks
  - `471` table rows
- `getProjectDocuments` parses all three project documents immediately: `overview`, `architecture`, and `implementation`.
- When the large implementation document is active, all Mermaid blocks in that document mount at once.
- Each `MermaidDiagram` currently imports Mermaid, initializes Mermaid, and renders its SVG in an effect.
- `CodeBlock` calls `highlightCode(...)` directly during render, so active-document rerenders can retokenize code blocks.
- The Project Modal scroll listener updates `activeSectionId`, which can trigger rerenders while scrolling.
- Gallery rendering does not appear to be the performance root cause. Current content only has one gallery block, and no gallery is inside a columns block.

Root cause assessment:

- The columns feature exposed or made more noticeable an existing scalability bottleneck in the project docs renderer.
- The bottleneck is not the columns grid layout itself.
- The likely root cause is the combination of eager full-document parsing, full active-document rendering, many Mermaid diagrams mounting at once, and render-time syntax highlighting in large markdown documents.

Potential future fixes to consider:

- Parse only the active document instead of all three project documents.
- Cache parsed markdown by project, language, and document ID.
- Memoize code highlighting results inside `CodeBlock`.
- Lazy-render Mermaid diagrams near the viewport or defer Mermaid rendering until visible.
- Consider section-level rendering for very large implementation documents.

Files changed:

- `Statement_MD/REACT_Frontend_Development_Log.md`

Validation:

- Investigation only.
- No screenshots were run.
- No build was run.
- No source code was changed for this investigation record.

## 2026-06-18 - Performance Optimization Phase 1: Active Document Loading

Scope: Project documentation modal loading strategy in `frontend-AWS`.

Problem:

- Opening a project modal parsed all three project documents immediately:
  - `overview.md`
  - `architecture.md`
  - `implementation.md`
- This made modal open slower for projects with very large implementation docs, especially Recipe Sharing App.

Previous loading flow:

```text
Open Project Modal
-> getProjectDocuments(...)
-> parse overview.md
-> parse architecture.md
-> parse implementation.md
-> render active document
```

New loading flow:

```text
Open Project Modal
-> parse lightweight outlines for sidebar labels
-> parse overview.md blocks only

User selects Architecture
-> parse architecture.md blocks

User selects Implementation
-> parse implementation.md blocks
```

Changes:

- Replaced the single eager full-document loader with two separate document-loading paths:
  - `getProjectDocumentOutlines(...)`
  - `getProjectDocument(...)`
- `getProjectDocumentOutlines(...)` parses only frontmatter and top-level `#` headings for all three docs so the sidebar keeps the same labels and section navigation.
- `getProjectDocument(...)` performs full block parsing only for the active document.
- `ProjectModal.jsx` now uses sidebar outlines for navigation and a separate memoized active-document parse for the viewer.
- Preserved sidebar behavior, section navigation, language switching, markdown rendering, Mermaid, gallery, callouts, code blocks, and modal layout.

Files changed:

- `frontend-AWS/src/content/projectDocs.js`
- `frontend-AWS/src/components/ProjectModal.jsx`
- `Statement_MD/REACT_Frontend_Development_Log.md`

Estimated performance impact:

- Modal open should avoid full parsing of inactive architecture and implementation documents.
- For Recipe Sharing App, opening the modal on Overview avoids immediately full-parsing the roughly `2968` line implementation document with many Mermaid diagrams, code blocks, workflow blocks, and tables.
- Implementation parsing is deferred until the user selects an Implementation section.

Tradeoffs:

- Sidebar outlines still scan all three markdown files for frontmatter and top-level headings so navigation remains unchanged.
- Raw markdown files are still available through the current Vite raw import setup; this phase optimizes full markdown block parsing, not bundle-level markdown fetching.
- The selected active document is still fully rendered once selected. Mermaid-specific lazy rendering and section-level rendering remain future optimization phases.

Validation:

- `npm run lint` passed in `frontend-AWS`.
- No screenshots were run.
- No build was run.

## 2026-06-18 - Markdown Hardening Cleanup

Scope: Simplification pass after reviewing commit `228a8b7` for markdown documentation hardening.

Changes:

- Kept active-document loading, Mermaid fallback behavior, image fallback behavior, markdown warning logs, and invalid-block parser guards.
- Changed unclosed fenced block recovery so the parser skips only the broken fence marker instead of discarding the rest of the section.
- Changed unclosed callout recovery so the parser skips only the broken callout opener instead of discarding the rest of the section.
- Removed the custom syntax-highlighting tokenizer from `MarkdownContent.jsx`.
- Removed the unused `columns` block parser, renderer, and CSS.
- Replaced per-block render error boundaries with one section-level boundary around the markdown block renderer.
- Changed missing-image warnings from `Gallery image missing` to `Image missing`.
- Made gallery item keys stable when the same image path appears more than once.
- Removed duplicate missing-section warnings from outline parsing.
- Updated `frontend-AWS/src/content/projects/MARKDOWN_AUTHORING_GUIDE.md` so code blocks document language labels rather than syntax highlighting.

Files changed:

- `frontend-AWS/src/content/projectDocs.js`
- `frontend-AWS/src/components/MarkdownContent.jsx`
- `frontend-AWS/src/App.css`
- `frontend-AWS/src/content/projects/MARKDOWN_AUTHORING_GUIDE.md`
- `Statement_MD/REACT_Frontend_Development_Log.md`
- `Statement_MD/CAPSTONE_PROJECT_STATE.md`

Validation:

- `npm run lint` passed in `frontend-AWS`.
- `npm run build` passed in `frontend-AWS`.

---

2026-06-26 — AWS Frontend Integration & Backend Repository Milestone

Overview

Today’s work focused on completing the AWS frontend integration, validating all production API endpoints, resolving frontend integration issues, and exporting the AWS backend implementation into the repository to prepare for the next Infrastructure as Code (Terraform) phase.

This milestone marks the completion of the core AWS serverless application implementation and establishes a version-controlled source of truth for the AWS backend.

⸻

Objectives

Today’s objectives were:

- Complete AWS Contact Form frontend integration.
- Verify Website View Counter integration.
- Verify Project View Counter integration.
- Standardize frontend environment variables.
- Resolve API Gateway CORS issues.
- Export deployed AWS backend into the local repository.
- Prepare the project for Terraform migration.

⸻

Frontend Integration

Contact Form

Completed:

- Added reusable src/api/contact.js.
- Connected the React Contact Form to the AWS Contact API.
- Integrated API Gateway endpoint using environment variables.
- Added frontend validation.
- Updated localized success and error messages.
- Verified successful contact submission.

Architecture:

React Contact Form
│
▼
API Gateway
│
▼
CloudResumeContactHandler
│
▼
Amazon DynamoDB
│
▼
Amazon SQS
│
▼
CloudResumeEmailHandler
│
▼
Amazon SES

Validation:

- Browser testing
- curl testing
- DynamoDB verification
- SES email delivery verification

Result:

Contact submissions are now fully operational from both local development and production.

⸻

Website View Counter

Completed:

- Verified visitor counter API.
- Fixed frontend environment variable regression.
- Confirmed React integration.
- Verified browser rendering.
- Confirmed DynamoDB updates.

Validation:

GET /views

Verified through:

- Browser
- curl
- React application

⸻

Project View Counter

Completed:

- Verified project analytics API.
- Confirmed DynamoDB project counters.
- Verified frontend API integration.
- Confirmed project view increment endpoint.

Validated routes:

GET /projects/{projectId}
POST /projects/{projectId}/view

Notes:

A single Lambda currently serves both website and project analytics.

Project view counts intentionally remain hidden from the public portfolio UI.

⸻

API Gateway

CORS

Resolved browser CORS issues affecting the Contact Form.

Allowed Origins:

- http://localhost:5173
- http://localhost:5174
- https://aws-cloudresume-gcprag-jarrett.cc

Allowed Methods:

- POST
- OPTIONS

Allowed Headers:

- content-type

Validation completed using browser testing and curl preflight requests.

⸻

Environment Variable Standardization

The frontend AWS environment variables were standardized.

Current variables:

VITE_GCP_RAG_API_URL
VITE_AWS_VISITOR_API_URL
VITE_AWS_PROJECTS_API_BASE_URL
VITE_AWS_CONTACT_API_URL

Completed:

- Updated .env.example.
- Removed deprecated variable names.
- Updated frontend API modules.
- Verified local and production configurations.

A regression caused by two environment variables being merged onto a single line in .env was identified and resolved.

⸻

AWS Backend Repository

A new repository structure was created:

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

The AWS backend repository now contains:

- Exported Lambda source code.
- Lambda runtime configuration.
- IAM roles.
- IAM policies.
- API Gateway documentation.
- Backend architecture documentation.
- Module README files.

This repository now serves as the source of truth for the manually implemented AWS backend and will be used as the implementation baseline for the future Terraform migration.

⸻

Validation

Completed validation:

- npm run lint
- npm run build
- Browser verification
- curl endpoint verification
- DynamoDB verification
- SES verification
- API Gateway verification
- Lambda verification

All production APIs were successfully validated.

⸻

Engineering Outcome

Today’s work completed the remaining AWS frontend integrations and significantly improved the maintainability of the project by bringing the deployed AWS backend under version control.

The repository now consists of three primary engineering components:

frontend-AWS/
backend-AWS/
backend-GCP/

This architecture clearly separates frontend development, AWS serverless services, and the GCP-based RAG platform while preparing the project for Infrastructure as Code.

⸻

Current Frontend Status

Completed:

- React + Vite Portfolio
- AWS S3 + CloudFront Hosting
- Website View Counter
- Project View Counter
- Contact Form
- AI Workspace
- Project Documentation Viewer
- Streaming GCP RAG Assistant

Planned:

- Event Notification Module
- Terraform Infrastructure as Code
- CloudWatch Monitoring
- Additional frontend testing
- Performance optimization

⸻

Next Phase

The frontend implementation is now considered feature-complete for the current milestone.

Future work will focus on:

1. Terraform migration.
2. CloudWatch dashboards and alarms.
3. Event Notification Module.
4. Monitoring and observability improvements.
5. Frontend testing enhancements.
6. Infrastructure documentation refinement.

---

# 2026-06-26 — Frontend UI Finalization & AWS Frontend Integration

## Overview

Today's development focused on two frontend milestones:

1. Finalizing the portfolio user interface and user experience.
2. Completing the remaining AWS frontend integrations.

The frontend is now considered feature-complete for the current project scope, allowing future development to focus on infrastructure, monitoring, and Infrastructure as Code.

---

# Frontend UI Finalization

## Objective

Complete the remaining visual refinements and stabilize the frontend user interface before shifting development toward backend engineering and cloud infrastructure.

---

## Project Modal

Completed:

- Finalized Project Modal layout.
- Achieved consistent modal dimensions across all tabs.
- Improved documentation readability.
- Improved spacing and visual hierarchy.
- Refined responsive layout behavior.
- Finalized Overview and Architecture pages.
- Removed duplicated technology tags beneath project titles.
- Improved overall visual consistency.

Result:

The Project Modal now provides a stable and consistent reading experience regardless of document length.

---

## Documentation Viewer

Completed:

- Finalized documentation navigation.
- Improved Markdown rendering experience.
- Improved sidebar usability.
- Refined typography and spacing.
- Improved documentation reading workflow.
- Completed current UI refinements.

Result:

The documentation system now provides a clean technical documentation experience suitable for presenting project architecture and implementation details.

---

## AI Workspace

Completed:

- Finalized workspace layout.
- Improved overall interaction flow.
- Refined workspace organization.
- Completed current UI adjustments.

Result:

The AI Workspace has reached a stable design suitable for demonstration and future feature expansion.

---

# AWS Frontend Integration

## Contact Form

Completed:

- Integrated React Contact Form with the AWS backend.
- Added reusable `src/api/contact.js`.
- Connected API Gateway endpoint using environment variables.
- Improved frontend validation.
- Updated localized success and error messages.
- Verified end-to-end submission flow.

Result:

The Contact Form is now fully operational in both local development and production environments.

---

## Website View Counter

Completed:

- Verified frontend API integration.
- Fixed environment variable configuration.
- Confirmed visitor count rendering.
- Validated production endpoint.

Result:

Website visitor analytics are now fully integrated into the frontend.

---

## Project View Counter

Completed:

- Verified frontend API integration.
- Confirmed project analytics endpoints.
- Validated project view tracking.

Result:

Project analytics integration is complete and functioning correctly.

---

# Environment Variable Standardization

Completed:

- Standardized AWS frontend environment variable names.
- Updated `.env.example`.
- Removed deprecated variable names.
- Updated frontend API modules.
- Verified local and production configurations.

Current frontend environment variables:

```text
VITE_GCP_RAG_API_URL
VITE_AWS_VISITOR_API_URL
VITE_AWS_PROJECTS_API_BASE_URL
VITE_AWS_CONTACT_API_URL
```

A local configuration issue caused by incorrectly formatted `.env` entries was identified and resolved during testing.

---

# Validation

Completed validation:

- npm run lint
- npm run build
- Browser testing
- API Gateway endpoint verification
- Contact Form verification
- Website View Counter verification
- Project View Counter verification
- CORS verification

All frontend integrations passed validation successfully.

---

# Current Frontend Status

## Portfolio UI

- ✅ Responsive React + Vite application
- ✅ Bilingual interface
- ✅ Light / Dark theme
- ✅ Project Modal
- ✅ Documentation Viewer
- ✅ AI Workspace

## AWS Integration

- ✅ Website View Counter
- ✅ Project View Counter
- ✅ Contact Form

## GCP Integration

- ✅ Streaming AI Assistant
- ✅ RAG-based project Q&A
- ✅ Markdown response rendering

---

# Next Frontend Phase

With the current frontend implementation considered stable, future work will focus on:

- Event Notification frontend integration.
- CloudWatch monitoring visualization.
- Additional frontend testing.
- Performance optimization.
- Accessibility improvements.
- Minor UI polish as needed.

No further large-scale frontend redesign is currently planned.

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

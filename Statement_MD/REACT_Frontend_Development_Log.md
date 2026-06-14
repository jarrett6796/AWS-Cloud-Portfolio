# Frontend Development Log

This file is the frontend history and current frontend state record. It tracks how the portfolio evolved from a single-file MVP into a modular React + Vite portfolio application.

For the overall project source of truth, see `CAPSTONE_PROJECT_STATE.md`.

## Current Frontend Status

The frontend is now modularized and production-style enough to support continued work without growing `App.jsx` into a monolith.

Latest backend security note:

- `POST /ingest-docs` is now admin-token protected on the GCP backend.
- No React assistant behavior changed.
- The public frontend still uses `POST /ask-rag-stream` first and `/ask-rag` as fallback.
- The GCP backend now supports optional Advanced RAG Phase 1 query rewriting before retrieval.
- Rewritten queries are backend-only retrieval/audit data and are not displayed in the frontend.
- `ChatPanel.jsx` filters visible chat messages to `user` and `assistant` roles so Firestore `system` audit messages cannot appear if server-loaded messages are added later.

## Advanced RAG Roadmap — Phase 1 to Phase 5

Frontend context:

```text
The portfolio assistant currently sits on an Intermediate RAG backend with several advanced RAG features implemented.
```

The current RAG system is beyond naive RAG because it already includes Cloud Run FastAPI, Vertex AI Gemini 2.5 Flash, `text-embedding-005`, Firestore `document_chunks`, Firestore `conversations`, Markdown-aware chunking, content hashing, chunk metadata, score thresholds, candidate pool retrieval, optional hybrid keyword + vector scoring, optional heuristic reranking, grounded source IDs, persistent chat history, optional conversation-aware query rewriting, streaming responses, protected `/ingest-docs`, structured logging, and health checks.

It is not fully production-grade Advanced RAG yet because retrieval still scans Firestore in memory and the system does not yet include a managed vector index, multi-query retrieval, a real semantic reranker, a monitoring/analytics dashboard, GraphRAG, or Agentic RAG.

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

1. Enable and validate query rewriting in deployed Cloud Run when ready
2. Chunk overlap and token-aware chunking
3. Citation validation
4. Multi-query retrieval
5. No-answer confidence handling
6. Project analytics / monitoring dashboard
7. Firestore Vector Search or Vertex AI Vector Search
8. GraphRAG / Agentic RAG only after the core system is stable.

Current structure:

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

### `hooks/useAssistantChat.js`

Owns assistant question, loading, streamed answer, source, error state, local visible messages, fallback behavior, and persistent RAG `session_id` state.

### `hooks/useTheme.js`

Owns global theme state and `document.documentElement.dataset.theme` behavior.

### `hooks/useScrollTracker.js`

Owns scroll percentage and active section detection.

### `components/ChatPanel.jsx`

Owns homepage floating assistant presentation.

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

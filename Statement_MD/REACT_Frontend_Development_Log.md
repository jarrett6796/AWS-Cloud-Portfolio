# Frontend Development Log

This file is the frontend history and current frontend state record. It tracks how the portfolio evolved from a single-file MVP into a modular React + Vite portfolio application.

For the overall project source of truth, see `CAPSTONE_PROJECT_STATE.md`.

## Current Frontend Status

The frontend is now modularized and production-style enough to support continued work without growing `App.jsx` into a monolith.

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

Owns the `/ask-rag` frontend API call.

### `api/visitors.js`

Owns the visitor counter API call.

### `hooks/useAssistantChat.js`

Owns assistant question, loading, answer, source, and error state.

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

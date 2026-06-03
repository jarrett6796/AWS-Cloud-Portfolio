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

Both passed after the latest extraction phase.

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

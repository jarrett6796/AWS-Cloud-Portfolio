# Project State

## Purpose

This project is a frontend portfolio for an AWS Cloud Engineer capstone: **Cloud Resume + Lambda RAG Assistant**. The current frontend is a recruiter-facing, cloud/SaaS-style React + Vite portfolio with bilingual content, dark/light mode, project detail modals, and an integrated project AI workspace.

This document is the single source of truth for continuing frontend work in future sessions.

## Current Tech Stack

- React with Vite
- JavaScript
- Plain CSS in `src/App.css`
- No Tailwind yet
- No external UI libraries
- No backend/API calls yet
- UI-only AI assistant behavior
- Current editable frontend files are primarily:
  - `src/App.jsx`
  - `src/App.css`

## Design Language

The frontend should remain:

- Minimalist
- Recruiter-friendly
- Cloud engineering / SaaS inspired
- Compact and dashboard-oriented
- More AWS Console / Vercel / GitHub Codespaces than landing-page marketing
- Soft cloud-gray, clean, and structured in light mode
- Slate / blue-gray, layered, and readable in dark mode
- Inter-based typography with clear recruiter-friendly SaaS/dashboard readability

Avoid:

- Flashy animations
- Neon/glow-heavy effects
- Large decorative hero/marketing layouts
- Overly rounded card-heavy visual noise
- Redundant UI controls
- New libraries for simple UI behavior

## Current Layout

Main page sections:

1. Hero
2. About
3. Skills
4. Projects
5. Contact

The previous large standalone architecture frame was removed. Architecture now belongs inside project details.

### Hero

- Single CTA only: `View Projects`
- The previous redundant `Explore Project Details` CTA was removed.
- Hero should stay compact, focused, and recruiter-readable.

### About

- Asymmetrical layout is preserved:
  - Left: larger personal introduction
  - Right: calmer supporting background/details
- The layout should remain clean, technical, and not text-heavy.

### Projects

- Shows 3 project cards by default.
- `More Projects` reveals 2 additional projects.
- Project cards stay compact and resume-style:
  - title
  - short description
  - AWS service tags
  - details button
- Project detail content belongs inside the modal.

### Contact

- Technical contact form UI only.
- Fields:
  - Name
  - Email
  - Subject
  - Message
- No backend/API behavior.

## Global UI Behavior

### Navbar

- Sticky glass-style navbar.
- Compact height and spacing.
- Links:
  - About
  - Skills
  - Projects
  - Contact
- Includes:
  - EN / 繁中 switcher
  - icon-only theme toggle
  - views counter
  - scroll progress bar integrated into navbar bottom edge
- Active section detection uses scroll/section visibility and applies a subtle active nav underline/accent.

### Views Counter

- Frontend-only.
- Represents a page visit, not clicks.
- It increments once on page load.
- It must not increment when users click buttons, nav links, project cards, modal controls, or chat controls.
- Future backend direction:
  - API Gateway -> Lambda -> DynamoDB

### Language Switching

- Supported options:
  - `EN`
  - `繁中`
- Language state is global and shared by navbar and modal controls.
- Main page text, project modal text, and assistant UI text update from the same content model.

### Theme Switching

- Dark/light mode is global.
- Navbar and modal controls use the same global theme state.
- Current icon behavior:
  - `☾` when light mode is active, meaning switch to dark
  - `☀` when dark mode is active, meaning switch to light

## Dark / Light Mode Direction

### Light Mode

Light mode should feel like a soft AWS/cloud SaaS dashboard rather than a pure-white document.

Current direction:

- Page background: soft cloud gray, currently around `#f5f7fb`
- Elevated surfaces/cards/forms/modals: white
- Borders: soft blue-gray, currently around `#dbe3ee`
- Accent: restrained AWS/cloud blue
- Text: high-contrast ink with readable muted secondary copy

Keep light mode clean and structured. Avoid making the page feel gray, heavy, or low-contrast.

### Dark Mode

Dark mode was intentionally shifted away from pure black into a modern slate/cloud dashboard feel.

Layering direction:

- Page background: darkest
- Cards/forms: slightly lighter
- Modals/chat/panels: elevated slate / blue-gray surfaces
- Inner cards/panels: layered but not high-contrast
- Borders: soft blue-gray
- Accent: restrained cloud blue
- Text: bright white-gray primary and readable muted secondary

Dark mode should feel like infrastructure software, not a gaming UI.

## Typography Direction

Inter is now the selected primary UI font.

Typography should remain:

- Compact
- Highly readable
- Recruiter-friendly
- SaaS/cloud dashboard oriented
- Consistent across navbar, hero, cards, modals, AI workspace, forms, and buttons

Do not introduce expressive display fonts or typography treatments that make the portfolio feel like a marketing landing page.

## Button System Direction

Buttons should feel like one cohesive design system across light and dark mode.

Current direction:

- Primary actions use restrained AWS/cloud blue.
- Secondary controls use quiet dashboard surfaces with soft blue-gray borders.
- Hover/focus states use subtle border, accent, shadow, and small lift changes.
- Navbar controls, language switcher, theme toggle, project buttons, modal buttons, chat controls, and AI controls should share the same visual language.
- The floating `Ask AI` launcher is aligned with the overall button system and should not look like a separate widget style.

Avoid gradients, glow effects, large scaling, redundant controls, or flashy button motion.

## Project Modal System

Project detail modals are the main technical storytelling surface.

### Modal Header

- Shows only project title.
- Project category labels were removed:
  - no `FLAGSHIP PROJECT`
  - no `AI EXTENSION`
  - no category badges
- Title size should remain workspace-like, not hero-like.

### Modal Header Controls

Controls are compact and aligned beside the close button:

- EN / 繁中
- Theme icon toggle
- X close button

These controls use the same global language and theme state as the navbar.

Close behavior:

- click outside modal
- ESC
- top-right X

### Project Modal Tabs

Current content tabs:

- Overview
- Architecture
- Tech Stack
- Lessons Learned

Tab transitions should remain subtle.

### Architecture Visualization

Inside modal tabs, architecture is shown as service flow blocks rather than a large standalone page block.

Example style:

`CloudFront -> S3 -> API Gateway -> Lambda -> DynamoDB`

Service tags and architecture blocks can highlight each other on hover/focus. The interaction should stay lightweight and professional.

## Integrated AI Workspace System

The project workflow now uses an integrated modal workspace instead of competing floating systems.

### Normal Website AI

Outside project modals:

- Floating AI launcher exists for general website usage.
- Floating chat sidebar exists for general capstone/portfolio context.
- This is UI-only.

Inside project modal workflow:

- Floating launcher is suppressed.
- Floating sidebar is suppressed.
- AI is integrated directly into the modal workspace.

This avoids overlapping systems and keeps project exploration unified.

## AI Workspace States

The project modal workspace has three layout states.

### A. AI Closed

Ratio:

`100 / 0`

Behavior:

- Project content uses full modal width.
- AI panel is hidden.

### B. AI Open

Ratio:

`70 / 30`

Behavior:

- Project content remains primary.
- AI appears as a supporting assistant panel.
- This is the default open state.

### C. AI Expanded

Ratio:

`40 / 60`

Behavior:

- AI becomes the dominant technical workspace.
- Project side remains visible but becomes slightly lower priority.
- No blur.
- No opacity fade-out.
- Only subtle contrast/saturation reduction is acceptable.

## AI Control System

Current desired modal AI controls:

### Closed

`[ AI Assistant ]`

Clicking the full button opens the AI panel.

### Open

`[ AI Assistant ] [⤡]`

- `AI Assistant` closes the AI panel.
- `⤡` expands the workspace to the AI-focused ratio.

### Expanded

`[ AI Assistant ] [⤢]`

- `AI Assistant` closes the AI panel.
- `⤢` restores the normal 70/30 layout.

Tooltip system was removed. Do not reintroduce hover popups for these controls unless explicitly requested.

AI Assistant open/close transitions should feel smooth and professional:

- subtle button hover lift
- subtle border/accent change
- soft shadow transition
- smooth layout ratio transition between `100 / 0`, `70 / 30`, and `40 / 60`

Preserve dashboard-like motion. Do not add bouncing, glow effects, large scaling, duplicated controls, new icons, or tooltip behavior.

## AI Panel Structure

The integrated AI panel should be minimal.

Keep only:

- Suggested Questions
- Sample response area
- Chat input/composer area

Do not show:

- `CURRENT CONTEXT`
- repeated project title
- large `AI Assistant` title inside panel
- duplicated AI controls

Suggested Questions should default to only 3 visible project prompts.

Current examples:

- Explain this architecture.
- Why use serverless?
- Describe deployment flow.

The assistant remains UI-only. No backend/API calls yet.

## Floating AI Launcher

Outside project modals, the launcher is a compact vertical IDE dock.

Default:

```text
Ask
AI
```

Hover on normal website:

```text
Ask AI
About Site
```

If project modal behavior is active, floating launcher should not appear. Project AI is handled inside the modal workspace.

Launcher visual direction:

- developer sidebar dock
- VS Code / Copilot inspired
- glass surface
- subtle shadow
- quiet premium interaction

## Interaction Philosophy

Interactions should be:

- subtle
- predictable
- fast
- professional
- dashboard-like

Allowed:

- small hover lift
- border/accent change
- subtle shadow increase
- light panel slide-in
- smooth layout ratio transition
- smooth AI Assistant open/close transitions

Avoid:

- bouncing
- neon glow
- large scaling
- flashy animated effects
- floating particles
- redundant controls

## Responsive Behavior

Desktop:

- Project modal can become split workspace when AI panel is open.
- Ratios should follow 100/0, 70/30, 40/60.

Mobile/tablet:

- Do not force desktop split layout.
- AI panel stacks below project content or behaves as a tabbed section.
- Preserve compact spacing and readable text.

## UX Priorities

1. Recruiter scanability
2. Cloud engineering credibility
3. Technical clarity
4. Minimalist visual hierarchy
5. Responsive usability
6. No backend assumptions in UI copy
7. Avoid redundant controls and repeated context

## Current Stable Checkpoint

Latest checkpoint before this document:

```text
b5ae400 remove AI tooltip system
```

Current working tree after that checkpoint includes the tooltip removal refinement:

- tooltip rendering removed
- `data-tooltip` removed
- tooltip CSS removed
- AI expand button remains functional
- build and lint passed after the change

Recent checkpoint history:

```text
b5ae400 remove AI tooltip system
5e91571 refine AI assistant interaction controls
df4a0c8 refine integrated AI workspace sizing system
43e5a65 refine integrated AI workspace UI
f47421f convert floating AI into integrated workspace panel
6f419c1 fix AI launcher visibility and modal interaction flow
```

## Verification Standard

After UI changes, run:

```bash
npm run build
npm run lint
```

If frontend behavior changes, manually test:

- EN / 繁中 switching
- dark/light mode
- navbar active section
- project modal open/close
- modal tabs
- AI Assistant open/close
- AI expand/restore
- mobile modal behavior

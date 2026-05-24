# Frontend Development Log

This journal tracks the recent frontend evolution of the Cloud Resume + Lambda RAG Assistant portfolio. The focus has been to move from a traditional portfolio homepage toward a compact, recruiter-friendly engineering workspace that presents AWS project work, technical architecture, and an integrated AI assistant experience without adding backend dependencies yet.

## 2026-05-22 - Portfolio Foundation and Cloud Resume Direction

### 1. Objective
Establish a clean AWS Cloud Engineer portfolio homepage for the capstone project using React + Vite and plain CSS.

### 2. UI/UX Improvements
- Built the initial portfolio structure around Hero, About, Skills, Projects, Architecture, and Contact sections.
- Chose a white, minimal cloud/SaaS visual direction with clear hierarchy and recruiter-friendly scanning.
- Avoided decorative complexity so the page could stay focused on cloud engineering credibility.

### 3. Technical Changes
- Replaced the default React app content with a custom single-page portfolio layout.
- Used plain CSS instead of Tailwind during the early phase to keep the implementation simple and maintainable.
- Kept the frontend UI-only with no backend or API calls.

### 4. Problems Encountered
- The first challenge was balancing portfolio presentation with technical depth.
- A large standalone architecture section risked making the page feel heavy and template-like.

### 5. Solutions Implemented
- Used section-based content with concise copy and AWS-focused terminology.
- Treated architecture as a core theme, but kept the first iteration visually restrained.

### 6. Design Decisions & Reasoning
- Prioritized a cloud/SaaS aesthetic over a personal branding-heavy landing page.
- Kept the layout approachable for recruiters while still signaling serverless and AWS architecture knowledge.

### 7. Lessons Learned
- A portfolio for cloud engineering works best when the technical story is easy to scan before asking users to read deeply.
- Plain CSS was sufficient for early layout control and reduced framework overhead.

### 8. Next Steps
- Add interaction layers carefully: language switching, theme support, progress feedback, project details, and an AI assistant shell.

## 2026-05-23 - Bilingual UI, Theme State, and Assistant Shell

### 1. Objective
Add UI-only interaction features without introducing backend dependencies or external libraries.

### 2. UI/UX Improvements
- Added English and Traditional Mandarin language switching with `EN` and `繁中` options.
- Added light/dark mode support.
- Added a scroll progress indicator.
- Added an initial floating chatbot-style assistant UI.

### 3. Technical Changes
- Introduced React state for language, theme, chat visibility, scroll progress, and UI-only assistant behavior.
- Centralized bilingual text content so the main page and assistant copy could switch together.
- Kept all behavior inside `App.jsx` and styling inside `App.css`.

### 4. Problems Encountered
- The first assistant pattern felt generic and separate from the portfolio.
- The early scroll percentage label created visual noise.
- Initial views counter behavior counted clicks, which did not match the intended meaning of page visits.

### 5. Solutions Implemented
- Continued iterating on the assistant from a floating bubble toward a more developer-tool-inspired interaction.
- Removed the scroll percentage badge later and merged progress into the navbar bottom edge.
- Updated the views counter logic later to increment once on page load using `useEffect`.

### 6. Design Decisions & Reasoning
- Language and theme were kept as global UI states because they affect the entire page and modal system.
- Backend-facing features were represented only as UI placeholders, avoiding misleading API behavior before serverless integration exists.

### 7. Lessons Learned
- Interaction affordances need to match the portfolio context. A generic chatbot can weaken a technical dashboard feel.
- UI-only state should still model future backend behavior accurately enough to avoid rework.

### 8. Next Steps
- Refine projects into stronger technical evidence and move deeper architecture content into project details.

## 2026-05-23 - Project Cards and Modal Storytelling

### 1. Objective
Improve project presentation so each card functions like a compact resume artifact while deeper details live inside modals.

### 2. UI/UX Improvements
- Added five total projects with three visible by default and a `More Projects` button to reveal two more.
- Redesigned project cards into compact professional cards.
- Added AWS service tags and a clear `Details` button.
- Removed heavy standalone architecture blocks from the main page.

### 3. Technical Changes
- Added project data structures with title, description, problem, solution, services, architecture, and technical notes.
- Implemented project modal state and close behavior.
- Added click outside, Escape key, and top-right X close behavior.

### 4. Problems Encountered
- Showing too much project detail directly in cards made the page feel dense.
- A large architecture frame in the main page competed with the project cards.

### 5. Solutions Implemented
- Reduced main cards to title, short description, service tags, and Details.
- Moved problem, solution, architecture, services, and technical notes into the modal.
- Kept architecture visible where it had enough context to be useful.

### 6. Design Decisions & Reasoning
- Recruiters should be able to scan projects quickly, then open details only when interested.
- Architecture belongs inside the project story, not as a large disconnected visual block.

### 7. Lessons Learned
- Compact cards improve perceived polish and make the page feel more engineering-focused.
- Modal details allow technical depth without making the homepage feel overloaded.

### 8. Next Steps
- Improve modal hierarchy, add tabs, and make architecture interactions more meaningful.

## 2026-05-24 - Compact Layout and Recruiter-Focused Refinement

### 1. Objective
Reduce oversized spacing and typography while preserving the existing layout and visual language.

### 2. UI/UX Improvements
- Compacted global section spacing, hero height, card padding, and modal spacing.
- Kept the asymmetrical About layout with a larger personal intro and quieter supporting background.
- Simplified the hero CTA area by keeping only `View Projects`.
- Refined Contact typography to emphasize role availability without feeling oversized.

### 3. Technical Changes
- Adjusted CSS spacing variables, section padding, hero sizing, card gaps, and typography scale.
- Fixed the views counter to increment once on page load instead of on every click.
- Preserved responsive behavior across the compacted layout.

### 4. Problems Encountered
- Earlier layouts had too much vertical breathing room for a technical portfolio.
- The click-based views counter was semantically incorrect.
- Dual hero CTAs created redundant decision points.

### 5. Solutions Implemented
- Reduced spacing by roughly 15-20% while keeping readability intact.
- Used a page-load `useEffect` for frontend-only views tracking.
- Removed the redundant hero detail CTA because project cards already provide detail access.

### 6. Design Decisions & Reasoning
- Recruiter-focused portfolios benefit from tighter information density.
- The hero should establish identity and direction quickly, then move users toward project evidence.

### 7. Lessons Learned
- Compact does not mean cramped. The right balance comes from reducing empty gaps while preserving line height and clear grouping.
- Metrics in the UI should reflect their intended future backend meaning.

### 8. Next Steps
- Add active section awareness, modal tabs, and stronger dark mode hierarchy.

## 2026-05-24 - Navigation, Modal Tabs, and Dark Mode Depth

### 1. Objective
Improve interaction clarity and dark mode quality without redesigning the page.

### 2. UI/UX Improvements
- Added active navbar section highlighting for About, Skills, Projects, and Contact.
- Merged scroll progress into the navbar bottom edge and removed the percentage badge.
- Added modal tabs: Overview, Architecture, Tech Stack, and Lessons Learned.
- Improved dark mode surface depth and contrast.

### 3. Technical Changes
- Added active-section detection with scroll-aware section tracking.
- Added tab state inside the project modal.
- Converted architecture details into visual flow blocks.
- Refined CSS theme tokens for dark mode surfaces, borders, text, accents, buttons, tags, navbar glass, modal, and chat surfaces.

### 4. Problems Encountered
- Dark mode initially felt too similar to light mode and lacked surface layering.
- Some buttons and tags looked awkward against dark backgrounds.
- Modal content needed a cleaner structure for technical storytelling.

### 5. Solutions Implemented
- Made the page background the darkest layer, cards slightly lighter, and modals/chat panels elevated.
- Improved dark-mode text contrast, muted text readability, border visibility, and button states.
- Used tabs to separate project narrative from architecture and stack details.

### 6. Design Decisions & Reasoning
- Dark mode should feel like a modern cloud dashboard, not a flat black theme.
- Tabs make deeper technical content easier to scan and reduce modal reading fatigue.

### 7. Lessons Learned
- Surface layering is more important than simply changing background colors.
- Recruiter readability improves when each modal tab answers a different type of question.

### 8. Next Steps
- Make the assistant feel more connected to project context instead of acting like a generic floating chatbot.

## 2026-05-24 - From Floating Chatbot to Contextual AI Dock

### 1. Objective
Refine the assistant interaction so it feels like part of an engineering workspace.

### 2. UI/UX Improvements
- Iterated from a floating chat bubble to an IDE-style sidebar.
- Reworked the launcher from a long horizontal handle into a compact vertical developer-tool dock.
- Added context-aware launcher text for website context and project modal context.
- Improved launcher dark-mode contrast and hover behavior.

### 3. Technical Changes
- Added assistant context state tied to project modal selection.
- Updated chat prompts based on whether a project modal was open.
- Added open/close and expand/restore behavior for the sidebar in earlier iterations.

### 4. Problems Encountered
- The floating launcher and floating sidebar could overlap or compete with modal content.
- Keeping the launcher visible while chat was open created duplicated controls.
- A generic assistant label did not feel connected to the current project.

### 5. Solutions Implemented
- Hid the launcher when the floating chat sidebar was open.
- Made assistant copy context-aware.
- Preserved launcher access for normal website usage while continuing to evaluate the project-modal workflow.

### 6. Design Decisions & Reasoning
- The assistant should feel like a developer tool, not a marketing chatbot.
- Context-aware prompts make the future RAG assistant feel connected to the portfolio content.

### 7. Lessons Learned
- Floating UI works for global access, but it becomes harder to manage inside modal workflows.
- Context awareness improves perceived intelligence even before backend AI integration exists.

### 8. Next Steps
- Replace floating project AI behavior with an integrated modal workspace.

## 2026-05-24 - Integrated Project AI Workspace

### 1. Objective
Convert project exploration and AI assistance into a unified split-workspace modal experience.

### 2. UI/UX Improvements
- Removed floating AI behavior inside the project modal workflow.
- Added an integrated AI Assistant panel inside the project modal.
- Made the modal behave more like an engineering dashboard workspace.
- Kept floating AI separate for normal website usage only.

### 3. Technical Changes
- Added AI workspace states inside the modal:
  - AI closed: `100 / 0`
  - AI open: `70 / 30`
  - AI expanded: `40 / 60`
- Added smooth layout transitions between project content and AI panel.
- Added responsive behavior so smaller screens do not force the desktop split layout.
- Added contextual suggested questions and sample response area inside the AI panel.

### 4. Problems Encountered
- Floating modal AI controls duplicated launcher behavior.
- Separate sidebar and modal systems created a confusing interaction hierarchy.
- Early AI panel content repeated the current project title and context too often.

### 5. Solutions Implemented
- Integrated AI as a modal workspace panel rather than a separate overlay.
- Removed redundant `Ask AI About This Project` controls from modal content.
- Removed repeated context labels and duplicate AI titles inside the panel.
- Limited suggested questions to three defaults for better scanability.

### 6. Design Decisions & Reasoning
- The project modal is the right place for project-specific AI because it already contains the technical context.
- A split workspace better matches AWS Console, Vercel, GitHub Codespaces, and engineering dashboard patterns.
- The `70 / 30` default keeps project content primary, while `40 / 60` supports deeper AI-assisted technical discussion.

### 7. Lessons Learned
- Integrated workflows are clearer than multiple floating systems when the user is already inside a focused task.
- AI UI should not repeat obvious context; it should make the next action easier.

### 8. Next Steps
- Simplify AI controls, tighten modal typography, and remove remaining visual noise.

## 2026-05-24 - Simplified AI Controls and Current Stable Direction

### 1. Objective
Polish the integrated AI workspace controls and reduce remaining interaction complexity.

### 2. UI/UX Improvements
- Removed project category labels such as `FLAGSHIP PROJECT`, `AI EXTENSION`, and similar badges.
- Reduced project modal title size to feel more like workspace typography than hero typography.
- Simplified AI panel structure to start directly with Suggested Questions.
- Removed tooltip behavior from the expand button because it overflowed near modal edges.

### 3. Technical Changes
- Centralized AI interaction into:
  - `AI Assistant` button toggles the panel open and closed.
  - Expand button appears only when the AI panel is open.
  - Expand icon toggles between normal `70 / 30` and expanded `40 / 60` layouts.
- Removed old plus/minus control logic and duplicated expand controls.
- Removed custom tooltip rendering and tooltip CSS while preserving expand behavior.

### 4. Problems Encountered
- Earlier compact AI controls made only the plus/minus icons clickable, which felt broken.
- Tooltip positioning near the viewport and modal edge introduced unnecessary complexity.
- Category labels and repeated AI headings made the modal feel more like a template than a workspace.

### 5. Solutions Implemented
- Made the full `AI Assistant` control clickable.
- Removed the tooltip system completely.
- Kept icon-only expansion behavior simple and predictable.
- Reduced spacing between AI controls so they read as one grouped control system.

### 6. Design Decisions & Reasoning
- Controls should be obvious by behavior and placement, not dependent on extra tooltip UI.
- The modal should prioritize project content and technical reasoning, with AI as an embedded assistant layer.
- Removing labels and redundant titles improves the engineering-dashboard feel.

### 7. Lessons Learned
- Fewer controls can make a complex interaction feel more powerful if the remaining controls are clear.
- Tooltip systems are not always worth the layout risk in constrained modal environments.
- A portfolio can feel more mature when it removes unnecessary explanation and lets structure carry the interaction.

### 8. Next Steps
- Keep `PROJECT_STATE.md` and this development log updated as source-of-truth documentation.
- Later connect frontend-only views to `API Gateway -> Lambda -> DynamoDB`.
- Later connect the AI workspace to the planned RAG path using `API Gateway -> Lambda -> Bedrock Knowledge Base -> S3 Vectors`.
- Continue verifying build and lint after code changes.

## Current Frontend State

- Tech stack: React + Vite, JavaScript, plain CSS, no external UI libraries.
- Design direction: compact minimalist cloud engineering dashboard.
- Main experience: recruiter-friendly single-page portfolio with project detail modals.
- AI experience: integrated project modal workspace with `100 / 0`, `70 / 30`, and `40 / 60` layout states.
- Theme direction: light mode remains clean and bright; dark mode uses layered navy/slate dashboard surfaces.
- Interaction priorities: subtle transitions, clear controls, compact spacing, project-first storytelling, no flashy animation.
- Current stable checkpoint reference: `b5ae400 remove AI tooltip system`.

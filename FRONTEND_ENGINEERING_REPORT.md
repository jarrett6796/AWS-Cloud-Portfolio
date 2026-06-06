# Frontend Engineering Report

## 1. Executive Summary

This report documents the frontend engineering journey for my cloud engineering portfolio and RAG assistant project. The frontend began as a React and Vite portfolio site and gradually evolved into a production-style portfolio interface connected to AWS serverless services and a GCP Cloud Run RAG backend. The project now combines a recruiter-friendly portfolio UI, bilingual content, dark and light mode, a live AWS visitor counter, a structured project modal system, and a global AI assistant that streams responses from the backend.

The most important frontend engineering outcome was not only the visible website, but the architecture discipline that developed over time. I moved from a growing single-file React implementation into a modular frontend with separated content, hooks, API clients, page composition, and presentation components. I also learned to preserve stable working behavior while improving the UI in small, verifiable steps. This mattered because the frontend was connected to multiple systems: AWS API Gateway, Lambda, DynamoDB, CloudFront, S3, GCP Cloud Run, Firestore, and Vertex AI.

The current frontend demonstrates a complete cloud portfolio experience. It presents project work, opens detailed project documentation through a shared modal architecture, tracks visits through AWS, and provides a working AI assistant that uses streaming RAG responses with visible sources, session persistence, and per-message response status.

## 2. Project Objective

My frontend objective was to build a professional cloud engineering portfolio that could do more than display static resume content. I wanted the site to prove that I could design, ship, and operate a real cloud application surface.

The frontend needed to:

- Present my cloud, serverless, and AI engineering projects clearly.
- Support both English and Traditional Chinese content.
- Provide a dark and light mode without visual regressions.
- Connect to a live AWS visitor counter.
- Integrate with a deployed RAG assistant backend.
- Explain project architecture through a modal documentation system.
- Stay maintainable as the project expanded.

The frontend also needed to support the larger project pivot. The original goal was an AWS Cloud Resume plus AWS Lambda and Bedrock RAG architecture. When the Lambda and Bedrock RAG path became too slow to complete at the current stage, I kept AWS for the deployed visitor counter and pivoted the AI/RAG backend to GCP. The frontend became the integration point between those two cloud tracks.

## 3. Frontend Architecture Overview

The frontend is built with React and Vite. It is deployed as a static web application through an AWS static hosting path using S3, CloudFront, and HTTPS. It also calls two backend families: the AWS visitor counter and the GCP RAG assistant.

```text
Browser
  |
  v
CloudFront CDN + HTTPS
  |
  v
S3 static frontend assets
  |
  +--> AWS API Gateway -> Lambda -> DynamoDB
  |        visitor counter
  |
  +--> GCP Cloud Run FastAPI -> Firestore + Gemini
           AI assistant and RAG responses
```

The frontend application is organized around a modular React structure:

```text
frontend app
  src/
    api/
      chat.js
      visitors.js
    components/
      ChatPanel.jsx
      Navbar.jsx
      PortfolioCaseStudies.jsx
      PortfolioSection.jsx
      ProjectModal.jsx
    content/
      portfolioContent.js
    hooks/
      useAssistantChat.js
      useScrollTracker.js
      useTheme.js
    pages/
      Home.jsx
    App.jsx
    App.css
```

The main architectural decision was to keep `App.jsx` thin. Page composition lives in `Home.jsx`, static and bilingual project content lives in `portfolioContent.js`, backend calls live in `api/`, reusable state lives in hooks, and visible UI components are isolated in `components/`.

The AI assistant integration is handled through a layered flow:

```text
ChatPanel.jsx
  -> useAssistantChat.js
  -> api/chat.js
  -> POST /ask-rag-stream
  -> streamed SSE events
  -> progressive response rendering
```

If streaming fails, the frontend preserves a fallback to `POST /ask-rag`. This fallback is important because it keeps the assistant usable if the streaming path fails in a browser, proxy, or deployment environment.

## 4. Development Timeline

### Initial Portfolio Implementation

The project started as a React and Vite portfolio with core sections such as Hero, About, Skills, Projects, Architecture, and Contact. At this stage, the frontend was focused on establishing a professional cloud/SaaS visual direction and a responsive layout.

The early implementation was useful for proving the visual concept, but the code was still growing around a single application file. This later created pressure to modularize the app as more interactive features were added.

### Navigation, Language Support, and Theme State

The next stage added bilingual content, a light/dark mode, scroll progress, and active navigation state. These features made the portfolio more usable and more personal, but they also introduced more state that needed clear ownership.

The language system required portfolio text to be separated from component logic. That decision helped later because project content, modal content, AI suggestions, and labels could be updated without rewriting UI components.

### Project Cards and Modal Storytelling

I added project cards and modal details so each project could explain its problem, solution, architecture, services, and technical notes. The modal became the main project documentation surface inside the frontend.

Over time, the modal evolved from a simple detail view into a structured project documentation workspace with tabs. The current modal tabs are:

- Overview
- Architecture
- Challenges
- Documentation

I removed older tabs such as Tech Stack and Lessons Learned because the redesigned structure better matched portfolio review behavior. Recruiters and technical reviewers need to quickly understand what the project does, how it is built, what problems were solved, and where to find supporting documentation.

### AWS Visitor Counter Integration

The visitor counter connected the frontend to an AWS serverless path:

```text
React Navbar
  -> api/visitors.js
  -> API Gateway
  -> Lambda
  -> DynamoDB
```

This feature turned the portfolio from a static site into a live cloud application. I kept the counter compact in the navbar and isolated the network call in `src/api/visitors.js` so the UI did not directly own API details.

One implementation detail I documented was local React StrictMode behavior. During development, duplicate calls can occur because React intentionally invokes effects more than once to surface unsafe behavior. Documenting that distinction helped avoid confusing local development behavior with production visitor-count issues.

### AI Assistant Shell and RAG Integration

The AI assistant started as a frontend-only shell with suggested prompts. It provided the intended user experience before the backend was ready. After the GCP RAG backend became available, the assistant was wired to `/ask-rag` through `src/api/chat.js`.

The frontend then rendered:

- User questions.
- Loading states.
- Assistant answers.
- Retrieved source metadata.
- Error states when the backend could not be reached.

This was the first point where the frontend became the user-facing client for the GCP RAG system.

### Production-Style Modular Refactor

As the site grew, `App.jsx` became too large to maintain safely. I refactored the frontend in small slices:

- Content extraction.
- Assistant hook extraction.
- Chat panel component extraction.
- Project modal component extraction.
- Visitor API helper extraction.
- Theme hook extraction.
- Scroll tracking hook extraction.
- Section wrapper extraction.
- Navbar extraction.
- Home page composition extraction.

The result was a thin `App.jsx` and clearer module ownership. This refactor preserved behavior and was verified with lint and build checks after each meaningful step.

### Portfolio UI Refinements

The project display evolved from a generic Projects section into a Portfolio section. I tested a gallery-style layout and then replaced it with vertically stacked wide case-study cards. The capstone card, `AWS Cloud Resume + GCP RAG`, became the featured card but kept the same basic shape as the supporting projects.

The final card direction was intentionally restrained:

- Same card structure for every project.
- Capstone distinction limited to an AWS-orange frame and the `CAPSTONE PROJECT` label.
- `View more ->` remains inside the existing card button.
- The existing modal-open behavior is preserved.

This made the portfolio feel more consistent and prevented the capstone card from breaking the interaction model.

### Project Modal Redesign and Stabilization

The modal went through several sizing and layout passes. At one point it became a near full-screen shell; later it was refined into a centered premium workspace panel with controlled width and height. The final layout keeps the header and tabs stable while only the tab content area scrolls.

The most important modal fix was normalizing all tab rendering through the same hierarchy:

```text
project-modal
  project-modal-header
  project-modal-tabs
  project-workspace
    project-tab-panel
      project-tab-stack
        project-modal-card
```

This solved tab-to-tab layout drift. Instead of fixing individual cards one at a time, I fixed the shared rendering layer.

### Streaming Response Support

After the backend added `POST /ask-rag-stream`, the frontend implemented streaming response support. The `streamAskRag` function uses a manual POST-compatible SSE parser built around `ReadableStream`, `TextDecoder`, buffering, and event-frame parsing.

The frontend handles streamed events in this order:

```text
metadata -> token -> token -> token -> done
```

The visible result is that assistant answer text grows progressively while the request is still active. Source metadata is rendered from the stream, and the non-streaming `/ask-rag` endpoint remains as a fallback.

### Firestore Memory and Session Persistence

The assistant later gained persistent session support. The frontend stores the active RAG session ID in local storage:

```text
portfolioAssistantSessionId
```

Each request sends the `session_id` to the backend. The backend stores conversation history in Firestore, while the frontend still keeps local visible messages for immediate UI rendering. New Chat clears the visible conversation and creates a new session.

This separated frontend display history from backend factual memory. The backend uses stored conversation messages only for follow-up context, while retrieved documents remain the factual source for RAG answers.

### AI UX Refinements

The assistant UI continued to improve after streaming and memory were working. I added compact message spacing, response status timing, Enter-to-send, Shift+Enter newline, a dim overlay without blur, a refresh/new-chat control, expanded panel width behavior, and per-message status.

The per-message status change fixed a state bug where older assistant responses could display the newest global status. The solution was to store status on the active assistant message itself, so historical responses freeze at their final generated or failed state.

## 5. Major Frontend Features

### Portfolio UI

Problem: The project section needed to present multiple projects without making the capstone feel disconnected from the rest of the portfolio.

Implementation: I built a Portfolio section using wide case-study cards. Each card opens the existing project modal through the same selected-project state.

Technical decisions: I kept one card interaction model, used a consistent layout for all cards, and reserved special styling for the capstone border and label only.

Outcome: The Portfolio section now feels consistent, scannable, and suitable for an interview or recruiter review.

### Project Modal System

Problem: Project details varied in length, which caused modal tabs to feel inconsistent and sometimes changed the modal footprint.

Implementation: I normalized modal tabs through shared CSS classes and a shared rendering structure. Header and tab controls remain fixed while the content panel scrolls.

Technical decisions: I fixed layout drift at the shared modal layer rather than adding one-off styles per tab or per project.

Outcome: The modal now behaves predictably across Overview, Architecture, Challenges, and Documentation tabs.

### AI Assistant Integration

Problem: The frontend needed to connect to a real RAG backend without losing the existing assistant UI.

Implementation: I added `api/chat.js` and connected the assistant hook to `/ask-rag`, then later to `/ask-rag-stream` first with `/ask-rag` fallback.

Technical decisions: API behavior lives outside UI components, and assistant state lives in `useAssistantChat.js`.

Outcome: The assistant became a working production feature instead of a static placeholder.

### Streaming Chat Rendering

Problem: Non-streaming responses made the assistant feel slower and less interactive.

Implementation: I added a POST-compatible SSE parser and updated the hook to append streamed tokens through functional React state updates.

Technical decisions: I preserved the non-streaming fallback and kept streamed metadata, tokens, completion, and errors as distinct event types.

Outcome: The assistant now progressively renders answers and still recovers through fallback behavior if streaming fails.

### Visible Sources and Source IDs

Problem: RAG answers need visible grounding so users can understand where answers came from.

Implementation: Source rows render source IDs such as `[S1]`, file names, headings, and chunk fallbacks under each assistant response.

Technical decisions: Source rendering is grouped per assistant message so historical answers keep their own source lists.

Outcome: The assistant provides interview-friendly evidence of RAG grounding and citation behavior.

### Session Persistence

Problem: Frontend-only conversation memory disappeared after refresh and could not support persistent follow-up context.

Implementation: The frontend stores a session ID in `localStorage` and sends it with each RAG request.

Technical decisions: Visible chat history remains local UI state, while durable conversation storage belongs to Firestore through the backend.

Outcome: The assistant supports persistent backend chat memory without making the frontend responsible for database writes.

## 6. Challenges and Solutions

### Modal Sizing Issues

The modal moved through several layouts, including a large centered panel and a near full-screen shell. The challenge was to increase usable space without making the modal feel unstable or causing mobile overflow.

The final solution used a constrained centered panel, stable header and tabs, internal content scrolling, and shared tab stack classes. This kept the modal readable while preserving responsive behavior.

### Streaming Rendering Issues

Streaming required parsing server-sent events from a POST response. Browser `EventSource` was not the right fit because the request needed a POST body with session data.

The solution was a manual stream reader using `response.body.getReader()`, `TextDecoder`, and buffered SSE frame parsing. Functional React state updates prevented stale state while token text was appended.

### State Management Issues

The assistant originally had global status state. That caused historical messages to render the newest response status.

The fix was to store status on each assistant message and update only the active assistant message while a request is running. This preserved accurate history and made the UI more reliable.

### Session Persistence

The frontend needed to preserve backend chat continuity without turning local UI state into the source of truth.

The solution was to store only the `session_id` in local storage. Firestore owns durable messages, and the frontend owns visible rendering.

### Source Rendering

Early source rendering focused on showing returned source metadata. Later, source IDs became important because the backend prompt required citation labels.

The frontend was updated to show `[S1]`, `[S2]`, and similar labels beside source rows, matching the backend grounding model.

### CloudFront Deployment and CORS

Production CloudFront loaded the frontend correctly, and the JavaScript bundle contained the Cloud Run URL and both RAG endpoints. However, the assistant failed with `TypeError: Failed to fetch`.

The root cause was backend CORS. The backend allowed local Vite origins but not the production CloudFront origin. After adding the CloudFront origin to backend CORS defaults and deployment environment variables, the live assistant successfully connected and returned grounded answers.

## 7. Frontend Deployment Architecture

The frontend deployment architecture uses AWS for static delivery and GCP for AI backend functionality:

```text
User Browser
  |
  v
AWS CloudFront
  |
  v
S3 Static Website Assets
  |
  +--> Visitor Counter API
  |      API Gateway -> Lambda -> DynamoDB
  |
  +--> AI Assistant API
         Cloud Run -> FastAPI -> Firestore retrieval -> Gemini
```

The production frontend origin is included in the backend CORS configuration so browser requests from CloudFront can reach Cloud Run:

```text
https://dvzu3s2gq6iw.cloudfront.net
  -> POST /ask-rag-stream
  -> Cloud Run CORS allowlist
```

This deployment model demonstrates a hybrid portfolio architecture: AWS hosts the user-facing static app and visitor counter, while GCP hosts the AI/RAG backend.

## 8. Lessons Learned

The first major lesson was that frontend architecture matters even in a portfolio project. A portfolio can quickly become a real application when it includes authentication-like session behavior, streaming APIs, live cloud services, modals, routing anchors, language state, and deployment constraints.

The second lesson was to refactor incrementally. The move from a large `App.jsx` to a modular structure worked because each extraction preserved behavior and was verified with lint and build checks.

The third lesson was that UI bugs are often architecture bugs. The project modal sizing problem was not solved by adjusting individual cards. It was solved by normalizing the shared modal layout path.

The fourth lesson was that production browser failures require network-level debugging. The CloudFront assistant failure looked like a frontend fetch problem, but the actual cause was backend CORS. Checking the production bundle, browser console, and direct preflight response led to the right fix.

The fifth lesson was that AI UX requires careful state design. Streaming tokens, response status, sources, session IDs, local messages, and backend memory all need clear boundaries.

## 9. Future Frontend Roadmap

### Workflow Renderer

I want the frontend to render cloud workflows in a clearer visual format, especially request flows such as visitor counter, ingestion, retrieval, and streaming response paths.

### Architecture Diagram Renderer

The portfolio can improve by rendering architecture diagrams directly inside project modals or through exported Draw.io assets. The capstone architecture image path already exists as a target for a final diagram export.

### Analytics Dashboard

A future dashboard could show visitor activity, assistant usage, common question topics, response latency, source usage, and error rates. This would connect frontend UX to production observability.

### Live Architecture Trace

The assistant could eventually show a simplified live trace of a RAG request:

```text
question received -> session loaded -> chunks retrieved -> Gemini streaming -> sources rendered
```

This would make the portfolio more educational and demonstrate system behavior.

### Enhanced AI UX

Future AI improvements could include clearer no-answer states, answer confidence display, prompt suggestions based on the current project modal, and better mobile chat controls.

## 10. Conclusion

The frontend evolved from a static React portfolio into a production-style cloud application interface. It now connects AWS static hosting and visitor-counter infrastructure with a GCP RAG backend, while maintaining a professional portfolio presentation.

The strongest engineering outcome is the combination of UI polish and system integration. The project shows React and Vite fundamentals, modular frontend architecture, production deployment awareness, streaming API handling, persistent chat sessions, source-grounded AI rendering, and disciplined incremental refactoring. This makes the frontend both a portfolio surface and a technical artifact I can discuss in interviews with concrete implementation history.

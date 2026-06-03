# Codex Instructions

Before making changes, read:

- CAPSTONE_PROJECT_STATE.md
- GCP_RAG_PROJECT_STATE.md
- GCP_RAG_DEVELOPMENT_LOG.md
- REACT_Frontend_Development_Log.md

## Project Direction

This is a cloud engineering portfolio with:

- React + Vite frontend
- AWS serverless visitor counter
- GCP Cloud Run RAG backend
- Gemini + Firestore + GCS retrieval

Do not switch the RAG backend back to AWS Bedrock unless explicitly instructed.

## Review Rules

Before editing code:

1. Compare the code against the documentation.
2. Identify mismatches.
3. Explain the safest next change.
4. Wait for approval before modifying files.

## Frontend Rules

Preserve the current visual direction:

- minimal
- recruiter-friendly
- cloud/SaaS inspired
- no flashy redesign
- no unnecessary UI libraries

Do not grow `App.jsx` or `Home.jsx` into monoliths.

Keep API calls inside `src/api/`.

Keep reusable state logic inside `src/hooks/`.

Keep presentation logic inside `src/components/`.

Run after frontend changes:

```bash
cd frontend-Vite
npm run lint
npm run build
```

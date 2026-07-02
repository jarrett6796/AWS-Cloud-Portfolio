# Source of Truth Audit - Frontend

## Audit Date

2026-06-27

## Purpose

This report records the React/Vite frontend runtime configuration, API client files, build/deploy path, and stale URL risk.

## Active Frontend Folder

| Area | Value |
| --- | --- |
| Active folder | `frontend-React/` |
| Framework | React + Vite |
| Language | JavaScript |
| Styling | Plain CSS |
| Production hosting | AWS S3 + CloudFront |
| Production domain | `https://aws-cloudresume-gcprag-jarrett.cc` |
| CloudFront domain | `https://d338amzpyv3o5b.cloudfront.net` |

## Env Files

| File | Purpose |
| --- | --- |
| `frontend-React/.env` | Local runtime values; should not be treated as public documentation |
| `frontend-React/.env.example` | Public template for required Vite env variables |
| `.github/workflows/deploy-frontend.yml` | Creates `.env` during manual production deployment from GitHub secrets and fallback values |

Documented env variables:

```text
VITE_GCP_RAG_API_URL
VITE_AWS_VISITOR_API_URL
VITE_AWS_PROJECTS_API_BASE_URL
VITE_AWS_CONTACT_API_URL
```

## API Client Files

| File | Runtime dependency | Behavior |
| --- | --- | --- |
| `frontend-React/src/api/chat.js` | `VITE_GCP_RAG_API_URL` | Uses Cloud Run fallback `https://gcp-rag-backend-189047029621.asia-east1.run.app`; calls `/ask-rag` and `/ask-rag-stream` |
| `frontend-React/src/api/visitors.js` | `VITE_AWS_VISITOR_API_URL` | Fetches website view count; returns `0` when missing or failed |
| `frontend-React/src/api/projects.js` | `VITE_AWS_PROJECTS_API_BASE_URL` | Reads and increments hidden project view analytics; returns `null` when missing or failed |
| `frontend-React/src/api/contact.js` | `VITE_AWS_CONTACT_API_URL` | Submits contact form payload to AWS Contact API |

## Build Config

| File | Purpose |
| --- | --- |
| `frontend-React/package.json` | Frontend scripts and dependencies |
| `frontend-React/vite.config.js` | Vite configuration, if present |
| `frontend-React/eslint.config.js` | Frontend lint configuration |
| `.github/workflows/frontend-check.yml` | Automatic frontend build validation |
| `.github/workflows/deploy-frontend.yml` | Manual production build and S3/CloudFront deploy |

## Runtime Dependencies

The frontend depends on:

- AWS S3 + CloudFront for static hosting.
- AWS View Counter API for `VITE_AWS_VISITOR_API_URL`.
- AWS Project Views API for `VITE_AWS_PROJECTS_API_BASE_URL`.
- AWS Contact API for `VITE_AWS_CONTACT_API_URL`.
- GCP Cloud Run RAG backend for `VITE_GCP_RAG_API_URL`.

## CORS Dependencies

Backends must allow the active frontend origins:

```text
https://aws-cloudresume-gcprag-jarrett.cc
https://www.aws-cloudresume-gcprag-jarrett.cc
https://d338amzpyv3o5b.cloudfront.net
http://localhost:5173
http://localhost:5174
http://127.0.0.1:5173
http://127.0.0.1:5174
```

AWS API Gateway CORS source:

- `backend-AWS/apigateway/cors.md`
- `backend-AWS/apigateway/apis.json`
- `terraform/aws/backend/api_gateway.tf`

GCP CORS source:

- `backend-GCP/app/config/settings.py`
- `.github/workflows/deploy-backend-gcp.yml`
- `terraform/gcp/rag-backend/variables.tf`

## Stale URL Search

Known stale values:

| Stale value | Replacement |
| --- | --- |
| `dvzu3s2gq6iw.cloudfront.net` | `d338amzpyv3o5b.cloudfront.net` |
| `dify-vertex-ai-499302` | `cloud-resume-ai-rag` |

Current frontend API clients do not hardcode the stale CloudFront domain or wrong GCP project. Some older generated/historical reports still mention stale values and should not be used as current runtime evidence.

## UI Behavior Risk

No UI behavior changes were made by this audit split.

Important frontend behaviors to preserve in future changes:

- Floating AI assistant behavior.
- Project-aware chat state.
- Project modal and documentation viewer behavior.
- Website view counter display.
- Hidden project view tracking.
- Contact form submission flow.
- Bilingual content and routing behavior.

## Frontend Safety Notes

- The frontend deploy workflow is manual-only.
- The frontend check workflow builds only and does not deploy.
- API URLs should stay env-driven except for the documented GCP RAG fallback in `src/api/chat.js`.

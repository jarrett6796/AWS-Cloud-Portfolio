# Frontend
The frontend is organized around page composition, reusable components, API clients, and hooks. `Home.jsx` owns page state, `portfolioContent.js` owns bilingual content, `ChatPanel.jsx` owns the assistant UI, and the project modal now renders markdown-backed documentation.

# Backend
The backend is a FastAPI service deployed on Cloud Run. Route handlers delegate to services for retrieval, Gemini calls, Firestore access, GCS access, ingestion, and analytics.

```text
request -> route -> service -> provider/client
```

# GCP-RAG
- Cloud Run hosts the public assistant API.
- Firestore stores document chunks, conversation messages, and metadata-only RAG analytics.
- Gemini generates answers from retrieved context.
- Source IDs are returned to the frontend for visible grounding.
- Citation validation blocks unsupported generated answers.

# Database
| Store | Purpose |
| --- | --- |
| DynamoDB | AWS visitor counter state |
| Firestore document_chunks | RAG chunks, embeddings, and metadata |
| Firestore conversations | Persistent assistant session messages |
| Firestore rag_analytics | Metadata-only RAG monitoring records |

# API
| Endpoint | Purpose |
| --- | --- |
| GET /views | AWS visitor count |
| POST /ask-rag-stream | Primary streaming RAG response path |
| POST /ask-rag | Synchronous RAG fallback path |
| POST /ingest-docs | Admin-only document ingestion |
| GET /rag-analytics/summary | Admin-only RAG analytics summary |

# Network
- CloudFront serves the static frontend.
- Browser requests call API Gateway for visitor metrics.
- Browser requests call Cloud Run for RAG assistant responses.
- Cloud Run CORS must allow local Vite origins and the production CloudFront origin.

# Security
- Public assistant routes are unauthenticated for portfolio visitors.
- Ingestion and analytics summary endpoints require `X-Admin-Token`.
- RAG analytics records avoid prompt text, document text, embeddings, and generated answers.
- CORS is allowlist-based.

# Deployment
- Frontend builds with Vite and deploys to S3 behind CloudFront.
- Backend builds a Python container and deploys to Cloud Run.
- CloudFront invalidation is handled by the frontend deployment workflow.

# CI/CD
```text
npm run lint
npm run build
python -m unittest discover -s tests
python scripts/evaluate_rag.py --base-url <cloud-run-url>
```

# IaC
Terraform adoption is planned as an import-first workflow. Existing AWS and GCP resources should be inventoried before Terraform manages production infrastructure.

# Monitoring
- Cloud Run health endpoints expose service status and runtime summaries.
- Structured logs include request IDs and timing metadata.
- RAG analytics track latency, source count, no-answer rate, citation blocks, and retrieval flags.

# Troubleshooting
| Issue | Resolution |
| --- | --- |
| Production assistant fetch failure | Verified CORS preflight and added the CloudFront origin to backend CORS settings. |
| Cloud Run env var parsing | Used custom delimiter syntax for comma-separated CORS values. |
| Stale RAG source content | Updated GCS markdown source and rebuilt Firestore document chunks. |

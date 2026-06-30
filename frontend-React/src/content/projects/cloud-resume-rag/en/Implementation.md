---
title: Implementation
---
# Implementation

## Implementation Overview

### Frontend Implementation Hosting
The previous AWS account hosted the static frontend through S3 and CloudFront. That infrastructure is not assumed to be active now because the original AWS account is no longer available. The new AWS account must rebuild the S3 bucket, CloudFront distribution, IAM deployment permissions, and GitHub Actions secret wiring before AWS frontend hosting is represented as current.

### Visitor Counter
The previous visitor counter used API Gateway, Lambda, and DynamoDB and was verified during the V1 test record. In the new AWS account, API Gateway, Lambda, DynamoDB, IAM roles/policies, and logging must be recreated and retested.

### Serverless Components
Required rebuild components:

- S3
- CloudFront
- API Gateway
- Lambda
- DynamoDB
- SNS
- EventBridge
- IAM roles and policies

### AWS Service Integration
The frontend deployment workflow already contains reusable S3 sync and CloudFront invalidation steps, but it depends on new-account AWS resources and secrets. Do not treat the workflow as proof that the new account has been redeployed.

## Frontend Implementation
The frontend is organized around page composition, reusable components, API clients, and hooks. `Home.jsx` owns page state, `portfolioContent.js` owns bilingual content, `ChatPanel.jsx` owns the assistant UI, and the project modal now renders markdown-backed documentation.

## Backend Implementation

### Backend Architecture
The backend is a FastAPI service deployed on Cloud Run. Route handlers delegate to services for retrieval, Gemini calls, Firestore access, GCS access, ingestion, and analytics.

```text
request -> route -> service -> provider/client
```

### Document Ingestion
- `POST /ingest-docs` is admin-only through `X-Admin-Token`.
- GCS source documents are chunked, embedded, and stored in Firestore.
- Ingestion uses deterministic chunk IDs and can prune stale duplicates.

### Retrieval Pipeline
- Cloud Run hosts the public assistant API.
- Firestore stores document chunks, conversation messages, and metadata-only RAG analytics.
- Gemini generates answers from retrieved context.
- Source IDs are returned to the frontend for visible grounding.
- Citation validation blocks unsupported generated answers.

### Conversation Memory
- Frontend requests include `session_id`.
- Firestore stores user and assistant messages under `conversations/{session_id}/messages/{message_id}`.
- Backend-only system audit messages are not displayed in the frontend.

### Analytics
- Metadata-only RAG analytics track latency, source count, no-answer rate, citation blocks, query rewrite usage, multi-query usage, metadata filter usage, and streaming usage.
- `GET /rag-analytics/summary` is admin-only and returns aggregate metrics.

### AI Features
- Gemini 2.5 Flash generation.
- `text-embedding-005` embeddings.
- Streaming responses.
- Citation validation.
- Optional query rewriting, metadata filtering, hybrid scoring, reranking, and multi-query retrieval.

## Database / Storage
| Store | Purpose |
| --- | --- |
| DynamoDB | Previous visitor counter state; rebuild required in new AWS account |
| Firestore document_chunks | RAG chunks, embeddings, and metadata |
| Firestore conversations | Persistent assistant session messages |
| Firestore rag_analytics | Metadata-only RAG monitoring records |

## API Design
| Endpoint | Purpose |
| --- | --- |
| GET /views | AWS visitor count; rebuild/retest required in new AWS account |
| POST /ask-rag-stream | Primary streaming RAG response path |
| POST /ask-rag | Synchronous RAG fallback path |
| POST /ingest-docs | Admin-only document ingestion |
| GET /rag-analytics/summary | Admin-only RAG analytics summary |

## Network
- CloudFront and S3 are the AWS frontend delivery rebuild target.
- Browser requests should call API Gateway for visitor metrics after AWS redeployment.
- Browser requests call Cloud Run for RAG assistant responses.
- Cloud Run CORS must allow local Vite origins and the production CloudFront origin.

## Security Considerations
- Public assistant routes are unauthenticated for portfolio visitors.
- Ingestion and analytics summary endpoints require `X-Admin-Token`.
- RAG analytics records avoid prompt text, document text, embeddings, and generated answers.
- CORS is allowlist-based.

## Deployment Notes
- Frontend builds with Vite. AWS deployment to S3 behind CloudFront must be re-established in the new AWS account.
- Backend builds a Python container and deploys to Cloud Run.
- CloudFront invalidation is handled by the frontend deployment workflow.

:::warning
CloudFront cache invalidation is required after frontend deployment.
:::

## CI/CD
### Frontend Implementation Deployment Pipeline
The existing `.github/workflows/deploy-frontend.yml` installs dependencies, creates `.env`, builds the Vite app, syncs `dist/` to S3, and invalidates CloudFront. It must be repointed to the new AWS account resources and secrets.

### Backend Deployment Pipeline
The existing `.github/workflows/deploy-backend-gcp.yml` runs backend tests, compiles selected files, builds and pushes a Docker image, deploys to Cloud Run, and uploads a RAG evaluation report.

### Automated Testing
```text
npm run lint
npm run build
python -m unittest discover -s tests
```

### RAG Evaluation
```text
python scripts/evaluate_rag.py --base-url <cloud-run-url>
```

## Infrastructure as Code

### Current State
Terraform is not implemented yet. The Terraform planning report remains useful, but AWS migration changes the strategy from old-account import-first to new-account rebuild-first for AWS resources.

### Terraform Adoption Plan
Start with discovery and documentation, then create Terraform structure and sandbox resources before production. For AWS, model new S3, CloudFront, Lambda, API Gateway, DynamoDB, SNS, EventBridge, and IAM resources for the new account. For GCP, keep import-first planning for existing Cloud Run, GCS, Firestore, Artifact Registry, service accounts, and IAM where safe.

### Planned Modules
- `aws-s3-frontend`
- `aws-cloudfront`
- `aws-visitor-counter`
- `aws-event-notifications`
- `aws-iam-deployment`
- `gcp-cloud-run`
- `gcp-storage`
- `gcp-firestore`
- `gcp-service-account`
- `gcp-vertex-ai-iam`

## Monitoring
- Cloud Run health endpoints expose service status and runtime summaries.
- Structured logs include request IDs and timing metadata.
- RAG analytics track latency, source count, no-answer rate, citation blocks, and retrieval flags.

## Future Improvements
- Monitoring Dashboard
- Managed Vector Search
- Semantic Reranker
- Memory Summarization
- Rate Limiting
- Agentic RAG, future research only

## Current Limitations
| Issue | Resolution |
| --- | --- |
| Production assistant fetch failure | Verified CORS preflight and added the CloudFront origin to backend CORS settings. |
| Cloud Run env var parsing | Used custom delimiter syntax for comma-separated CORS values. |
| Stale RAG source content | Updated GCS markdown source and rebuilt Firestore document chunks. |
| AWS account migration | Treat previous AWS deployment as historical evidence and rebuild S3, CloudFront, Lambda, API Gateway, DynamoDB, SNS, EventBridge, IAM, and CI/CD integration in the new account. |

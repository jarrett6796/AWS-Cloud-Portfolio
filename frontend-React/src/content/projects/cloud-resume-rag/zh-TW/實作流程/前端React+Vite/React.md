---
title: 實作細節
---
# Implementation

## Implementation Overview

### Frontend Hosting
Previous AWS account 曾透過 S3 與 CloudFront hosting static frontend。因為原 AWS account 已不可用，目前不能假設這些 resources 仍 active。New AWS account 必須重建 S3 bucket、CloudFront distribution、IAM deployment permissions 與 GitHub Actions secrets wiring。

### Visitor Counter
Previous visitor counter 使用 API Gateway、Lambda、DynamoDB，並在 V1 test record 中驗證過。New AWS account 需要重新建立 API Gateway、Lambda、DynamoDB、IAM roles/policies 與 logging，並重新測試。

### Serverless Components
Required rebuild components：

- S3
- CloudFront
- API Gateway
- Lambda
- DynamoDB
- SNS
- EventBridge
- IAM roles and policies

### AWS Service Integration
Frontend deployment workflow 已包含可重用的 S3 sync 與 CloudFront invalidation steps，但它依賴 new-account AWS resources and secrets。不要把 workflow 存在本身視為 new AWS account 已完成 redeploy 的證據。

## Frontend Implementation
前端以 page composition、reusable components、API clients、hooks 分層。`Home.jsx` 管理頁面狀態，`portfolioContent.js` 管理雙語內容，`ChatPanel.jsx` 管理 assistant UI，Project Modal 則渲染 markdown-backed documentation。

## Backend Implementation

### Backend Architecture
後端是部署在 Cloud Run 的 FastAPI service。Route handlers 會委派到 services，處理 retrieval、Gemini calls、Firestore access、GCS access、ingestion、analytics。

```text
request -> route -> service -> provider/client
```

### Document Ingestion
- `POST /ingest-docs` 透過 `X-Admin-Token` 保護。
- GCS source documents 會被 chunk、embedding，並寫入 Firestore。
- Ingestion 使用 deterministic chunk IDs，並可 prune stale duplicates。

### Retrieval Pipeline
- Cloud Run hosting public assistant API。
- Firestore 保存 document chunks、conversation messages、metadata-only RAG analytics。
- Gemini 根據 retrieved context 產生 answers。
- Frontend 顯示 source IDs 作為 grounding evidence。
- Citation validation 會阻擋 unsupported generated answers。

### Conversation Memory
- Frontend requests include `session_id`。
- Firestore stores messages under `conversations/{session_id}/messages/{message_id}`。
- Backend-only system audit messages 不會顯示在 frontend。

### Analytics
- Metadata-only RAG analytics track latency、source count、no-answer rate、citation blocks、query rewrite usage、multi-query usage、metadata filter usage、streaming usage。
- `GET /rag-analytics/summary` 是 admin-only aggregate metrics endpoint。

### AI Features
- Gemini 2.5 Flash generation。
- `text-embedding-005` embeddings。
- Streaming responses。
- Citation validation。
- Optional query rewriting、metadata filtering、hybrid scoring、reranking、multi-query retrieval。

## Database / Storage
| Store | Purpose |
| --- | --- |
| DynamoDB | Previous visitor counter state；new AWS account rebuild required |
| Firestore document_chunks | RAG chunks, embeddings, and metadata |
| Firestore conversations | Persistent assistant session messages |
| Firestore rag_analytics | Metadata-only RAG monitoring records |

## API Design
| Endpoint | Purpose |
| --- | --- |
| GET /views | AWS visitor count；new AWS account rebuild/retest required |
| POST /ask-rag-stream | Primary streaming RAG response path |
| POST /ask-rag | Synchronous RAG fallback path |
| POST /ingest-docs | Admin-only document ingestion |
| GET /rag-analytics/summary | Admin-only RAG analytics summary |

## 網路架構
- CloudFront and S3 是 AWS frontend delivery rebuild target。
- Browser requests should call API Gateway for visitor metrics after AWS redeployment。
- Browser requests call Cloud Run for RAG assistant responses。
- Cloud Run CORS must allow local Vite origins and production CloudFront origin。

## Security Considerations
- Public assistant routes remain unauthenticated for portfolio visitors。
- Ingestion and analytics summary endpoints require `X-Admin-Token`。
- RAG analytics records avoid prompt text、document text、embeddings、generated answers。
- CORS 使用 allowlist-based configuration。

## Deployment Notes
- Frontend builds with Vite。AWS deployment to S3 behind CloudFront must be re-established in the new AWS account。
- Backend builds a Python container and deploys to Cloud Run。
- CloudFront invalidation is handled by the frontend deployment workflow。

## CI/CD
### Frontend Deployment Pipeline
Existing `.github/workflows/deploy-frontend.yml` installs dependencies、creates `.env`、builds Vite app、syncs `dist/` to S3、invalidates CloudFront。它必須 repoint 到 new AWS account resources and secrets。

### Backend Deployment Pipeline
Existing `.github/workflows/deploy-backend-gcp.yml` runs backend tests、compiles selected files、builds/pushes Docker image、deploys to Cloud Run、uploads RAG evaluation report。

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
Terraform 尚未實作。Terraform planning report 仍有參考價值，但 AWS migration 讓 AWS strategy 從 old-account import-first 改為 new-account rebuild-first。

### Terraform Adoption Plan
先做 discovery 與 documentation，再建立 Terraform structure 與 sandbox resources。AWS 端應 model new S3、CloudFront、Lambda、API Gateway、DynamoDB、SNS、EventBridge、IAM resources。GCP 端可對 verified existing Cloud Run、GCS、Firestore、Artifact Registry、service accounts、IAM 採取安全的 import-first planning。

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

## 監控
- Cloud Run health endpoints expose service status and runtime summaries。
- Structured logs include request IDs and timing metadata。
- RAG analytics track latency、source count、no-answer rate、citation blocks、retrieval flags。

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

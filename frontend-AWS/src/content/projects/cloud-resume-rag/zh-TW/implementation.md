---
title: 實作細節
---
# 前端
前端以 page composition、reusable components、API clients、hooks 分層。`Home.jsx` 管理頁面狀態，`portfolioContent.js` 管理雙語內容，`ChatPanel.jsx` 管理 assistant UI，Project Modal 則渲染 markdown-backed documentation。

# 後端
後端是部署在 Cloud Run 的 FastAPI service。Route handlers 會委派到 services，處理 retrieval、Gemini calls、Firestore access、GCS access、ingestion、analytics。

```text
request -> route -> service -> provider/client
```

# GCP-RAG
- Cloud Run hosting public assistant API。
- Firestore 保存 document chunks、conversation messages、metadata-only RAG analytics。
- Gemini 根據 retrieved context 產生 answers。
- Frontend 顯示 source IDs 作為 grounding evidence。
- Citation validation 會阻擋 unsupported generated answers。

# 資料庫
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

# 網路架構
- CloudFront serves the static frontend。
- Browser requests call API Gateway for visitor metrics。
- Browser requests call Cloud Run for RAG assistant responses。
- Cloud Run CORS must allow local Vite origins and production CloudFront origin。

# 安全性
- Public assistant routes remain unauthenticated for portfolio visitors。
- Ingestion and analytics summary endpoints require `X-Admin-Token`。
- RAG analytics records avoid prompt text、document text、embeddings、generated answers。
- CORS 使用 allowlist-based configuration。

# 部署流程
- Frontend builds with Vite and deploys to S3 behind CloudFront。
- Backend builds a Python container and deploys to Cloud Run。
- CloudFront invalidation is handled by the frontend deployment workflow。

# CI/CD
```text
npm run lint
npm run build
python -m unittest discover -s tests
python scripts/evaluate_rag.py --base-url <cloud-run-url>
```

# IaC
Terraform adoption is planned as an import-first workflow。Existing AWS and GCP resources should be inventoried before Terraform manages production infrastructure。

# 監控
- Cloud Run health endpoints expose service status and runtime summaries。
- Structured logs include request IDs and timing metadata。
- RAG analytics track latency、source count、no-answer rate、citation blocks、retrieval flags。

# Troubleshooting
| Issue | Resolution |
| --- | --- |
| Production assistant fetch failure | Verified CORS preflight and added the CloudFront origin to backend CORS settings. |
| Cloud Run env var parsing | Used custom delimiter syntax for comma-separated CORS values. |
| Stale RAG source content | Updated GCS markdown source and rebuilt Firestore document chunks. |

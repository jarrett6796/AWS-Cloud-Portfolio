# 架構圖綜覽 Architecture Overview

![](data:image/png;base64...)

AWS 雲端履歷

AWS 負責作品集網站交付、瀏覽與專案次數點擊與事件通知；GCP 負責 AI Assistant 與 RAG 後端。前端由 React + Vite 建置，透過 CloudFront 與 S3 提供靜態網站服務。使用者開啟專案 Modal、提交 Contact Form 或觸發特定瀏覽里程碑時，事件會透過 API Gateway、Lambda、DynamoDB、EventBridge 與 SNS 進行記錄與通知。

GCP RAG

RAG AI Assistant 則透過 Cloud Run FastAPI 後端處理 RAG 問答流程，並使用 Firestore 儲存文件 chunks、對話紀錄與 RAG analytics，Cloud Storage 儲存 markdown 文件來源，Vertex AI 負責文字生成與 embedding。此架構反映目前專案方向：AWS 作為 Cloud Resume Challenge 與事件驅動系統基礎，GCP 作為 AI/RAG 平台

# 邏輯架構圖 Logical Layer Architecture

![](data:image/png;base64...)

本系統的邏輯架構可分為五個主要層級：前端展示層、AWS 無伺服器層、GCP AI 應用層、AI 與檢索層，以及資料層。

前端展示層負責作品集介面、專案文件 Modal、AI Assistant 以及 Contact Form。AWS 無伺服器層負責 Cloud Resume Challenge 的基礎功能，例如訪客計數、專案點擊紀錄、事件觸發與通知。GCP AI 應用層則負責 RAG 後端服務，透過 Cloud Run 執行 FastAPI，並協調文件 ingestion、檢索、生成、對話記憶與 analytics。

AI 與檢索層負責進階 RAG 流程，包括 query rewrite、retrieval、response generation 與 citation validation。資料層則由 DynamoDB、Firestore 與 Cloud Storage 組成，分別處理 AWS analytics、RAG 文件 chunks、對話紀錄、RAG analytics 與 markdown 文件來源。這樣的分層設計讓 AWS 專注於 serverless portfolio infrastructure，GCP 專注於 AI/RAG workload。

# 系統模組圖 System Module Concept

![](data:image/png;base64...)

## 模組功能表

| **模組 (Module)** | **功能 (Function)** | **對應技術服務** |
| --- | --- | --- |
| **Portfolio Module（作品集模組）** | Portfolio Display（作品集展示） | React、Vite、Amazon S3、Amazon CloudFront |
| Project Documentation（專案文件展示） | React Markdown、Mermaid、Amazon S3 |
| **AI Assistant Module（AI 助理模組）** | Project Q&A（專案問答） | React Chat UI、FastAPI、Google Cloud Run |
| Streaming Response（串流回應） | Server-Sent Events (SSE)、FastAPI、Google Cloud Run |
| **Knowledge Management Module（知識管理模組）** | Document Ingestion（文件匯入） | Google Cloud Storage、Vertex AI Embedding API、Firestore |
| Knowledge Base Management（知識庫管理） | Google Cloud Storage、Firestore |
| **Advanced RAG Module（進階 RAG 模組）** | Query Rewrite（查詢重寫） | Vertex AI Gemini |
| Multi-Query Retrieval（多重查詢檢索） | FastAPI RAG Service、Vertex AI |
| Hybrid Retrieval（混合式檢索） | Firestore Vector Search、Keyword Search |
| Context Assembly（上下文組裝） | FastAPI RAG Service |
| Citation Validation（引用驗證） | FastAPI RAG Service |
| Answer Generation（答案生成） | Vertex AI Gemini 2.5 Flash |
| **Memory Module（記憶模組）** | Conversation Memory（對話記憶） | Firestore |
| **Analytics Module（分析模組）** | Web View Counter（網站瀏覽計數） | API Gateway、AWS Lambda、DynamoDB |
| Project View Counter（專案瀏覽計數） | API Gateway、AWS Lambda、DynamoDB |
| RAG Analytics（RAG 使用分析） | Firestore、Google Cloud Run |
| Event Notification Module | Event Notification 事件通知 | Amazon API Gateway、AWS Lambda、Amazon SNS、Amazon EventBridge |
| Contact Module | Contact Form 聯絡表單 | React Form、Amazon API Gateway、AWS Lambda、Amazon SES |

# 序列圖 Sequence Diagram

## RAG 序列圖![](data:image/png;base64...)

## 瀏覽次數 序列圖

![](data:image/png;base64...)

## 事件通知與表單聯絡 序列圖

![](data:image/png;base64...)

# 資料庫與儲存架構 Database & Storage Architecture

本專題採用多雲架構（Multi-Cloud Architecture），並根據不同資料類型選擇合適的儲存服務。AWS 負責前端網站與分析資料儲存，GCP 則負責 RAG 知識庫、對話記憶與 AI 相關資料管理。

| **類型** | **服務** | **主要用途** |
| --- | --- | --- |
| Object Storage | Amazon S3 | 儲存前端靜態網站、圖片、CSS、JS、assets |
| Google Cloud Storage | 儲存 RAG 原始 Markdown 文件與知識庫來源 |
| NoSQL Database | Amazon DynamoDB | 儲存 Web views、Project views、Contact records、Notification state |
| Firestore | 儲存 document chunks、conversation memory、RAG analytics |

## Database Schema Design

![](data:image/png;base64...)

### **AWS DynamoDB Schema**

| **Table** | **Key Design** | **Main Fields** | **Purpose** |
| --- | --- | --- | --- |
| website\_views | id | view\_count, updated\_at | 儲存整體網站瀏覽數 |
| project\_views | project\_id | project\_name, view\_count, last\_viewed\_at | 儲存每個專案 Modal 的瀏覽數 |
| contact\_records | message\_id | name, email, message, created\_at, status | 儲存 Recruiter / 使用者聯絡表單內容 |
| notification\_state | event\_id | event\_type, target\_id, threshold, triggered, triggered\_at | 儲存事件通知狀態，例如瀏覽數達標通知 |

### **GCP Firestore Schema**

| **Collection** | **Document ID** | **Main Fields** | **Purpose** |
| --- | --- | --- | --- |
| document\_chunks | chunk\_id | source\_id, project\_id, content, embedding, metadata, created\_at | 儲存 RAG 文件 chunks 與向量資料 |
| conversations | session\_id | user\_id, project\_id, created\_at, updated\_at | 儲存對話 Session |
| conversations/{session\_id}/messages | message\_id | role, content, created\_at, request\_id | 儲存每次使用者與 AI 的對話訊息 |
| rag\_analytics | request\_id | question, top\_sources, latency\_ms, retrieval\_score, created\_at | 儲存 RAG 查詢、來源、效能與使用分析 |

### **Object Storage Schema**

| **Storage** | **Structure** | **Purpose** |
| --- | --- | --- |
| Amazon S3 | /index.html, /assets/\*, /images/\* | 儲存前端靜態網站與圖片資源 |
| Google Cloud Storage | /docs/\*.md, /projects/{project\_id}/\*.md | 儲存 RAG 原始 Markdown 文件 |

# **Technology Stack｜技術棧總覽**

本專案採用 Multi-Cloud Architecture，由 AWS 提供網站託管與 Serverless 服務，GCP 提供 AI 推理、Advanced RAG 與對話記憶功能，形成完整的 AI-Powered Portfolio Platform。

## **Technology Stack Overview**

| **Layer** | **Technology / Service** |
| --- | --- |
| Frontend | React, Vite, JavaScript |
| UI Components | React Markdown, Mermaid |
| Static Website Hosting | Amazon S3 |
| Content Delivery Network (CDN) | Amazon CloudFront |
| API Management | Amazon API Gateway |
| Serverless Compute | AWS Lambda |
| Analytics Database | Amazon DynamoDB |
| Event Notification | Amazon EventBridge, Amazon SNS, Amazon SES |
| AI Backend | FastAPI |
| Container Platform | Google Cloud Run |
| Large Language Model (LLM) | Gemini 2.5 Flash |
| Embedding Model | Vertex AI Embedding API |
| Knowledge Base Storage | Google Cloud Storage |
| Conversation Memory | Firestore |
| RAG Analytics | Firestore |
| Streaming Response | Server-Sent Events (SSE) |
| Version Control | GitHub |
| CI/CD | GitHub Actions |
| Infrastructure as Code (Planned) | Terraform |
| Monitoring & Logging | Amazon CloudWatch, Google Cloud Logging |

##

##

##

## **Technology Architecture by Platform**

### **AWS Services**

| **Service** | **Purpose** |
| --- | --- |
| Amazon S3 | 前端靜態網站託管 |
| Amazon CloudFront | CDN 與 HTTPS 傳輸 |
| Amazon API Gateway | API 入口層 |
| AWS Lambda | Serverless 業務邏輯 |
| Amazon DynamoDB | Views、Contact 與 Notification 資料儲存 |
| Amazon EventBridge | 事件觸發機制 |
| Amazon SNS | 通知服務 |
| Amazon SES | Email 發送服務 |
| Amazon CloudWatch | 監控與日誌管理 |

### **Google Cloud Platform Services**

| **Service** | **Purpose** |
| --- | --- |
| Cloud Run | FastAPI 後端部署 |
| Vertex AI Gemini | AI 回答生成 |
| Vertex AI Embedding | 文件向量化 |
| Google Cloud Storage | RAG 原始文件儲存 |
| Firestore | Conversation Memory 與 Analytics |
| Cloud Logging | 系統日誌監控 |

### **Development & DevOps Tools**

| **Tool** | **Purpose** |
| --- | --- |
| GitHub | 原始碼管理 |
| GitHub Actions | 自動化部署流程 |
| Terraform | Infrastructure as Code（規劃中） |
| Docker | Cloud Run 容器化部署 |
| VS Code | 開發環境 |
| Mermaid | 架構圖與流程圖繪製 |
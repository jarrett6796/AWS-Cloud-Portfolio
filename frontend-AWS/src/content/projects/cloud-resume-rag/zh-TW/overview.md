---
title: 專案概述
---
# 專案介紹
> Capstone Project

AWS Cloud Resume + GCP RAG 是一個多雲工程作品集，結合 AWS 靜態網站交付、serverless visitor counter，以及 GCP-native RAG 助理。

這個專案展示可公開瀏覽的雲端作品集、可運作的 AWS 訪客計數器，以及部署在 Cloud Run 上、能以 Firestore 文件 chunks 和 Gemini 產生 grounded answers 的 AI backend。

# 功能特色
- 使用 AWS S3 與 CloudFront 交付 React + Vite 靜態作品集。
- 使用 API Gateway、Lambda、DynamoDB 建立 AWS visitor counter。
- 使用 Cloud Run、FastAPI、Firestore、Cloud Storage、Gemini 建立 GCP RAG backend。
- 透過 `POST /ask-rag-stream` 支援 streaming assistant responses。
- 以 Firestore 保存 persistent chat sessions。
- 回答包含 visible source IDs，支援來源追蹤。
- 支援 metadata-only RAG analytics 與 admin-only analytics summary endpoint。

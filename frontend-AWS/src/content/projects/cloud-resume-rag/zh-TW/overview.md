---
title: 專案概述
---

# Hi

# 1

## 2

## Project Summary

## Abc

# efg

> Capstone Project

AWS Cloud Resume + GCP RAG 是一個多雲工程作品集，結合 AWS 靜態網站交付、serverless visitor counter，以及 GCP-native RAG 助理。

這個專案展示可公開瀏覽的雲端作品集、可運作的 GCP Cloud Run RAG backend，以及已文件化的 AWS Cloud Resume 架構。原本 AWS account 中的 S3、CloudFront、API Gateway、Lambda、DynamoDB 曾經部署並可運作，但原 AWS account 已不可用；目前 AWS infrastructure 必須視為新帳號中的 migration/rebuild workstream。

## Problem Statement

Static resume 無法完整展示 architecture decisions、deployment evidence 與 troubleshooting depth。作品集需要以互動方式說明雲端工程能力，同時清楚區分 currently deployed、previously operational 與 planned work。

## Project Goals

- 呈現以 AWS Cloud Resume Challenge + GCP RAG 為核心的 multi-cloud portfolio。
- 保留 AWS historical deployment evidence，但不把 old-account resources 描述成 currently deployed。
- 在新的 AWS account 重建 delivery、visitor counter、notification、IAM 與 CI/CD integration。
- 讓 GCP RAG assistant 持續以 project documentation 為 grounding source。

## Key Features

- React + Vite portfolio，支援 bilingual content 與 project documentation modal。
- Previous AWS visitor counter architecture 使用 API Gateway、Lambda、DynamoDB。
- 使用 Cloud Run、FastAPI、Firestore、Cloud Storage、Gemini 建立 GCP RAG backend。
- 透過 `POST /ask-rag-stream` 支援 streaming assistant responses。
- 以 Firestore 保存 persistent chat sessions。
- 回答包含 visible source IDs，支援來源追蹤。
- 支援 metadata-only RAG analytics 與 admin-only analytics summary endpoint。

## Learning Outcome

- Current implemented scope：frontend application、documentation portal、GCP RAG backend、streaming assistant、Firestore memory、RAG analytics、backend CI/CD evaluation。
- AWS rebuild scope：S3、CloudFront、Lambda、API Gateway、DynamoDB、SNS、EventBridge、IAM roles and policies、frontend deployment integration。
- Planned portfolio scope：event-driven notifications、URL shortener、QR code generator、real-time chat、video streaming platform。

## Current Status

- 已完成 modular React/Vite frontend 與 deployed GCP RAG backend。
- 已實作 intermediate RAG with several advanced features，包含 citation validation、metadata filtering、multi-query retrieval、streaming、persistent memory 與 analytics。
- 已明確記錄 AWS account migration boundary，避免誤把 historical AWS work 描述成 current deployment。

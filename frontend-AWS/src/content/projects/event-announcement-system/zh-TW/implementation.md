---
title: 實作細節
---
# 前端
目前作品集將此專案呈現為 cloud architecture case study。Production UI 可延伸 event creation、subscriber management、event history views。

# 後端
Lambda handlers 負責 event validation、message processing，以及 persistence boundaries。

# GCP-RAG
這是 AWS-focused project。GCP-RAG 不屬於 event announcement runtime。

# 資料庫
DynamoDB 根據 access patterns 保存 event records 或 processing state。

# API
API Gateway 提供 publish event announcements 的 request boundary。

# 網路架構
Public API traffic 進入 API Gateway，後端 fan-out 由 AWS managed service path 處理。

# 安全性
IAM roles 應限制 Lambda、SNS、DynamoDB 的最小權限。API boundary 應加入 authentication、validation、rate limiting。

# 部署流程
部署流程應建立 API Gateway routes、Lambda functions、SNS topics、DynamoDB tables，以及 CloudWatch log groups。

# CI/CD
CI/CD pipeline 可加入 lint、unit tests、package validation、infrastructure deployment stages。

# IaC
Infrastructure as Code 應管理 API Gateway、Lambda、SNS、DynamoDB、IAM permissions。

# 監控
CloudWatch logs、Lambda error metrics、SNS delivery metrics、DynamoDB throttling metrics 是主要觀測面。

# Troubleshooting
- 檢查 API Gateway status code 與 request logs。
- 檢查 Lambda error logs 與 timeout。
- 檢查 SNS subscription delivery 狀態。
- 檢查 DynamoDB permissions 與 capacity throttling。

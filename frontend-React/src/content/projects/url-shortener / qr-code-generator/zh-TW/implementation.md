---
title: Implementation
---

# Implementation

## Implementation Overview

Status: Planned / Documentation Placeholder

目前 inspected repository 尚未找到此 project 的 confirmed source implementation。以下內容描述預期設計方向，應在 code、infrastructure、tests 與 deployment evidence 完成後更新。

## Frontend Implementation

規劃中的 frontend 是 React form，接受 destination URL、optional alias 與 optional expiration date。UI 應顯示 validation errors、generated short links、copy actions 與基本狀態回饋。

## Backend Implementation

規劃中的 backend 使用 API Gateway 與 Lambda。Lambda 應處理 create requests、redirect lookups、click counter updates 與 expiration checks。

## Database / Storage

DynamoDB 可使用 `shortCode` 作為 primary lookup key。

| Field | Purpose |
| --- | --- |
| `shortCode` | Primary lookup key |
| `targetUrl` | Original destination |
| `createdAt` | Creation timestamp |
| `expiresAt` | Optional expiration timestamp |
| `clickCount` | Redirect count |
| `customAlias` | Optional user-selected alias |

## API Design

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/links` | Create a short URL |
| `GET` | `/{shortCode}` | Redirect to the target URL |
| `GET` | `/links/{shortCode}` | Return metadata for a short URL |

Example request shape:

```json
{
  "targetUrl": "https://example.com",
  "customAlias": "demo"
}
```

## Security Considerations

- 儲存前驗證 URL format。
- 考慮阻擋 private network targets 與 dangerous schemes。
- 對 create requests 加入 rate limit。
- API errors 不應暴露 internal DynamoDB details。
- 將 custom aliases 視為 untrusted input。

## Deployment Notes

規劃部署方式為 S3/CloudFront 交付 frontend，API Gateway/Lambda 處理 backend logic，DynamoDB 持久化資料，CloudWatch 保存 logs。

## Current Limitations

- 尚未確認 source implementation。
- 尚未確認 Terraform 或 AWS deployment evidence。
- 尚未找到 URL creation 或 redirect behavior 的 tests。

## Future Improvements

- 加入 link management authentication。
- 加入 referrer/date analytics。
- 加入 abuse protection 與 safe browsing checks。
- 加入 infrastructure as code。
- 加入 create 與 redirect flows 的 end-to-end tests。

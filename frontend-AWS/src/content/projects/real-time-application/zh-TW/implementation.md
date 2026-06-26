---
title: Implementation
---

# Implementation

## Implementation Overview

Status: Planned / Documentation Placeholder

目前尚未找到此 real-time project 的 confirmed implementation source。以下內容描述預期 serverless WebSocket implementation。

## Frontend Implementation

規劃中的 frontend 應開啟 WebSocket connection、顯示 connection status、送出 messages/events，並在不重新整理頁面的情況下 render real-time updates。

## Backend Implementation

規劃中的 backend 應使用 separate Lambda handlers 處理 `$connect`、`$disconnect` 與 message routes。Message handlers 應驗證 payloads，並透過 API Gateway management API broadcast 給 active connections。

## Database / Storage

DynamoDB 可儲存 active connections。

| Field | Purpose |
| --- | --- |
| `connectionId` | WebSocket connection identifier |
| `connectedAt` | Connection timestamp |
| `userLabel` | Optional display/session label |
| `ttl` | Optional cleanup timestamp |

## API Design

| Route | Purpose |
| --- | --- |
| `$connect` | Register a connection |
| `$disconnect` | Remove a connection |
| `sendMessage` | Receive and broadcast a message |
| `ping` | Optional keepalive route |

Example message shape:

```json
{
  "action": "sendMessage",
  "message": "hello"
}
```

## Security Considerations

- 驗證 message payloads。
- 限制 message size。
- 清理 stale connections。
- 避免 broadcast unsafe HTML。
- 在 private rooms 或 user-specific messages 前考慮 auth。

## Deployment Notes

規劃部署應定義 WebSocket API routes、Lambda integrations、DynamoDB table permissions 與 CloudWatch log groups。Environment variables 應包含 connection table name 與 callback endpoint。

## Current Limitations

- 尚未確認 source implementation。
- 尚未確認 deployment evidence。
- 尚未建立 browser-level WebSocket test。

## Future Improvements

- 加入 private rooms。
- 加入 authenticated users。
- 加入 message persistence。
- 加入 dead connection cleanup。
- 加入 load 與 reconnect testing。

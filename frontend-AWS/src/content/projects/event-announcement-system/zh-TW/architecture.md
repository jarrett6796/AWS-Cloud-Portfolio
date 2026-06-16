---
title: 架構設計
---
# 架構圖
Publishers 透過 API boundary 發送 event announcements。SNS 將 event 分送給 subscribers，Lambda handlers 處理 messages，DynamoDB 保存 event-related state。

# 系統模組
| Layer | Service or Component |
| --- | --- |
| API Layer | API Gateway |
| Event Layer | SNS |
| Compute Layer | Lambda |
| Data Layer | DynamoDB |
| Operations Layer | CloudWatch |

# 工作流程
| Step | Component | Role |
| --- | --- | --- |
| 1 | API Gateway | 接收 event publish request |
| 2 | SNS | Fan out announcement message |
| 3 | Lambda | Validate and process message |
| 4 | DynamoDB | Store event state |
| 5 | CloudWatch | Capture logs and metrics |

# 技術棧
- AWS API Gateway
- AWS Lambda
- Amazon SNS
- Amazon DynamoDB
- Amazon CloudWatch

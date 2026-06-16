---
title: 架構設計
---
# 架構圖
Static frontend 呼叫 API backend 執行 recipe actions。Backend handlers 驗證 requests，並將 recipe records 保存到 DynamoDB。

# 系統模組
| Layer | Service or Component |
| --- | --- |
| Frontend Layer | React |
| API Layer | FastAPI |
| Cloud Layer | AWS |
| Data Layer | DynamoDB |
| Delivery Layer | CloudFront |

# 工作流程
| Step | Component | Role |
| --- | --- | --- |
| 1 | React | User-facing recipe workflow |
| 2 | FastAPI | Request validation and application logic |
| 3 | DynamoDB | Recipe persistence |
| 4 | AWS infrastructure | Networking, delivery, and scaling |

# 技術棧
- React
- FastAPI
- DynamoDB
- AWS CloudFront
- Application Load Balancer
- Auto Scaling Group
- CloudFormation

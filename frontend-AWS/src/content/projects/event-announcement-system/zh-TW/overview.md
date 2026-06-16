---
title: 專案概述
---
# 專案介紹
> Serverless Events

Event Announcement System 是使用 AWS API Gateway、Lambda、SNS、DynamoDB 建立的 serverless notification platform。

這個專案展示 event-driven cloud fundamentals：接收 event publish request、fan out messages、使用 managed compute 處理訊息，並保留可觀測的 operational logs。

# 功能特色
- API-driven event publishing。
- SNS-based fan-out。
- Lambda workers 負責 message processing。
- DynamoDB-backed event metadata。
- CloudWatch-friendly operational flow。

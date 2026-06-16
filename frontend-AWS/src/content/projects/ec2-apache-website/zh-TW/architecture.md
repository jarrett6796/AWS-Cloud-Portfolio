---
title: 架構設計
---
# 架構圖
Browser 透過允許 inbound HTTP traffic 的 security group 存取 EC2 instance。Apache 從 Linux host 提供網站內容。

# 系統模組
| Layer | Service or Component |
| --- | --- |
| Compute Layer | EC2 |
| OS Layer | Linux |
| Web Layer | Apache |
| Network Layer | Security Groups |

# 工作流程
| Step | Component | Role |
| --- | --- | --- |
| 1 | Browser | Sends HTTP request |
| 2 | Security Group | Allows inbound HTTP |
| 3 | EC2 | Hosts Linux server |
| 4 | Apache | Serves website content |

# 技術棧
- Amazon EC2
- Linux
- Apache
- Security Groups

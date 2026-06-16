---
title: 架構設計
---
# 架構圖
Source changes 觸發 Jenkins stages，依序進行 checkout、build、validation、image preparation、release handoff。

# 系統模組
| Layer | Service or Component |
| --- | --- |
| Source Layer | Git |
| CI Layer | Jenkins |
| Build Layer | Docker |
| Delivery Layer | Pipeline stages |

# 工作流程
| Step | Component | Role |
| --- | --- | --- |
| 1 | Git | Source change input |
| 2 | Jenkins | Pipeline orchestration |
| 3 | Docker | Build environment and artifact packaging |
| 4 | Pipeline stages | Validation and delivery handoff |

# 技術棧
- Git
- Jenkins
- Docker
- Pipeline automation

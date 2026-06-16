---
title: Architecture
---
# Architecture Diagram
Publishers send event announcements through an API boundary. SNS distributes the event to subscribers, Lambda handlers process messages, and DynamoDB stores event-related state.

# System Module
| Layer | Service or Component |
| --- | --- |
| API Layer | API Gateway |
| Event Layer | SNS |
| Compute Layer | Lambda |
| Data Layer | DynamoDB |
| Operations Layer | CloudWatch |

# Workflow
| Step | Component | Role |
| --- | --- | --- |
| 1 | API Gateway | Receives event publish request |
| 2 | SNS | Fans out event notifications |
| 3 | Lambda | Processes subscriber workload |
| 4 | DynamoDB | Stores event metadata |
| 5 | CloudWatch | Captures logs and operational signals |

# Technology Stack
| Area | Technologies |
| --- | --- |
| Cloud | AWS |
| Messaging | SNS |
| Compute | Lambda |
| Database | DynamoDB |
| Operations | CloudWatch |

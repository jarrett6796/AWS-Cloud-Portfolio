# Architecture Diagram
The static frontend calls an API backend for recipe actions. Backend handlers validate requests and store recipe records in DynamoDB.

# System Module
| Layer | Service or Component |
| --- | --- |
| Frontend Layer | React |
| API Layer | FastAPI |
| Cloud Layer | AWS |
| Data Layer | DynamoDB |

# Workflow
| Step | Component | Role |
| --- | --- | --- |
| 1 | React | User-facing recipe workflow |
| 2 | FastAPI | Request validation and application logic |
| 3 | DynamoDB | Recipe persistence |
| 4 | AWS hosting | Delivery and runtime environment |

# Technology Stack
| Area | Technologies |
| --- | --- |
| Frontend | React |
| Backend | FastAPI |
| Cloud | AWS |
| Database | DynamoDB |

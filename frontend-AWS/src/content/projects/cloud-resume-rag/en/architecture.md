---
title: Architecture
---
# Architecture Diagram
The frontend is delivered as a static React application through AWS. Visitor metrics remain on the AWS serverless path, while assistant questions are routed to a GCP Cloud Run backend for retrieval and grounded answer generation.

![AWS + GCP RAG architecture diagram](/architecture/aws-gcp-rag-architecture.png)

# System Module
| Layer | Service or Component |
| --- | --- |
| Frontend Layer | React |
| Frontend Layer | Vite |
| Frontend Layer | S3 |
| Frontend Layer | CloudFront |
| AWS Serverless Layer | API Gateway |
| AWS Serverless Layer | Lambda |
| AWS Serverless Layer | DynamoDB |
| GCP AI Backend Layer | Cloud Run |
| GCP AI Backend Layer | Firestore |
| GCP AI Backend Layer | Cloud Storage |
| GCP AI Backend Layer | Vertex AI Gemini |

# Workflow
| Step | Component | Role |
| --- | --- | --- |
| 1 | React + Vite | Browser application and project documentation UI |
| 2 | CloudFront | Static asset delivery |
| 3 | API Gateway | Visitor counter API boundary |
| 4 | Lambda | Visitor counter compute |
| 5 | DynamoDB | Visitor count persistence |
| 6 | Cloud Run | RAG API runtime |
| 7 | Firestore | Document chunks, conversations, and analytics |
| 8 | Gemini | Grounded answer generation |

## Reference Flow
```text
React + Vite -> CloudFront -> API Gateway -> Lambda -> DynamoDB
React + Vite -> Cloud Run -> Firestore -> Gemini
```

# Technology Stack
| Area | Technologies |
| --- | --- |
| Frontend | React, Vite, JavaScript, CSS |
| AWS | S3, CloudFront, API Gateway, Lambda, DynamoDB |
| GCP | Cloud Run, Firestore, Cloud Storage, Vertex AI |
| AI/RAG | Gemini, text-embedding-005, source citations |
| Delivery | GitHub Actions, Docker, AWS CLI, gcloud |

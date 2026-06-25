# Project Audit and Roadmap Alignment

Date: 2026-06-25

## Audit Report

### Current Architecture

The active repository contains a React/Vite frontend in `frontend-AWS`, a FastAPI RAG backend in `backend-GCP`, GitHub Actions workflows for frontend AWS deployment and backend GCP Cloud Run deployment, markdown-backed project documentation, and Terraform planning documentation.

The current implemented AI path is:

```text
React/Vite frontend
  -> POST /ask-rag-stream or /ask-rag
  -> GCP Cloud Run FastAPI
  -> Firestore conversations and document_chunks
  -> Cloud Storage source documents
  -> Vertex AI Gemini and text-embedding-005
```

The AWS path must now be treated as a migration/rebuild target. The previous AWS account had S3, CloudFront, Lambda, API Gateway, and DynamoDB resources that were deployed and operational. The original account is no longer available, so the new AWS account must rebuild S3, CloudFront, Lambda, API Gateway, DynamoDB, SNS, EventBridge, IAM roles and policies, and CI/CD deployment integration.

### Implementation Status

- Implemented: modular React/Vite frontend, project documentation modal, GCP Cloud Run RAG backend, streaming responses, persistent Firestore chat memory, admin-token ingestion, metadata-only RAG analytics, admin-only analytics summary, backend CI tests, threshold-aware RAG evaluation workflow, expanded RAG metadata filtering, and public RAG endpoint rate limiting.
- Previously operational but rebuild required: AWS static hosting, CloudFront delivery, API Gateway/Lambda/DynamoDB visitor counter.
- Planned only: Event-Driven Notification System, URL Shortener, QR Code Generator, Real-Time Chat Application, and Video Streaming Platform.

### Existing Roadmap

The Advanced RAG roadmap remains valid as a maturity ladder:

1. Retrieval quality quick wins
2. Better retrieval logic
3. Evaluation and observability
4. Managed vector retrieval
5. Advanced RAG patterns

Agentic RAG should remain future research only until monitoring, managed vector retrieval, reranking, memory summarization, and distributed production-grade rate limiting are more mature.

### Existing Portfolio Projects

Confirmed active portfolio roadmap:

1. AWS Cloud Resume Challenge + GCP RAG Capstone
2. Event-Driven Notification System
3. URL Shortener
4. QR Code Generator
5. Real-Time Chat Application
6. Video Streaming Platform

Recipe Sharing App, Jenkins CI/CD, and EC2 Apache Website are historical learning artifacts in this repository, not the current planned portfolio roadmap.

### Documentation Consistency

The main inconsistencies found were:

- Current-facing docs described AWS resources as deployed even though the AWS account has changed.
- Portfolio content still referenced Bedrock and S3 Vectors as current-facing RAG technologies.
- Several current-state docs still referenced `frontend-Vite` while the active app is `frontend-AWS`.
- Terraform planning assumed old-account AWS import-first adoption; AWS now needs rebuild-first planning.
- The portfolio cards did not match the confirmed six-project roadmap.

### Technical Debt

- No repo-local Lambda source, API Gateway configuration, DynamoDB schema, IAM policy, SNS/EventBridge design, or AWS IaC exists for the rebuilt account yet.
- `frontend-AWS/src/api/visitors.js` still hard-codes the old API Gateway visitor endpoint.
- `frontend-AWS/README.md` remains generic and should be replaced with a project-specific README.
- Cloud Run environment variable ownership is split across code defaults and GitHub Actions; Terraform ownership boundaries remain undecided.
- Firestore retrieval now has a code-gated Firestore Vector Search backend with local full-scan fallback, but live vector-search mode still requires index creation and reingestion before it should replace local mode.
- The current rate limiter is in-memory and suitable for Phase 1 abuse control only; distributed quota enforcement remains future work.
- The RAG evaluation framework now has 50 golden questions and threshold reporting; after the Phase 2.6 source audit and controlled reingestion, the live baseline improved from 4/50 to 30/50, so CI remains soft-fail until the remaining failing cases are resolved.

### Outdated Information

- Old planned projects were visible in portfolio card data.
- Bedrock/S3 Vectors appeared in current-facing hero/skills copy.
- Several docs implied the previous AWS infrastructure was still live.
- Terraform import guidance was written before the AWS account migration.

### Missing Implementation Evidence

- AWS backend deployment evidence for API Gateway, Lambda, DynamoDB, SES, EventBridge, and SNS.
- Terraform resource inventory.
- AWS Lambda visitor counter source and IAM policy definitions.
- SNS/EventBridge notification workflow implementation.
- URL shortener, QR code generator, real-time chat, and video streaming implementation artifacts.
- Production monitoring dashboard and alerting evidence.

## Updated Roadmap

### AWS-Only Execution Scope - 2026-06-24

Today the execution focus is the AWS rebuild in the new AWS account. GCP RAG will continue later and is outside today's AWS execution scope.

AWS-side modules only:

| Module | Feature | AWS Services | Status |
| --- | --- | --- | --- |
| Portfolio Module | Portfolio Display | Amazon S3, Amazon CloudFront | Current |
| Portfolio Module | Project Documentation | Amazon S3, Amazon CloudFront | Current |
| Analytics Module | Web View Counter | API Gateway, Lambda, DynamoDB | Planned |
| Analytics Module | Project View Counter | API Gateway, Lambda, DynamoDB | Planned |
| Contact Module | Contact Form | React Form, API Gateway, Lambda, SES | Planned |
| Event Notification Module | Event Notification | EventBridge, Lambda, SNS | Planned |

Not included in today's AWS rebuild scope:

- AI Assistant
- Knowledge Management
- Advanced RAG
- Memory
- RAG Analytics

Those items belong to the GCP RAG system and should not be mixed into the AWS rebuild plan.

### Current Phase

✅ Phase 1 - Portfolio Hosting Complete

Completed components:

- S3
- CloudFront
- Origin Access Control
- S3 bucket policy for CloudFront access
- SPA routing:
  - `403 -> /index.html -> 200`
  - `404 -> /index.html -> 200`
- Frontend Deployment
- CloudFront cache invalidation
- Production website verification
- Visitor API fallback through `VITE_VISITOR_API_URL` handling

### Immediate

1. Rebuild the web view counter with API Gateway + Lambda + DynamoDB.
2. Add the project view counter with API Gateway + Lambda + DynamoDB.
3. Add the contact form with React Form + API Gateway + Lambda + SES.
4. Add event notification with EventBridge + Lambda + SNS.
5. Create `Statement_MD/TERRAFORM_RESOURCE_INVENTORY.md` from verified new-account AWS resource IDs.
6. Replace the frontend README with project-specific setup, deployment, and AWS rebuild notes.

Reasoning:

- Website hosting came first because it is the frontend foundation. This phase is complete.
- Web view counter comes second because it rebuilds the original Cloud Resume Challenge backend.
- Project view counter comes third because it reuses the same API Gateway/Lambda/DynamoDB pattern.
- Contact form comes later because it requires SES plus spam/security handling.
- Event notification comes last because it is more event-driven and architecture-heavy.

### Next Phase

🔄 Phase 2 - Web View Counter

Planned architecture:

```text
User
↓
CloudFront
↓
React Frontend
↓
API Gateway
↓
Lambda
↓
DynamoDB
```

The visitor API should be provided to the frontend through `VITE_VISITOR_API_URL` after the new API Gateway endpoint is created.

### Future Phases

- Project View Counter
- Contact Form
- Event Notification

### Short-Term

1. Implement the Project View Counter after the web view counter is verified.
2. Implement the Contact Form after hosting and counters are verified.
3. Implement Event Notification with EventBridge, SNS, and Lambda after the contact and counter flows are stable.
4. Add Terraform structure, placeholder modules, validation workflow, and sandbox AWS resources.
5. Keep GCP RAG execution outside this AWS rebuild phase.

### Long-Term

1. Implement URL Shortener, QR Code Generator, Real-Time Chat Application, and Video Streaming Platform as separate portfolio projects.
2. Calibrate or fix the remaining 20 failing RAG evaluation cases without weakening factual expectations, then move the CI gate from soft-fail to blocking.
3. Create the Firestore vector index, reingest embeddings as Firestore vectors, and run the 50-case evaluation with `RAG_VECTOR_SEARCH_BACKEND=firestore_vector`.
4. Add a semantic reranker, memory summarization, and distributed rate limiting.
5. Treat Vertex AI Vector Search as a later scale option only after Firestore Vector Search is validated.
6. Treat Agentic RAG as future research only after the core system is observable and scalable.

## Terraform Review

Existing Terraform planning remains valid for structure, safety rules, CI separation, and GCP import-first thinking. It needs these changes:

- AWS should be rebuild-first in the new account, not old-resource import-first.
- Add modules for `aws-event-notifications` and `aws-iam-deployment`.
- Keep CloudFront invalidations in the frontend deployment workflow.
- Do not manage Firestore application documents, RAG chunks, embeddings, or GitHub secrets in Terraform.
- Do not run Terraform apply until inventory, sandbox validation, and state strategy are documented.

## Recommendations

### Immediate

- Rebuild AWS infrastructure before describing it as current.
- Keep historical AWS evidence clearly labeled as previous state.
- Update deployment secrets only after new resources exist.

### Short-Term

- Implement the notification system as the next AWS project because it extends the Cloud Resume architecture naturally.
- Add Terraform validation without production apply.
- Add monitoring dashboard work before advanced RAG research.

### Long-Term

- Move toward managed vector search and semantic reranking.
- Build the remaining roadmap projects one at a time with implementation evidence, tests, and project docs.
- Keep Agentic RAG out of current implementation claims until the core RAG system is production-hardened.

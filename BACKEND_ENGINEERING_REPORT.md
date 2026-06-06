# Backend Engineering Report

## 1. Executive Summary

This report documents the backend engineering journey for my cloud engineering portfolio and RAG assistant project. The backend began with an intended AWS Lambda and Bedrock RAG direction, but the working production implementation pivoted to Google Cloud Platform so I could complete an end-to-end deployed RAG assistant. The current backend runs on Cloud Run with FastAPI, uses Vertex AI Gemini for generation, uses `text-embedding-005` for embeddings, stores document chunks and conversation memory in Firestore, and reads source documents from Google Cloud Storage.

The backend is currently best described as Intermediate RAG with several advanced RAG features already implemented. It is beyond a naive chunk/embed/retrieve/generate prototype because it includes modular service boundaries, persistent chat memory, streaming responses, source IDs, grounded citation prompting, Markdown-aware chunking, deterministic ingestion, content hashes, retrieval thresholds, optional hybrid scoring, optional reranking, structured logging, health checks, request IDs, and protected document ingestion.

The most important engineering outcome was moving from an MVP-shaped backend toward a maintainable Cloud Run service without breaking the public API. I refactored the backend incrementally into config, schemas, routes, and services while preserving the Cloud Run entrypoint and endpoint behavior.

## 2. Project Objective

My backend objective was to build a working AI assistant backend that could answer questions about my project documentation using retrieved context rather than generic model knowledge.

The backend needed to:

- Run as a deployed serverless backend.
- Load project documentation from cloud storage.
- Chunk and embed documentation.
- Store searchable document chunks.
- Retrieve relevant context for a user question.
- Generate grounded answers with Gemini.
- Return sources to the frontend.
- Support persistent chat sessions.
- Stream responses for better user experience.
- Protect administrative ingestion functionality.
- Remain understandable as a portfolio and interview artifact.

The original plan used AWS API Gateway, Lambda, Bedrock, Bedrock Knowledge Bases, S3 document storage, and S3 Vectors. That plan remained valuable as architecture research, but access and configuration complexity slowed progress. I decided to keep AWS for the serverless visitor counter and move the RAG backend to GCP. That pivot allowed me to ship a working RAG system while still demonstrating cloud engineering across both AWS and GCP.

## 3. Backend Architecture Overview

The current backend is a FastAPI application deployed on Cloud Run in `asia-east1`. It integrates with Firestore, Google Cloud Storage, and Vertex AI.

```text
React Frontend
  |
  | POST /ask-rag-stream or POST /ask-rag
  v
Cloud Run FastAPI Backend
  |
  +--> Firestore conversations
  |      session history for follow-up context
  |
  +--> Firestore document_chunks
  |      retrieved project documentation chunks
  |
  +--> Vertex AI text-embedding-005
  |      question and document embeddings
  |
  +--> Vertex AI Gemini 2.5 Flash
         grounded answer generation
```

The backend file structure is modular:

```text
backend-GCP/
  app/
    config/
      settings.py
    schemas/
      chat_schema.py
    routes/
      chat.py
      health.py
      rag.py
    services/
      firestore_service.py
      gcs_service.py
      gemini_service.py
      ingestion_service.py
      rag_service.py
      vector_service.py
  Dockerfile
  main.py
  requirements.txt
```

`main.py` is intentionally thin. It creates the FastAPI app, applies CORS settings, and registers route modules. Business logic lives in services, and configuration lives in `app/config/settings.py`.

The target pattern is:

```text
request -> route -> service -> provider/client
```

The refactor moved the backend away from the long-term anti-pattern:

```text
request -> main.py -> everything
```

## 4. Backend Development Timeline

### Original AWS RAG Direction

The first backend direction was based on AWS Lambda and Amazon Bedrock. The intended architecture included API Gateway, Lambda, Bedrock, Bedrock Knowledge Bases, S3 document storage, and S3 Vectors.

The challenge was practical implementation speed. Lambda and Bedrock RAG access, configuration, and architecture complexity would have delayed a working end-to-end assistant. I decided to defer the AWS RAG path and keep AWS focused on the deployed visitor counter milestone.

### GCP RAG Pivot

The new backend stack became:

- Cloud Run
- FastAPI
- Vertex AI Gemini API
- Firestore
- Google Cloud Storage

This pivot preserved the serverless backend goal while making it easier to deploy a working RAG assistant. It also created a stronger portfolio story: AWS for serverless fundamentals and GCP for AI/RAG engineering.

### Initial FastAPI Service

The first Cloud Run backend exposed core endpoints:

- `GET /`
- `POST /chat`
- `POST /chat-with-docs`
- `POST /ingest-docs`
- `POST /ask-rag`

At this stage, the backend was MVP-shaped. It proved the service could run on Cloud Run, call Gemini, read documents, and return answers to the frontend.

### Gemini Integration

The backend integrated Gemini for basic answer generation. Later refactoring moved Gemini setup and calls into `app/services/gemini_service.py`.

Generation currently uses:

```text
gemini-2.5-flash
```

This model is used to generate final assistant answers from retrieved project context and conversation context.

### GCS Document Context

The backend stores source Markdown documents in a Cloud Storage bucket:

```text
cloud-resume-ai-rag-docs
```

The `/chat-with-docs` endpoint first supported direct document-context prompting by loading selected GCS files and passing their contents to Gemini. This helped prove the assistant could answer from project documentation before vector retrieval was fully implemented.

### Embedding Implementation

The backend then implemented embedding generation with:

```text
text-embedding-005
```

Document chunks are embedded during ingestion, and user questions are embedded during retrieval. This established the foundation for semantic search.

### Firestore Document Storage

The backend stores embedded chunks in Firestore:

```text
document_chunks
```

Early chunk documents included fields such as file name, chunk index, chunk text, and embedding. Later phases added metadata such as headings, character count, and content hash.

### Ingestion Pipeline

The `/ingest-docs` endpoint reads Markdown files from GCS, chunks the text, generates embeddings, and stores the results in Firestore.

The ingestion pipeline improved over time:

- Initial fixed-size chunking.
- Markdown-aware chunking.
- Heading preservation.
- Paragraph-boundary splitting.
- Deterministic Firestore chunk IDs.
- Stale duplicate pruning.
- Content hashing and metadata.
- Admin-token protection.

These improvements made ingestion more repeatable and safer to operate.

### RAG Retrieval

The `/ask-rag` endpoint embeds the user question, scans Firestore chunks, calculates cosine similarity, selects top chunks, builds retrieved context, sends the context to Gemini, and returns an answer with sources.

The retrieval flow started as a basic vector similarity search and later gained candidate pool sizing, score thresholds, optional hybrid keyword scoring, optional deterministic reranking, and source IDs.

### Persistent Chat Memory

The backend later added Firestore conversation history:

```text
conversations/{session_id}/messages/{message_id}
```

The frontend sends `session_id` with each request. The backend loads recent conversation messages before prompt construction and saves both user and assistant messages after response generation.

The prompt treats conversation history as follow-up context only. Retrieved document chunks remain the factual source for answers.

### Streaming Endpoint

The backend added `POST /ask-rag-stream` so the frontend could render answers progressively.

The streaming endpoint uses the same retrieval and prompt construction as `/ask-rag`, but returns server-sent events:

```text
metadata
token
done
error
```

This preserved retrieval consistency while improving frontend responsiveness.

### Production Hardening

The backend gained controlled error handling, structured logging, request IDs, request duration headers, startup warnings, root health details, and `GET /healthz`.

The production hardening work also included CORS fixes for the live CloudFront frontend. The production assistant failed because the backend allowed local Vite origins but not the CloudFront origin. After adding the CloudFront origin to backend CORS defaults and deployment environment variables, the live frontend successfully connected to Cloud Run.

### Protected Ingestion Endpoint

The ingestion endpoint became admin-only through an `X-Admin-Token` header backed by the `INGESTION_ADMIN_TOKEN` environment variable. Public assistant routes remain unauthenticated, while ingestion is protected from public use.

## 5. RAG Architecture Evolution

The backend evolved through three conceptual stages.

### Naive RAG

The earliest RAG implementation followed the basic path:

```text
documents -> chunks -> embeddings -> vector similarity -> Gemini answer
```

This proved the core concept but was not enough for reliable production behavior.

### Intermediate RAG

The current system is Intermediate RAG with several advanced features. It includes:

- Cloud Run FastAPI deployment.
- Vertex AI Gemini 2.5 Flash.
- Vertex AI `text-embedding-005`.
- Firestore `document_chunks`.
- Firestore `conversations`.
- Markdown-aware chunking.
- Deterministic ingestion.
- Content hashes and metadata.
- Candidate pool retrieval.
- Score thresholds.
- Optional hybrid keyword plus vector scoring.
- Optional deterministic reranking.
- Source IDs and grounded citation prompting.
- Persistent chat history.
- Streaming responses.
- Protected ingestion.
- Structured logging and health checks.

### Advanced RAG Roadmap

The project is not fully production-grade Advanced RAG yet because retrieval still scans Firestore in memory and does not use a managed vector index. Future work should add query rewriting, multi-query retrieval, no-answer confidence handling, RAG evaluation, observability dashboards, and managed vector search.

## 6. Current Retrieval Pipeline

The current retrieval pipeline works as follows:

```text
User question
  |
  v
Route handler
  |
  v
Load recent Firestore conversation history
  |
  v
Embed question with text-embedding-005
  |
  v
Load candidate chunks from Firestore document_chunks
  |
  v
Score chunks with cosine similarity
  |
  +--> optional keyword scoring
  |
  +--> optional deterministic reranking
  |
  v
Filter weak scores and select top-k chunks
  |
  v
Assign source IDs such as S1, S2, S3
  |
  v
Build grounded prompt with retrieved context
  |
  v
Generate answer with gemini-2.5-flash
  |
  v
Save user and assistant messages to Firestore
  |
  v
Return answer, sources, and session_id
```

For streaming, the backend shares the same RAG context construction and then emits events:

```text
metadata: session_id and sources
token: partial answer text
token: partial answer text
done: completed response
```

This design avoids separate retrieval behavior between streaming and non-streaming endpoints.

## 7. Firestore Design

The backend uses Firestore for both retrieval data and conversation memory.

### document_chunks

The `document_chunks` collection stores embedded project documentation chunks.

Key fields include:

- `file_name`
- `chunk_index`
- `chunk_text`
- `embedding`
- `heading`
- `char_count`
- `content_hash`

The collection supports RAG retrieval. Current retrieval scans Firestore chunks in memory, computes scores locally, and selects the most relevant chunks.

### conversations

The `conversations` collection stores persistent chat sessions:

```text
conversations
  {session_id}
    messages
      {message_id}
```

Message fields include:

- `role`
- `content`
- `created_at`
- `request_id`

This design lets the frontend keep a stable session ID while the backend owns durable memory.

### Message Usage Boundary

Conversation messages are used for follow-up context, not factual grounding. The backend prompt explicitly keeps retrieved documents as the factual source. This distinction is important because previous chat messages may contain user assumptions or assistant wording that should not override retrieved project documentation.

## 8. Vertex AI Integration

The backend uses two Vertex AI model capabilities.

### Gemini 2.5 Flash

`gemini-2.5-flash` generates final assistant answers. The prompt includes:

- The user question.
- Recent conversation context.
- Retrieved document context.
- Source IDs.
- Instructions to cite factual claims with source labels.

### text-embedding-005

`text-embedding-005` generates embeddings for document chunks and user questions. The backend uses these embeddings to calculate semantic similarity.

The embedding path is isolated in `gemini_service.py`, which keeps provider-specific logic out of route handlers and RAG orchestration code.

## 9. Challenges and Solutions

### IAM and Vertex AI Permissions

The backend depends on Cloud Run service account access to Vertex AI, Firestore, and Cloud Storage. The main challenge was making sure the deployed runtime had the right permissions rather than only testing locally.

The solution was to treat Cloud Run as the real operating environment and verify service behavior after deployment.

### Backend Refactor Without Breaking Cloud Run

The MVP backend initially concentrated too much logic in `main.py`. Refactoring everything at once would have been risky.

The solution was incremental extraction. I moved settings, schemas, Gemini calls, GCS access, Firestore access, vector scoring, RAG orchestration, ingestion, and routes one layer at a time while preserving `main:app`.

### Firestore Persistence

After deploying persistent chat history, the expected `conversations` collection did not appear. The issue was that Cloud Run was still serving an older revision.

The solution was to redeploy the backend and verify that `/ask-rag` returned a `session_id` and that Firestore created `conversations/debug-session-001/messages`.

### Streaming Implementation

The backend needed to stream responses while preserving the same retrieval logic as `/ask-rag`.

The solution was to share RAG context construction between streaming and non-streaming paths. Streaming then became a response-format difference rather than a separate RAG pipeline.

### Retrieval Quality

Basic vector search can return weak context, especially with small document sets and overlapping project terminology.

The solution was to improve retrieval in layers: larger candidate pools, score thresholds, optional keyword scoring, optional reranking, source IDs, and stronger citation prompting. The system still needs managed vector retrieval and evaluation, but it is stronger than the initial naive approach.

### CORS and Production Deployment

The live frontend failed with `TypeError: Failed to fetch` even though the production JavaScript bundle contained the correct Cloud Run URL and endpoints.

The direct preflight request showed:

```text
HTTP/2 400
Disallowed CORS origin
```

The backend allowed localhost origins but not the production CloudFront origin. The fix added the CloudFront origin to CORS defaults and deployment environment variables. A deployment workflow issue also appeared because comma-separated env vars were parsed incorrectly by `gcloud`; this was fixed with custom delimiter syntax.

## 10. Security Improvements

The most important security improvement was protecting document ingestion. Public users should be able to ask questions, but they should not be able to trigger document ingestion or overwrite retrieval data.

Current ingestion protection:

```text
POST /ingest-docs
  requires X-Admin-Token
  compares against INGESTION_ADMIN_TOKEN
  returns controlled admin_auth_error on failure
```

Other security and operational improvements include:

- Environment-backed configuration in `settings.py`.
- Non-secret runtime config summaries.
- Avoiding logs of prompts, document bodies, embeddings, or generated answer content.
- Service account based access from Cloud Run to GCP resources.
- Public chat routes separated from admin ingestion behavior.
- CORS allowlist for local development and production CloudFront.

## 11. Advanced RAG Roadmap

The next backend roadmap moves from the current Intermediate RAG implementation toward production-grade Advanced RAG.

### Phase 1: Retrieval Quality Quick Wins

This phase should add query rewriting, chunk overlap, token-aware chunking, and citation validation. It does not require new infrastructure and should improve answer relevance quickly.

### Phase 2: Better Retrieval Logic

This phase should add multi-query retrieval, metadata filtering, and no-answer confidence handling. The goal is to make retrieval more accurate and safer when the available context is weak.

### Phase 3: Evaluation and Observability

This phase should add RAG evaluation in CI/CD, project analytics, response/error tracking, source usage tracking, and monitoring dashboards. This would prove answer quality and detect regressions.

### Phase 4: Managed Vector Retrieval

This phase should replace Firestore full-scan retrieval with a managed vector index such as Firestore Vector Search or Vertex AI Vector Search. This is the largest architecture upgrade and would make retrieval more production-style.

### Phase 5: Advanced RAG Patterns

This phase can explore GraphRAG, Agentic RAG, specialist retrievers, and multi-source orchestration. This should come after the core retrieval, evaluation, and observability foundation is stable.

Recommended implementation order:

1. Query rewriting.
2. Chunk overlap and token-aware chunking.
3. Citation validation.
4. Multi-query retrieval.
5. No-answer confidence handling.
6. RAG evaluation in CI/CD.
7. Project analytics and monitoring dashboard.
8. Firestore Vector Search or Vertex AI Vector Search.
9. GraphRAG or Agentic RAG only after the core system is stable.

## 12. Lessons Learned

The first lesson was that a working deployed system is more valuable than an ideal architecture that cannot be completed in time. Pivoting from AWS Bedrock RAG to GCP Cloud Run RAG allowed me to finish the end-to-end assistant while still preserving AWS value through the visitor counter.

The second lesson was that backend refactoring should preserve deployment contracts. Keeping `main:app` stable while extracting services avoided unnecessary Cloud Run risk.

The third lesson was that RAG quality improves through layers. Chunking, metadata, scoring thresholds, hybrid retrieval, reranking, citations, memory, and streaming each solved a specific limitation.

The fourth lesson was that Firestore can support a practical MVP, but full-scan retrieval is not the final architecture. A managed vector index is the right future step once the rest of the pipeline is stable.

The fifth lesson was that production failures often live at integration boundaries. The CloudFront assistant failure was not caused by missing frontend code or a missing backend route. It was caused by CORS configuration between the production origin and Cloud Run.

The sixth lesson was that admin paths need different security assumptions than public chat paths. Protecting `/ingest-docs` made the backend safer without adding friction to the portfolio assistant.

## 13. Conclusion

The backend evolved from an initial AWS RAG plan into a working GCP Cloud Run RAG service. It now supports document ingestion, embeddings, Firestore retrieval, Gemini answer generation, persistent chat memory, streaming responses, source IDs, production CORS, health checks, structured logging, and protected ingestion.

This backend is strong as a capstone artifact because it shows both architecture decision-making and implementation detail. It demonstrates that I can pivot when a cloud service path becomes impractical, still ship a working system, refactor an MVP into maintainable service boundaries, debug production deployment issues, and explain the path from naive RAG toward advanced RAG.

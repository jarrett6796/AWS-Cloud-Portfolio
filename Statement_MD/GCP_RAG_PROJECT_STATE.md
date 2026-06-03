# GCP RAG Project State

This file is the current source of truth for the GCP RAG backend.

The GCP backend exists because the original AWS Lambda/Bedrock RAG path was deferred. The current working AI/RAG implementation is built on GCP Cloud Run, Gemini, Firestore, and Google Cloud Storage.

## Current GCP Architecture

```text
React Frontend
  -> src/api/chat.js
  -> POST /ask-rag
  -> Cloud Run FastAPI backend
  -> Gemini embedding model
  -> Firestore document_chunks retrieval
  -> Gemini 2.5 Flash response generation
  -> React assistant response UI
```

## Backend Stack

- Python 3.11
- FastAPI
- Uvicorn
- Cloud Run
- google-genai
- google-cloud-storage
- google-cloud-firestore

## AI Models

Generation:

```text
gemini-2.5-flash
```

Embeddings:

```text
text-embedding-005
```

## Cloud Resources

### Cloud Run

Hosts the FastAPI backend.

### Google Cloud Storage

Document bucket:

```text
cloud-resume-ai-rag-docs
```

Stores source markdown documents used for ingestion and retrieval context.

### Firestore

Collection:

```text
document_chunks
```

Fields:

- `file_name`
- `chunk_index`
- `chunk_text`
- `embedding`

## Current Endpoints

### `GET /`

Health check.

### `POST /chat`

Basic Gemini chat without document retrieval.

### `POST /chat-with-docs`

Loads selected GCS markdown documents directly and sends them as context.

### `POST /ingest-docs`

Reads markdown files from GCS, chunks text, generates embeddings, and stores chunks in Firestore.

### `POST /ask-rag`

Embeds the user question, retrieves top matching Firestore chunks using cosine similarity, sends retrieved context to Gemini, and returns answer plus sources.

## Current Backend File Structure

```text
backend-GCP/
├── app/
│   ├── config/
│   │   └── settings.py
│   ├── schemas/
│   │   └── chat_schema.py
│   └── services/
│       └── gemini_service.py
├── Dockerfile
├── main.py
└── requirements.txt
```

`main.py` currently contains:

- GCS client setup
- Firestore client setup
- FastAPI app setup
- CORS config
- health route
- chat routes
- GCS helper
- chunking helper
- cosine similarity helper
- ingestion logic
- RAG retrieval and prompt assembly

Environment config has been extracted to `app/config/settings.py`.
The chat request schema has been extracted to `app/schemas/chat_schema.py`.
Gemini generation and embedding calls have been extracted to `app/services/gemini_service.py`.
The remaining GCS setup, Firestore setup, helpers, endpoint logic, and RAG orchestration still need to be modularized.

## Current Backend Limitations

- `main.py` has too many responsibilities.
- Chunking is fixed-size and simplistic.
- Retrieval is full Firestore scan plus cosine similarity.
- No reranking.
- No streaming response support.
- No chat history.
- No structured logging abstraction.
- No dedicated service layer.
- No route modules.

## Recommended Backend Refactor Order

Completed:

1. `app/config/settings.py`
2. `app/schemas/chat_schema.py`
3. `app/services/gemini_service.py`

Next:

1. `app/services/gcs_service.py`
2. `app/services/firestore_service.py`
3. `app/services/vector_service.py`
4. `app/services/rag_service.py`
5. `app/routes/health.py`
6. `app/routes/chat.py`
7. `app/routes/rag.py`

Target pattern:

```text
request -> route -> service -> provider/client
```

Do not rewrite all backend code at once. Extract one layer at a time and verify after each step.

## Backend Verification

Compile check:

```bash
cd backend-GCP
python -m py_compile main.py
```

Cloud Run deploy command used during MVP:

```bash
gcloud run deploy gcp-rag-backend \
  --source . \
  --region asia-east1 \
  --allow-unauthenticated \
  --clear-base-image \
  --set-env-vars GOOGLE_CLOUD_PROJECT=cloud-resume-ai-rag,GOOGLE_CLOUD_LOCATION=us-central1,DOCS_BUCKET=cloud-resume-ai-rag-docs
```

Smoke test:

```bash
curl -X POST https://gcp-rag-backend-189047029621.asia-east1.run.app/ask-rag \
  -H "Content-Type: application/json" \
  -d '{"question":"What is the current project architecture?"}'
```

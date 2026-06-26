# Deep RAG Backend Anatomy Report

Date inspected: 2026-06-25

Scope: `backend-GCP/main.py`, `backend-GCP/app/config/`, `backend-GCP/app/routes/`, `backend-GCP/app/schemas/`, `backend-GCP/app/services/`, `backend-GCP/scripts/evaluate_rag.py`, `backend-GCP/tests/`, `backend-GCP/docs/`, and `backend-GCP/evals/`.

This report is inspection-only. It does not refactor, modify logic, deploy, or commit anything.

## 1. Executive Summary

This backend is a FastAPI service for a portfolio RAG system running on Google Cloud. A user asks a question from the frontend, and the backend answers using indexed project documentation instead of relying only on Gemini's general knowledge.

In simple terms, the backend does five major jobs:

1. Accept chat and RAG requests from the frontend.
2. Retrieve relevant documentation chunks from Firestore.
3. Ask Gemini to generate an answer using only those chunks.
4. Validate citations so answers point back to retrieved sources.
5. Save conversation history and analytics for debugging and evaluation.

The main RAG implementation lives in `app/services/rag_service.py`. That file coordinates query rewriting, multi-query retrieval, vector scoring, optional Firestore vector search, semantic reranking, parent-child context expansion, prompt construction, Gemini generation, citation validation, analytics, and Firestore message saving.

The backend already has strong testing around many RAG behaviors. The main complexity risk is that many separate responsibilities are concentrated inside `rag_service.py`. That makes the system understandable as one pipeline, but harder to safely refactor without regression tests.

## 2. Backend Folder Map

```text
backend-GCP/
├── Dockerfile
├── main.py
├── requirements.txt
├── app/
│   ├── __init__.py
│   ├── errors.py
│   ├── logging_config.py
│   ├── security.py
│   ├── config/
│   │   ├── __init__.py
│   │   └── settings.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── chat.py
│   │   ├── health.py
│   │   └── rag.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── chat_schema.py
│   └── services/
│       ├── __init__.py
│       ├── firestore_service.py
│       ├── gcs_service.py
│       ├── gemini_service.py
│       ├── ingestion_service.py
│       ├── rag_service.py
│       ├── rate_limit_service.py
│       └── vector_service.py
├── docs/
│   └── firestore_vector_search.md
├── evals/
│   ├── golden_questions.json
│   ├── rag_eval_firestore_vector_20260625.json
│   ├── rag_eval_firestore_vector_20260625.md
│   ├── rag_eval_live.json
│   ├── rag_eval_live.md
│   ├── rag_eval_post_audit.json
│   ├── rag_eval_post_audit.md
│   └── rag_km_audit_20260625.md
├── scripts/
│   └── evaluate_rag.py
└── tests/
    ├── conftest.py
    ├── test_chat_schema.py
    ├── test_firestore_service.py
    ├── test_ingestion_auth.py
    ├── test_rag_eval.py
    ├── test_rag_service.py
    ├── test_rate_limit_service.py
    ├── test_settings.py
    └── test_vector_service.py
```

| Folder/File | Role |
|---|---|
| `main.py` | FastAPI app setup, CORS, request IDs, logging middleware, router registration. |
| `app/config/` | Runtime settings and environment variable parsing. |
| `app/routes/` | HTTP endpoint definitions for health, direct chat, RAG, streaming RAG, ingestion, and analytics. |
| `app/schemas/` | Pydantic request and response models shared by routes and services. |
| `app/services/` | Business logic and external service wrappers. This is where RAG, Firestore, Gemini, GCS, ingestion, vectors, and rate limiting live. |
| `docs/` | Engineering documentation for backend features, currently Firestore vector search. |
| `evals/` | Golden question set and historical evaluation reports. |
| `scripts/` | CLI tooling for running RAG evaluation against a deployed/local backend. |
| `tests/` | Unit tests and route/service behavior tests. |

## 3. Full RAG Request Flow

High-level sync and streaming RAG share the same retrieval preparation pipeline.

```text
User question
  -> FastAPI route
  -> rate limit check
  -> Pydantic request schema
  -> session ID selection/creation
  -> Firestore conversation history load
  -> optional query rewrite
  -> optional multi-query expansion
  -> Gemini embeddings
  -> Firestore vector search or local Firestore scan
  -> keyword/vector scoring
  -> optional reranking
  -> optional semantic reranking
  -> optional parent-child context expansion
  -> prompt construction
  -> Gemini response
  -> citation validation
  -> analytics record
  -> Firestore message save
  -> frontend response
```

### Step-by-step

| Step | Where | What happens |
|---|---|---|
| User question | Frontend calls `/ask-rag` or `/ask-rag-stream` | Request body is parsed as `ChatRequest`. |
| FastAPI route | `app/routes/rag.py` | Route delegates to `RagService`. |
| Rate limiting | `_enforce_rag_rate_limit()` | Uses client IP first, then session ID, then `anonymous`. |
| Request schema | `ChatRequest` | Validates `message`, optional `session_id`, optional history, optional metadata filter. |
| Session ID | `FirestoreService.create_session_id()` | Existing session is reused, otherwise a UUID is created. |
| Firestore history | `load_recent_messages()` | Loads recent messages from `conversations/{session_id}/messages`. |
| Query rewrite | `_rewrite_query_if_needed()` | Optionally rewrites follow-up questions into better retrieval queries. |
| Multi-query retrieval | `_build_retrieval_queries()` | Optionally asks Gemini for alternate retrieval queries. |
| Embedding | `GeminiService.embed_text()` | Embeds each retrieval query with `text-embedding-005`. |
| Retrieval | `_retrieve_scored_chunks()` | Uses Firestore vector search if enabled, otherwise scans Firestore chunks locally. |
| Scoring | `_score_chunk()` and `VectorService` | Computes vector similarity, keyword score, and optional hybrid score. |
| Reranking | `select_relevant_chunks()` | Applies threshold, candidate pool, top-k, and optional keyword rerank. |
| Semantic reranking | `_semantic_rerank_chunks()` | Optional Gemini-based reranker chooses the strongest chunks. |
| Parent-child context | `_expand_parent_context()` | Optional replacement of small child chunk with larger parent section context. |
| Prompt construction | `_build_context()`, `_build_history_context()`, `_build_prompt()` | Builds the grounded Gemini prompt with source IDs like `[S1]`. |
| Gemini response | `generate_text()` or `stream_text()` | Sync mode gets a full answer; stream mode collects provider tokens first. |
| Citation validation | `_validate_grounded_answer()` | Blocks answers with missing/invalid citations and returns canonical no-answer text. |
| Analytics | `_save_rag_analytics()` | Saves latency, source count, citation blocked status, backend mode, feature flags. |
| Firestore save | `save_message()` | Saves user and assistant messages after generation. |
| Frontend response | `RagResponse` or SSE | Returns answer, sources, session ID, retrieval query, and rewrite flag. |

### Important design detail

The rewritten query is used for retrieval only. The final answer prompt stays anchored to the original user question. This is correct: rewriting can improve recall, but the assistant should still answer what the user actually asked.

## 4. Streaming Flow

Streaming endpoint: `POST /ask-rag-stream`

Route function: `ask_rag_stream()` in `app/routes/rag.py`

Service function: `RagService.stream_answer()`

### Streaming sequence

```text
Client opens stream
  -> route checks rate limit
  -> service prepares RAG context
  -> service sends metadata event
  -> Gemini streaming starts
  -> backend collects Gemini tokens internally
  -> full answer is citation-validated
  -> backend emits validated answer chunks as token events
  -> backend saves user/assistant messages
  -> backend saves analytics
  -> backend sends done event
```

### Why tokens are buffered before frontend delivery

The service does not immediately forward raw Gemini chunks to the client. It collects the generated answer first, validates citations, and only then sends validated answer text as `token` events.

This matters because citation validation can replace an unsafe answer with:

```text
I do not know based on the indexed project documents.
```

If raw Gemini chunks were streamed directly, the frontend could display unsupported claims before validation happens.

### SSE events

| Event | Produced by | Payload purpose |
|---|---|---|
| `metadata` | `stream_answer()` before generation | Sends question, session ID, sources, retrieval query, and rewrite flag. |
| `token` | `stream_answer()` after citation validation | Sends pieces of the final validated answer. |
| `done` | `stream_answer()` after saves/analytics | Signals successful stream completion. |
| `error` | Exception handler inside `stream_answer()` | Sends public-safe error type/message if stream fails. |

### `metadata` event

Includes:

- `question`
- `session_id`
- `sources`
- `retrieval_query`
- `query_rewritten`

This lets the frontend know which sources were selected before answer text arrives.

### `token` event

Contains answer chunks produced by `_chunk_answer_for_sse()`. These chunks are not raw provider chunks; they are validated answer chunks.

### `done` event

Emitted only after:

- user message save is attempted
- query rewrite audit save is attempted if relevant
- assistant message save is attempted
- analytics save is attempted

### `error` event

If an exception occurs, `stream_answer()` logs it and emits a safe event with:

- `error`
- `message`

Backend-specific exceptions expose controlled public messages through `BackendServiceError`.

## 5. Sync Flow

Sync endpoint: `POST /ask-rag`

Route function: `ask_rag()` in `app/routes/rag.py`

Service function: `RagService.answer_question()`

### Sync sequence

```text
Client sends JSON request
  -> route checks rate limit
  -> service prepares RAG context
  -> Gemini generates full answer
  -> service validates citations
  -> service saves user message
  -> service saves query rewrite audit if used
  -> service saves assistant message
  -> service saves analytics
  -> service returns RagResponse JSON
```

### Sync response fields

`RagResponse` includes:

- `question`
- `answer`
- `session_id`
- `sources`
- `retrieval_query`
- `query_rewritten`

### Sync vs streaming

| Area | `/ask-rag` | `/ask-rag-stream` |
|---|---|---|
| Transport | JSON response | Server-Sent Events |
| Route return type | `RagResponse` | `StreamingResponse` |
| Gemini call | `generate_text()` | `stream_text()` |
| Citation validation | After full answer | After provider stream completes |
| Frontend answer delivery | One response | `metadata`, then `token`, then `done` |
| Message saving | Before return | Before `done` event |
| Analytics mode | `sync` | `stream` |
| Failure shape | HTTP error response | SSE `error` event when inside stream |

The two paths share the same retrieval setup through `_prepare_rag_context()`.

## 6. Ingestion Flow

Ingestion endpoint: `POST /ingest-docs`

Route function: `ingest_docs()` in `app/routes/rag.py`

Service function: `IngestionService.ingest_documents()`

### Ingestion sequence

```text
Markdown docs
  -> uploaded/stored in GCS bucket
  -> POST /ingest-docs
  -> admin token validation
  -> GCS text download
  -> parent-child chunking
  -> metadata generation
  -> Gemini embeddings
  -> Firestore chunk writes
  -> stale chunk pruning
  -> ingestion summary response
```

### Detailed steps

| Step | Where | What happens |
|---|---|---|
| Markdown docs | GCS bucket from `DOCS_BUCKET` | Documents are expected to exist as text files in Cloud Storage. |
| `/ingest-docs` | `app/routes/rag.py` | Admin-only route starts ingestion. |
| Admin token | `require_ingestion_admin_token()` | Requires `X-Admin-Token` or compatible header dependency. |
| File list | `settings.ingest_documents` | Defaults come from `INGEST_DOCUMENTS`. |
| GCS read | `GcsService.read_text_file()` | Downloads each Markdown file as text. |
| Chunking | `VectorService.build_parent_child_chunks()` | Splits document into parent sections and child chunks. |
| Metadata | `build_chunk_metadata()` and parent-child helpers | Adds file, heading, section, hash, source URI, parent/child IDs. |
| Embedding | `GeminiService.embed_text()` | Creates vector embedding for each child chunk. |
| Firestore write | `FirestoreService.add_document_chunk()` | Stores chunk text, embedding, and metadata. |
| Stale pruning | `FirestoreService.prune_document_chunks()` | Deletes old chunks for the same file not created in current run. |
| Response | `IngestResponse` | Returns status, chunks created, files ingested, and chunks pruned. |

### Stale chunk pruning

Chunk document IDs are stable hashes of:

```text
file_name + ":" + chunk_index
```

During ingestion, the service tracks expected document IDs for the current file. After writing current chunks, it deletes existing Firestore chunks for that file whose document IDs are not in the expected set.

This prevents old chunks from staying searchable after a source document shrinks or changes structure.

## 7. File-by-File Inspection

### `backend-GCP/main.py`

| Field | Explanation |
|---|---|
| Purpose | Creates and configures the FastAPI application. |
| Main responsibilities | Logging setup, CORS, request ID middleware, router registration, global backend error handler. |
| Important functions/classes | `FastAPI(...)`, `request_context_middleware()`, `backend_service_error_handler()`. |
| Who calls it | ASGI server such as Uvicorn/Gunicorn/Cloud Run container startup. |
| What it calls | `configure_logging()`, `settings.public_summary()`, `settings.startup_warnings()`, routers. |
| External services | None directly. |
| Risk level | Medium. Middleware affects every endpoint. |
| Should it stay/split/refactor later | Stay. It is appropriately small. |
| Plain-English explanation | This file is the front door of the app. It sets up the web server behavior before any route-specific logic runs. |

### `backend-GCP/app/config/settings.py`

| Field | Explanation |
|---|---|
| Purpose | Centralizes environment variable parsing and runtime configuration. |
| Main responsibilities | Defaults, feature flags, model names, Firestore collection names, RAG tuning, startup warnings. |
| Important functions/classes | `_split_csv()`, `_env_bool()`, `Settings`, `public_summary()`, `startup_warnings()`. |
| Who calls it | Almost every service and route imports `settings`. |
| What it calls | `os.getenv()`, simple validation helpers. |
| External services | None directly. |
| Risk level | High. Misconfiguration can change retrieval, auth, CORS, models, ingestion, and rate limits. |
| Should it stay/split/refactor later | Stay for now. Later, group settings into nested config objects if the number of flags keeps growing. |
| Plain-English explanation | This file is the control panel for the backend. Most behavior switches are here. |

### `backend-GCP/app/routes/rag.py`

| Field | Explanation |
|---|---|
| Purpose | Defines RAG-related HTTP endpoints. |
| Main responsibilities | Ingestion, analytics summary, sync RAG answer, streaming RAG answer, route-level rate limiting. |
| Important functions/classes | `ingest_docs()`, `rag_analytics_summary()`, `ask_rag()`, `ask_rag_stream()`, `_enforce_rag_rate_limit()`. |
| Who calls it | Frontend, admin scripts, evaluation script, health tooling. |
| What it calls | `rag_service`, `ingestion_service`, `rate_limit_service`, admin token dependency. |
| External services | Indirectly Firestore, GCS, Gemini. |
| Risk level | High. Route changes affect API contracts. |
| Should it stay/split/refactor later | Stay. It is thin enough; service code carries the complexity. |
| Plain-English explanation | This file maps HTTP requests to backend actions. It should remain a small adapter. |

### `backend-GCP/app/routes/chat.py`

| Field | Explanation |
|---|---|
| Purpose | Provides non-RAG chat and direct-doc chat endpoints. |
| Main responsibilities | `/chat` direct Gemini call and `/chat-with-docs` prompt with full selected docs. |
| Important functions/classes | `chat()`, `chat_with_docs()`. |
| Who calls it | Frontend or manual tests if using non-RAG chat paths. |
| What it calls | `gemini_service`, `gcs_service`, `settings.direct_context_documents`. |
| External services | Gemini, GCS. |
| Risk level | Medium. It is separate from primary RAG but can confuse architecture if treated as the main path. |
| Should it stay/split/refactor later | Could remain as debug/legacy route or be clearly labeled later. |
| Plain-English explanation | This is a simpler chat path. It does not use chunk retrieval like the RAG endpoint. |

### `backend-GCP/app/routes/health.py`

| Field | Explanation |
|---|---|
| Purpose | Health and service metadata endpoints. |
| Main responsibilities | Root status and lightweight health check. |
| Important functions/classes | `root()`, `healthz()`. |
| Who calls it | Browser, uptime checks, Cloud Run health checks, manual diagnostics. |
| What it calls | `settings.public_summary()`, `settings.startup_warnings()`. |
| External services | None. |
| Risk level | Low. |
| Should it stay/split/refactor later | Stay. |
| Plain-English explanation | This confirms the service is alive and shows sanitized configuration. |

### `backend-GCP/app/schemas/chat_schema.py`

| Field | Explanation |
|---|---|
| Purpose | Defines Pydantic API contracts. |
| Main responsibilities | Request validation and response shapes for chat, RAG, sources, and ingestion. |
| Important functions/classes | `ChatMessage`, `MetadataFilter`, `ChatRequest`, `SourceMetadata`, `ChatResponse`, `ChatWithDocsResponse`, `RagResponse`, `IngestResponse`. |
| Who calls it | Routes and tests. |
| What it calls | Pydantic model validation. |
| External services | None. |
| Risk level | High. Schema changes can break frontend and evaluation tooling. |
| Should it stay/split/refactor later | Stay until schema count grows. |
| Plain-English explanation | This file defines the shape of data crossing the API boundary. |

### `backend-GCP/app/services/rag_service.py`

| Field | Explanation |
|---|---|
| Purpose | Coordinates the full RAG answer pipeline. |
| Main responsibilities | Retrieval preparation, query rewrite, multi-query, scoring, reranking, parent context expansion, prompts, Gemini calls, citation validation, saves, analytics. |
| Important functions/classes | `RagService`, `QueryRewriteResult`, `answer_question()`, `stream_answer()`, `_prepare_rag_context()`, `_retrieve_scored_chunks()`, `_build_prompt()`, `_validate_grounded_answer()`. |
| Who calls it | `app/routes/rag.py`, tests. |
| What it calls | Firestore, Gemini, vector service, settings. |
| External services | Firestore, Vertex AI Gemini. |
| Risk level | Very high. It is the core RAG orchestrator. |
| Should it stay/split/refactor later | Split later in small phases only after tests are locked. |
| Plain-English explanation | This is the brain of the RAG system. It decides what context Gemini sees and whether the answer is allowed. |

### `backend-GCP/app/services/vector_service.py`

| Field | Explanation |
|---|---|
| Purpose | Handles chunking and scoring math. |
| Main responsibilities | Markdown chunking, parent-child chunk creation, metadata extraction, cosine similarity, keyword scoring, hybrid scoring, top-k selection. |
| Important functions/classes | `VectorService`, `build_parent_child_chunks()`, `chunk_text()`, `cosine_similarity()`, `keyword_score()`, `select_relevant_chunks()`. |
| Who calls it | Ingestion service and RAG service. |
| What it calls | Standard Python text/math helpers. |
| External services | None. |
| Risk level | High. Chunking and scoring directly affect answer quality. |
| Should it stay/split/refactor later | Could split chunking and scoring later. |
| Plain-English explanation | This file turns documents into searchable pieces and decides which pieces look relevant. |

### `backend-GCP/app/services/firestore_service.py`

| Field | Explanation |
|---|---|
| Purpose | Encapsulates Firestore reads and writes. |
| Main responsibilities | Chunk storage, vector search, local scan streaming, conversation history, query rewrite audit, analytics. |
| Important functions/classes | `FirestoreService`, `add_document_chunk()`, `search_document_chunks_by_vector()`, `stream_document_chunks()`, `save_message()`, `load_recent_messages()`, `save_rag_analytics()`. |
| Who calls it | RAG service, ingestion service, tests. |
| What it calls | `google.cloud.firestore`. |
| External services | Firestore. |
| Risk level | High. Data shape and queries affect production behavior. |
| Should it stay/split/refactor later | Split later into chunk repository, conversation repository, analytics repository. |
| Plain-English explanation | This file is the database gateway. It knows how the RAG backend stores and retrieves data. |

### `backend-GCP/app/services/ingestion_service.py`

| Field | Explanation |
|---|---|
| Purpose | Builds the searchable knowledge base from Markdown documents. |
| Main responsibilities | Read docs from GCS, chunk them, embed chunks, write chunks to Firestore, prune stale chunks. |
| Important functions/classes | `IngestionService`, `ingest_documents()`, `_ingest_documents()`. |
| Who calls it | `/ingest-docs` route and tests. |
| What it calls | GCS service, vector service, Gemini service, Firestore service. |
| External services | GCS, Vertex AI Gemini embeddings, Firestore. |
| Risk level | High. Bad ingestion means bad retrieval. |
| Should it stay/split/refactor later | Stay for now; could later extract ingestion job progress/reporting. |
| Plain-English explanation | This file updates what the RAG system knows. |

### `backend-GCP/app/services/gemini_service.py`

| Field | Explanation |
|---|---|
| Purpose | Wraps Gemini text generation, streaming generation, and embeddings. |
| Main responsibilities | Provider calls, generation config, logging, provider error wrapping. |
| Important functions/classes | `GeminiService`, `generate_text()`, `stream_text()`, `embed_text()`. |
| Who calls it | RAG service, chat route, ingestion service. |
| What it calls | `google.genai.Client`. |
| External services | Vertex AI Gemini. |
| Risk level | Medium-high. Provider API shape and model configuration matter. |
| Should it stay/split/refactor later | Stay. It is a useful boundary around the provider. |
| Plain-English explanation | This is the only place that should know the details of calling Gemini. |

### `backend-GCP/app/services/gcs_service.py`

| Field | Explanation |
|---|---|
| Purpose | Reads source documents from Google Cloud Storage. |
| Main responsibilities | Download text files from configured bucket. |
| Important functions/classes | `GcsService`, `read_text_file()`. |
| Who calls it | Ingestion service and direct-doc chat route. |
| What it calls | `google.cloud.storage.Client`. |
| External services | GCS. |
| Risk level | Medium. Broken reads break ingestion. |
| Should it stay/split/refactor later | Stay. |
| Plain-English explanation | This file fetches Markdown source files from the cloud bucket. |

### `backend-GCP/app/services/rate_limit_service.py`

| Field | Explanation |
|---|---|
| Purpose | In-memory request rate limiting for RAG endpoints. |
| Main responsibilities | Track timestamps per key and decide allow/block. |
| Important functions/classes | `RateLimitService`, `is_allowed()`, `reset()`. |
| Who calls it | `app/routes/rag.py`, tests. |
| What it calls | `time.monotonic()`, `collections.deque`. |
| External services | None. |
| Risk level | Medium. It protects the backend, but in-memory state is per process. |
| Should it stay/split/refactor later | Replace with shared rate limiter if traffic grows or multiple instances matter. |
| Plain-English explanation | This keeps one client from sending too many RAG requests too quickly. |

### `backend-GCP/app/security.py`

| Field | Explanation |
|---|---|
| Purpose | Admin-token protection for sensitive endpoints. |
| Main responsibilities | Validate configured admin token with constant-time compare. |
| Important functions/classes | `require_admin_token()`, `require_ingestion_admin_token()`. |
| Who calls it | RAG ingestion and analytics routes. |
| What it calls | `hmac.compare_digest()`, `settings.ingestion_admin_token`. |
| External services | None. |
| Risk level | High. Mistakes can expose ingestion or analytics endpoints. |
| Should it stay/split/refactor later | Stay. |
| Plain-English explanation | This is the guard for admin-only backend operations. |

### `backend-GCP/app/errors.py`

| Field | Explanation |
|---|---|
| Purpose | Defines backend exception types and API error response formatting. |
| Main responsibilities | Safe public messages, HTTP status codes, structured error logging. |
| Important functions/classes | `BackendServiceError`, `ProviderServiceError`, `StorageServiceError`, `RagServiceError`, `AdminAuthError`, `backend_service_error_handler()`. |
| Who calls it | Services, routes, FastAPI exception handler. |
| What it calls | FastAPI request/response utilities and logging. |
| External services | None. |
| Risk level | Medium. Error handling affects client behavior and debugging. |
| Should it stay/split/refactor later | Stay. |
| Plain-English explanation | This file keeps internal errors from leaking while still returning useful API errors. |

### `backend-GCP/app/logging_config.py`

| Field | Explanation |
|---|---|
| Purpose | JSON logging setup. |
| Main responsibilities | Configure stdout logs with timestamp, level, logger, message, and extras. |
| Important functions/classes | `JsonFormatter`, `configure_logging()`. |
| Who calls it | `main.py`. |
| What it calls | Python logging. |
| External services | None. |
| Risk level | Low-medium. Logging is important for Cloud Run diagnosis. |
| Should it stay/split/refactor later | Stay. |
| Plain-English explanation | This makes backend logs structured enough for cloud logging tools. |

### `backend-GCP/scripts/evaluate_rag.py`

| Field | Explanation |
|---|---|
| Purpose | Runs golden-question evaluation against the RAG API. |
| Main responsibilities | Load test cases, call `/ask-rag`, score answers, summarize pass rates, write reports. |
| Important functions/classes | `evaluate_case()`, `evaluate_response()`, `summarize_results()`, `build_report()`, `build_markdown_report()`, `main()`. |
| Who calls it | Developer/operator from CLI or CI-style evaluation. |
| What it calls | Standard library HTTP via `urllib.request`, JSON, argparse. |
| External services | The configured RAG backend URL. |
| Risk level | Medium. Evaluation quality shapes confidence in RAG changes. |
| Should it stay/split/refactor later | Stay. Could later split scorer logic if it grows. |
| Plain-English explanation | This is the report card generator for the RAG backend. |

### `backend-GCP/docs/firestore_vector_search.md`

| Field | Explanation |
|---|---|
| Purpose | Documents Firestore vector search rollout and operational findings. |
| Main responsibilities | Explain vector backend flags, behavior, rollout status, known evaluation result. |
| Important functions/classes | Not code. |
| Who calls it | Human readers. |
| What it calls | Not applicable. |
| External services | Firestore vector search conceptually. |
| Risk level | Low. Documentation can become stale. |
| Should it stay/split/refactor later | Keep updated with actual eval results. |
| Plain-English explanation | This explains why Firestore vector search exists and how it compares with local scan. |

### `backend-GCP/evals/golden_questions.json`

| Field | Explanation |
|---|---|
| Purpose | Defines expected RAG behavior across 50 evaluation questions. |
| Main responsibilities | Question text, expected sources, expected doc types, required terms, forbidden terms, no-answer cases. |
| Important functions/classes | JSON cases, not functions. |
| Who calls it | `scripts/evaluate_rag.py`. |
| What it calls | Not applicable. |
| External services | None directly. |
| Risk level | Medium. Bad golden questions can mislead evaluation. |
| Should it stay/split/refactor later | Keep; update when docs or expected behavior changes. |
| Plain-English explanation | This is the answer key used to judge the RAG backend. |

### `backend-GCP/evals/*.md` and `backend-GCP/evals/*.json`

| Field | Explanation |
|---|---|
| Purpose | Store historical evaluation outputs. |
| Main responsibilities | Record pass rates, source/citation scores, latency, threshold status, failures. |
| Important functions/classes | Not code. |
| Who calls it | Human readers and future comparisons. |
| What it calls | Not applicable. |
| External services | None. |
| Risk level | Low-medium. Useful for regression tracking. |
| Should it stay/split/refactor later | Keep reports tied to date/backend mode. |
| Plain-English explanation | These files show how the RAG system performed at different points in time. |

### `backend-GCP/tests/`

| Field | Explanation |
|---|---|
| Purpose | Unit and behavior tests for backend components. |
| Main responsibilities | Protect settings, schemas, vector logic, Firestore adapter behavior, RAG orchestration, route auth, eval scoring, and rate limiting. |
| Important functions/classes | Test functions across `test_rag_service.py`, `test_vector_service.py`, `test_firestore_service.py`, `test_settings.py`, etc. |
| Who calls it | Developer/CI through pytest. |
| What it calls | Backend modules with fake services. |
| External services | Mostly mocked/faked. |
| Risk level | Low to modify tests, high to ignore tests. |
| Should it stay/split/refactor later | Keep expanding before refactors. |
| Plain-English explanation | These tests are the safety net for RAG behavior. |

## 8. Function-by-Function Map for Critical Files

### `app/config/settings.py`

| Function/Class | Input | Output | What it does | Why it matters | Danger if changed |
|---|---|---|---|---|---|
| `_split_csv()` | String or `None` | Tuple of strings | Parses comma-separated env var values. | Used for CORS and document lists. | Empty or malformed parsing could remove allowed origins or docs. |
| `_env_bool()` | Env var name and default | Boolean | Parses boolean feature flags. | Controls most RAG feature switches. | Wrong parsing could silently enable/disable production features. |
| `Settings` | Environment variables | Settings object | Defines all backend config values. | Single source of runtime behavior. | Defaults or names can alter deployed backend behavior. |
| `public_summary()` | None | Dict | Returns sanitized config summary. | Used by root endpoint and startup logs. | Could leak secrets if careless. |
| `startup_warnings()` | None | List of warnings | Detects suspicious/missing config. | Helps catch deployment mistakes. | Missing warnings can hide broken deployments. |

### `app/routes/rag.py`

| Function | Input | Output | What it does | Why it matters | Danger if changed |
|---|---|---|---|---|---|
| `_rate_limit_key()` | `Request`, optional `ChatRequest` | String key | Chooses client IP, session ID, or `anonymous`. | Determines who gets rate-limited. | Wrong key may overblock users or fail to limit abuse. |
| `_enforce_rag_rate_limit()` | `Request`, optional `ChatRequest` | None or raises `HTTPException` | Checks in-memory limiter. | Protects expensive Gemini/RAG endpoints. | Could accidentally disable protection or block all traffic. |
| `ingest_docs()` | Admin token dependency | `IngestResponse` | Starts document ingestion. | Updates searchable knowledge base. | Missing auth or wrong service call could corrupt/search stale docs. |
| `rag_analytics_summary()` | Admin token, limit | Dict | Returns summarized RAG analytics. | Helps inspect live RAG behavior. | Could expose operational data without auth. |
| `ask_rag()` | Request and `ChatRequest` | `RagResponse` | Handles sync RAG. | Main JSON API for frontend/evals. | API contract changes can break frontend/evals. |
| `ask_rag_stream()` | Request and `ChatRequest` | `StreamingResponse` | Handles streaming RAG over SSE. | Main interactive streaming path. | Event format changes can break frontend streaming. |

### `app/services/rag_service.py`

| Function/Class | Input | Output | What it does | Why it matters | Danger if changed |
|---|---|---|---|---|---|
| `QueryRewriteResult` | Original and rewritten query fields | Dataclass | Tracks rewrite metadata. | Keeps original question separate from retrieval query. | Mixing these can make the answer address the wrong question. |
| `get_analytics_summary()` | Limit | Dict | Loads recent analytics and summarizes them. | Admin visibility into RAG quality/performance. | Bad aggregation can mislead debugging. |
| `answer_question()` | User message, session ID, history, metadata filter | `RagResponse` | Runs sync RAG end-to-end. | Main non-streaming RAG path. | Any change can affect answer quality, saves, or API response. |
| `stream_answer()` | User message, session ID, history, metadata filter | SSE iterator | Runs streaming RAG end-to-end. | Main streaming RAG path. | Easy to break frontend event handling or validation order. |
| `_prepare_rag_context()` | Message, session, history, metadata filter | Dict context | Builds all retrieval context before Gemini generation. | Central shared pipeline for sync and streaming. | Highest-risk function; small changes affect all RAG answers. |
| `_retrieval_top_k()` | None | Int | Chooses retrieval count based on semantic rerank settings. | Ensures reranker has enough candidates. | Too low harms recall; too high costs latency. |
| `_semantic_rerank_chunks()` | Question and chunks | Reranked chunks | Uses Gemini to reorder/select chunks. | Improves answer context when enabled. | Bad parsing/fallback can drop useful sources. |
| `_build_semantic_rerank_prompt()` | Question and chunks | Prompt string | Creates compact reranker prompt. | Controls reranker quality. | Prompt drift can change selected sources. |
| `_compact_chunk_preview()` | Chunk | Short text | Creates preview for reranking. | Keeps reranker prompt small. | Too short loses signal; too long increases cost. |
| `_parse_semantic_rerank_response()` | Model text | List of IDs | Extracts chunk IDs like `C1`. | Converts model output to deterministic order. | Parser bugs can ignore good reranker output. |
| `_apply_semantic_rerank_order()` | Chunks and chosen IDs | Ordered chunks | Reorders chunks and tags metadata. | Makes source order match reranker decision. | Can duplicate/drop chunks if changed poorly. |
| `_expand_parent_context()` | Selected chunks | Expanded chunks | Optionally adds parent section context. | Gives Gemini more complete context. | Can inflate prompt or hide the exact child evidence. |
| `_expand_chunk_parent_context()` | One chunk | One expanded chunk | Replaces chunk text with parent context when available. | Implements parent-child retrieval behavior. | Wrong expansion can cite unrelated parent text. |
| `_limit_tokens()` | Text and max tokens | Trimmed text | Caps parent context size. | Prevents oversized prompts. | Too aggressive loses context; too loose increases cost. |
| `_retrieve_scored_chunks()` | Query embeddings, queries, metadata filter | Chunks and count | Chooses Firestore vector or local retrieval. | Backend abstraction for retrieval mode. | Incorrect fallback can break production retrieval. |
| `_retrieve_scored_chunks_firestore_vector()` | Query embeddings, queries, filter | Scored chunks and count | Uses Firestore nearest-neighbor query then scores/filters. | Scalable vector search path. | Query/filter mismatch can miss relevant chunks. |
| `_retrieve_scored_chunks_local()` | Query embeddings, queries, filter | Scored chunks and count | Streams all chunks and scores in process. | Reliable fallback and baseline mode. | Does not scale well as chunks grow. |
| `_score_chunk()` | Chunk, query embedding, query text/index | Scored chunk dict | Computes vector, keyword, hybrid score and carries metadata. | Converts raw chunks into rankable candidates. | Scoring changes directly alter answers. |
| `_save_rag_analytics()` | Analytics fields | None | Saves analytics but does not fail user request on analytics error. | Observability without hurting UX. | If made fatal, analytics outage could break chat. |
| `_build_rag_analytics()` | Request/response metrics | Dict | Creates analytics document. | Standardizes what is recorded. | Could store sensitive data if expanded carelessly. |
| `_build_analytics_summary()` | Analytics rows | Dict | Computes counts, averages, rates, top sources. | Admin quality overview. | Wrong math can hide regressions. |
| `_summarize_source_usage()` | Analytics rows | List | Counts source file usage. | Shows which docs are used most. | Low risk. |
| `_summarize_retrieval_backends()` | Analytics rows | List | Counts backend modes. | Confirms local vs vector behavior. | Low risk. |
| `_safe_average()` | Values | Float | Computes average safely. | Avoids summary crashes. | Low risk. |
| `_safe_rate()` | Count and total | Float | Computes rate safely. | Used for analytics rates. | Low risk. |
| `_coerce_float()` | Any value | Float or `None` | Normalizes numeric analytics fields. | Handles Firestore data variation. | Low risk. |
| `_coerce_int()` | Any value | Int | Normalizes counts. | Handles Firestore data variation. | Low risk. |
| `_build_retrieval_queries()` | Original/retrieval query and history | List of queries | Creates multi-query list when enabled. | Improves recall for broad questions. | Too many/bad queries increase noise and cost. |
| `_build_multi_query_prompt()` | Question/history/count | Prompt | Asks Gemini for alternate retrieval queries. | Controls multi-query quality. | Prompt can cause overly broad or answer-like queries. |
| `_parse_multi_query_response()` | Model text | Query list | Parses numbered/bulleted model output. | Converts model output into usable queries. | Parser bugs reduce multi-query benefit. |
| `_dedupe_queries()` | Query list | Deduped list | Removes duplicates case-insensitively. | Keeps retrieval efficient. | Poor dedupe can drop useful variants. |
| `_normalize_metadata_filter()` | Pydantic model/dict/object | Dict | Keeps only supported filter fields. | Protects retrieval filter behavior. | Could ignore valid filters or allow unsupported ones. |
| `_metadata_matches()` | Metadata and filter | Boolean | Applies exact and text metadata matching. | Lets frontend/evals narrow retrieval. | Bad matching can remove all evidence. |
| `_rewrite_query_if_needed()` | Question and history | `QueryRewriteResult` | Rewrites follow-up question for retrieval only. | Improves conversational retrieval. | If final answer uses rewrite as user intent, answers can drift. |
| `_save_query_rewrite_audit_if_used()` | Session/request/rewrite | None | Saves system audit message for rewrite. | Makes rewrite behavior inspectable. | If saved as user-visible message, history could be polluted. |
| `_build_query_rewrite_prompt()` | Question/history | Prompt | Constructs rewrite instruction. | Controls rewrite quality and safety. | Bad prompt can over-transform questions. |
| `_clean_rewritten_query()` | Model text | Clean query | Strips formatting/quotes/noise. | Makes rewrite usable for retrieval. | Overcleaning can lose meaning. |
| `_filter_visible_history()` | Messages | User/assistant history | Removes system/internal audit messages. | Prevents audit messages from affecting conversation. | Including system audit can distort follow-up rewrite. |
| `_build_sources()` | Selected chunks | `SourceMetadata` list | Builds API-safe source objects. | Frontend citation/source display depends on it. | Removing fields can break frontend/tests. |
| `_build_context()` | Selected chunks | Context string | Formats `[S#]` source blocks for prompt. | Gemini relies on this for grounding. | Formatting changes can break citation behavior. |
| `_validate_grounded_answer()` | Answer and chunks | Validated answer | Requires citations or canonical no-answer. | Main hallucination guard. | Weakening it allows unsupported claims. |
| `_is_no_answer()` | Text | Boolean | Detects canonical no-answer exactly. | Lets no-answer pass citation validation. | Too broad could hide bad answers; too narrow could block valid no-answer. |
| `_normalize_answer_text()` | Text | Normalized text | Lowercases/collapses whitespace. | Supports exact no-answer comparison. | Low risk. |
| `_chunk_answer_for_sse()` | Answer text | Text chunks | Splits validated answer for token SSE events. | Controls frontend streaming cadence. | Bad chunking can produce empty or awkward events. |
| `_build_history_context()` | Messages/history | Prompt history text | Adds recent conversation context. | Helps follow-up questions. | Too much history can leak irrelevant context. |
| `_build_prompt()` | Question/context/history | Prompt | Constructs final grounded answer instruction. | One of the strongest quality controls. | Prompt changes can alter every answer. |
| `_add_source_ids()` | Chunks | Chunks with `S#` IDs | Assigns citation IDs. | Ties prompt sources to citation validation. | Reordering after this can invalidate citations. |
| `_format_sse()` | Event name and payload | SSE string | Serializes SSE event. | Frontend stream parser depends on this format. | Format changes can break streaming UI. |

### `app/services/vector_service.py`

| Function | Input | Output | What it does | Why it matters | Danger if changed |
|---|---|---|---|---|---|
| `build_parent_child_chunks()` | File name and Markdown text | Chunk dictionaries | Creates parent sections and child chunks with metadata. | Primary ingestion chunker. | Bad chunking breaks retrieval quality. |
| `chunk_text()` | File name and text | Basic chunks | Older/basic chunking path. | Still tested and useful as utility. | Changes can affect tests or fallback usage. |
| `build_chunk_metadata()` | File, chunk, index, heading | Metadata dict | Extracts project/doc type/heading/source/hash. | Metadata powers filtering, citations, evals. | Wrong metadata causes source/eval failures. |
| `_extract_first_heading()` | Text | Heading | Finds first Markdown heading. | Improves readable sources. | Low-medium. |
| `_extract_section_path()` | Text | Section path | Builds heading path. | Helps source display and filters. | Medium. |
| `_infer_project()` | File name | Project name | Infers project from filename. | Evaluation and metadata filtering. | Wrong inference can fail expected project matching. |
| `_infer_doc_type()` | File name | Doc type | Infers doc category. | Evaluation and filtering. | Wrong inference can fail doc-type tests. |
| `_build_source_uri()` | File name/section | Source URI | Builds stable source reference. | Citation/source traceability. | Broken URI reduces explainability. |
| `_build_parent_id()` | File/index/heading | Parent ID | Stable parent section ID. | Parent-child retrieval. | Instability can break parent references. |
| `_build_child_id()` | Parent ID/index | Child ID | Stable child chunk ID. | Parent-child metadata. | Instability can confuse debugging. |
| `_summarize_parent_section()` | Parent text | Summary | Creates short section summary. | Useful in source metadata and rerank context. | Low-medium. |
| `_split_markdown_sections()` | Markdown text | Section list | Splits text by Markdown headings. | Base for parent chunks. | Can split incorrectly inside code fences. |
| `_split_oversized_section()` | Section text | Chunk list | Splits large sections by paragraphs/token count. | Keeps chunks within target size. | Bad split can lose overlap or context. |
| `_split_by_token_count()` | Text/max/overlap | Chunk list | Token-window splitting. | Handles very large paragraphs. | Overlap bugs can duplicate or skip text. |
| `_normalize_overlap()` | Max tokens/overlap | Int | Keeps overlap valid. | Prevents infinite loops. | Low risk but important. |
| `_count_tokens()` | Text | Int | Whitespace token count. | Controls chunk size. | Approximate only; large drift affects prompt sizes. |
| `cosine_similarity()` | Two vectors | Float | Measures vector closeness. | Core vector scoring. | Math errors break retrieval. |
| `keyword_score()` | Query and text | Float | Measures lexical overlap. | Hybrid/rerank signal. | Token changes affect rankings. |
| `hybrid_score()` | Vector score and keyword score | Float | Weighted combined score. | Optional hybrid retrieval. | Weight mistakes can overvalue keywords or vectors. |
| `rerank_score()` | Chunk | Float | Adds keyword rerank influence. | Optional reranking. | Can reorder evidence unexpectedly. |
| `rerank_chunks()` | Chunks | Chunks | Sorts by rerank score. | Used when rerank enabled. | Can harm relevance if scoring is off. |
| `_tokenize()` | Text | Tokens | Regex tokenization. | Used by keyword score. | Token rules affect matching. |
| `top_k()` | Chunks and k | Top chunks | Sorts by score. | Candidate selection. | Sorting key changes answer evidence. |
| `select_relevant_chunks()` | Chunks/top-k/threshold/candidate/rerank | Selected chunks | Applies threshold, candidate pool, rerank, and top-k. | Final local relevance selection. | High-risk: controls which evidence reaches Gemini. |

### `app/services/firestore_service.py`

| Function | Input | Output | What it does | Why it matters | Danger if changed |
|---|---|---|---|---|---|
| `__init__()` | None | Service instance | Creates Firestore client. | Database connection boundary. | Import-time/client errors can break startup. |
| `create_session_id()` | None | UUID string | Creates new conversation session ID. | Conversation tracking. | Low risk. |
| `build_chunk_document_id()` | File name and chunk index | Stable hash ID | Creates deterministic chunk doc ID. | Enables stale pruning. | ID changes can duplicate chunks. |
| `add_document_chunk()` | Chunk metadata/text/embedding | Document ID | Writes chunk document to Firestore. | Core ingestion storage. | Schema changes can break retrieval/evals. |
| `search_document_chunks_by_vector()` | Query embedding/limit/filter | Chunk dicts | Runs Firestore nearest-neighbor vector query. | Scalable retrieval mode. | Query/filter mistakes can miss evidence. |
| `_vector_distance_measure()` | Config string | Firestore distance enum | Maps setting to Firestore API enum. | Required for vector search. | Wrong mapping breaks vector query. |
| `_normalize_document_chunk()` | Firestore snapshot | Dict | Converts Firestore doc to plain dict. | Makes vector/local retrieval consistent. | Missing fields can break RAG service. |
| `prune_document_chunks()` | File and expected IDs | Deleted count | Deletes stale chunks for file. | Keeps index fresh. | Too broad deletion can remove valid knowledge. |
| `stream_document_chunks()` | None | Iterator of chunks | Streams every chunk document. | Local scan retrieval. | Does not scale well with large corpora. |
| `save_message()` | Session/message fields | None | Saves conversation message and updates session. | Conversation memory and audit trail. | Wrong role/content fields can pollute history. |
| `save_query_rewrite_audit_message()` | Session/rewrite data | None | Saves system audit event. | Debugs query rewrite. | If loaded as visible history, can distort future context. |
| `load_recent_messages()` | Session and limit | Message list | Loads recent conversation messages. | Follow-up questions and rewrite. | Ordering bugs break conversational behavior. |
| `save_rag_analytics()` | Analytics dict | None | Writes analytics record. | Observability. | Bad schema can break summaries. |
| `load_recent_rag_analytics()` | Limit | Analytics list | Reads recent analytics. | Admin summary endpoint. | Low-medium. |

### `app/services/ingestion_service.py`

| Function | Input | Output | What it does | Why it matters | Danger if changed |
|---|---|---|---|---|---|
| `ingest_documents()` | Optional file list | Ingestion summary | Public wrapper with error handling. | Admin route calls this. | Error wrapping changes API behavior. |
| `_ingest_documents()` | File list | Ingestion summary | Reads, chunks, embeds, writes, prunes. | Builds the knowledge base. | Any bug can degrade or corrupt retrieval index. |

### `app/services/gemini_service.py`

| Function | Input | Output | What it does | Why it matters | Danger if changed |
|---|---|---|---|---|---|
| `__init__()` | None | Service instance | Creates Vertex AI Gemini client. | Provider boundary. | Wrong project/location breaks all AI calls. |
| `generate_text()` | Prompt, model/config params | Text | Calls Gemini non-streaming generation. | Sync RAG, direct chat, rewrite, multi-query, rerank. | Model/config changes affect many features. |
| `stream_text()` | Prompt | Text iterator | Calls Gemini streaming generation. | Streaming RAG. | Stream API changes break SSE flow. |
| `embed_text()` | Text | Embedding vector | Calls Gemini embedding model. | Ingestion and retrieval. | Embedding model changes can require re-ingestion. |

## 9. Configuration and Feature Flags

| Variable | Purpose | Default | Affects | Risk |
|---|---|---|---|---|
| `GOOGLE_CLOUD_PROJECT` | GCP project ID | Empty | Firestore, GCS, Gemini client project | High |
| `GOOGLE_CLOUD_LOCATION` | Vertex AI location | `us-central1` | Gemini generation/embedding location | Medium |
| `DOCS_BUCKET` | GCS bucket for docs | `cloud-resume-ai-rag-docs` | Ingestion and direct-doc chat | High |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origins | localhost plus CloudFront URL | Browser access | High |
| `DIRECT_CONTEXT_DOCUMENTS` | Docs for `/chat-with-docs` | `PROJECT_STATE.md,Frontend_Development_Log.md` | Direct-doc chat route | Medium |
| `INGEST_DOCUMENTS` | Docs ingested into RAG index | `PROJECT_STATE.md,Frontend_Development_Log.md` | Knowledge base contents | Very high |
| `INGESTION_ADMIN_TOKEN` | Admin token for ingestion/analytics | Empty | Admin route access | Very high |
| `RAG_TOP_K` | Final source count | `5` | Retrieval/prompt source count | High |
| `RAG_CANDIDATE_POOL_SIZE` | Candidate pool before top-k | `20` | Recall/ranking | Medium-high |
| `RAG_SCORE_THRESHOLD` | Minimum relevance score | `0.2` | Source inclusion/no-answer rate | High |
| `RAG_HYBRID_ENABLED` | Enable vector+keyword scoring | `false` | Retrieval scoring | High |
| `RAG_VECTOR_SCORE_WEIGHT` | Vector weight in hybrid score | `0.8` | Hybrid scoring balance | High |
| `RAG_RERANK_ENABLED` | Enable keyword-based reranking | `false` | Source order | Medium-high |
| `RAG_RERANK_KEYWORD_WEIGHT` | Keyword rerank weight | `0.1` | Rerank strength | Medium |
| `RAG_SEMANTIC_RERANK_ENABLED` | Enable Gemini reranker | `false` | Source selection/order | High |
| `RAG_SEMANTIC_RERANK_MODEL` | Model for semantic rerank | Generation model | Reranker cost/quality | Medium-high |
| `RAG_SEMANTIC_RERANK_TOP_N` | Candidates sent to semantic reranker | `10` | Reranker recall/cost | Medium |
| `RAG_SEMANTIC_RERANK_KEEP_K` | Chunks kept after semantic rerank | `5` | Prompt evidence | High |
| `RAG_SEMANTIC_RERANK_FALLBACK_ENABLED` | Fallback to original ranking on rerank failure | `true` | Resilience | Medium |
| `RAG_PARENT_CHILD_ENABLED` | Enable parent-child context expansion | `false` | Prompt context size/completeness | High |
| `RAG_PARENT_CONTEXT_MAX_TOKENS` | Parent context token cap | `1200` | Prompt size | High |
| `RAG_PARENT_CHILD_FALLBACK_ENABLED` | Fallback if parent expansion fails | `true` | Resilience | Medium |
| `RAG_QUERY_REWRITE_ENABLED` | Enable conversational query rewrite | `false` | Retrieval query | High |
| `RAG_QUERY_REWRITE_HISTORY_LIMIT` | History messages for rewrite | `6` | Rewrite context | Medium |
| `RAG_QUERY_REWRITE_MODEL` | Model for rewrite | Generation model | Rewrite behavior/cost | Medium |
| `RAG_MULTI_QUERY_ENABLED` | Enable alternate retrieval queries | `false` | Recall/cost/noise | High |
| `RAG_MULTI_QUERY_COUNT` | Number of retrieval queries | `3` | Retrieval breadth | Medium-high |
| `RAG_MULTI_QUERY_MODEL` | Model for query expansion | Generation model | Query expansion behavior | Medium |
| `RAG_RATE_LIMIT_ENABLED` | Enable RAG rate limiting | `true` | Abuse/cost protection | High |
| `RAG_RATE_LIMIT_REQUESTS` | Allowed requests per window | `20` | User throughput | Medium-high |
| `RAG_RATE_LIMIT_WINDOW_SECONDS` | Rate limit window | `60` | User throughput | Medium |
| `RAG_VECTOR_SEARCH_BACKEND` | `local` or `firestore_vector` | `local` | Retrieval implementation | Very high |
| `RAG_FIRESTORE_VECTOR_DISTANCE` | Distance measure | `COSINE` | Firestore vector ranking | High |
| `RAG_FIRESTORE_VECTOR_LIMIT` | Firestore vector query limit | `20` | Vector recall/cost | Medium-high |
| `RAG_FIRESTORE_VECTOR_FALLBACK_ENABLED` | Fallback to local scan on vector failure | `true` | Reliability | High |
| `RAG_FIRESTORE_VECTOR_FIELD` | Firestore vector field name | `embedding` | Vector query schema | High |
| `CHUNK_MAX_TOKENS` | Chunk size target | `500` | Ingestion/retrieval granularity | High |
| `CHUNK_OVERLAP_TOKENS` | Chunk overlap | `40` | Context continuity | Medium-high |
| `LOG_LEVEL` | Logging verbosity | `INFO` | Observability | Low-medium |

### Model names

The current settings code uses:

| Setting | Value |
|---|---|
| Generation model | `gemini-2.5-flash` |
| Embedding model | `text-embedding-005` |

Changing the embedding model is especially risky because old Firestore embeddings may no longer be comparable with new query embeddings. A model change should normally be paired with re-ingestion.

## 10. Firestore Data Model

### Collection: document chunks

Configured by:

```text
settings.firestore_chunks_collection = "document_chunks"
```

Each document represents one searchable chunk.

Important fields:

| Field | Meaning |
|---|---|
| `project` | Inferred project name from source filename. |
| `doc_type` | Inferred document type. |
| `file_name` | Source Markdown filename. |
| `heading` | Main heading for chunk. |
| `section_path` | Heading path within document. |
| `source_uri` | Stable source reference for citations/debugging. |
| `version_id` | Source version identifier, currently derived from content hash. |
| `chunk_index` | Chunk position within file. |
| `chunk_text` | Text sent to retrieval/prompt. |
| `embedding` | Firestore vector embedding. |
| `content_hash` | Hash of chunk content. |
| `char_count` | Character count. |
| `parent_id` | Parent section ID for parent-child retrieval. |
| `child_id` | Child chunk ID. |
| `parent_heading` | Heading for parent section. |
| `parent_section_path` | Section path for parent section. |
| `parent_chunk_summary` | Short summary of parent section. |
| `parent_context` | Larger parent section text. |
| `ingestion_key` | File/chunk ingestion identity. |
| `updated_at` | Firestore server timestamp. |

### Collection: conversations

Configured by:

```text
settings.firestore_conversations_collection = "conversations"
```

Structure:

```text
conversations/{session_id}
  ├── updated_at
  ├── last_request_id
  └── messages/{message_id}
      ├── role
      ├── content
      ├── request_id
      ├── sources
      ├── metadata
      └── created_at
```

Roles include:

- `user`
- `assistant`
- `system` for query rewrite audit messages

The RAG service filters history so system audit events do not become visible conversation context.

### Collection: RAG analytics

Configured by:

```text
settings.firestore_rag_analytics_collection = "rag_analytics"
```

Important fields:

| Field | Meaning |
|---|---|
| `request_id` | Request correlation ID. |
| `session_id` | Conversation session. |
| `response_mode` | `sync` or `stream`. |
| `question_length` | Character length of user question. |
| `answer_length` | Character length of final answer. |
| `duration_ms` | End-to-end service duration. |
| `source_count` | Number of returned sources. |
| `source_file_names` | Source files used. |
| `max_score` | Best retrieval score. |
| `no_answer` | Whether canonical no-answer was returned. |
| `citation_validation_blocked_answer` | Whether citation guard replaced the answer. |
| `retrieval_query_length` | Length of retrieval query. |
| `query_rewritten` | Whether rewrite changed retrieval query. |
| `multi_query_enabled` | Whether multi-query was active. |
| `retrieval_query_count` | Number of retrieval queries used. |
| `metadata_filter` | Filter applied to retrieval. |
| `retrieval_backend` | `local` or `firestore_vector`. |
| `semantic_rerank_enabled` | Whether semantic rerank was configured. |
| `semantic_rerank_applied_count` | Number of chunks with semantic rerank metadata. |
| `parent_child_enabled` | Whether parent-child expansion was configured. |
| `parent_context_expanded_count` | Number of chunks expanded with parent context. |

## 11. RAG Quality Mechanics

### Chunking

Chunking happens during ingestion. The stronger path is `build_parent_child_chunks()`:

- splits Markdown into parent sections
- splits oversized sections into child chunks
- stores both child text and parent context
- attaches metadata for headings, source file, section path, project, doc type, and hashes

Good chunking matters because Gemini only sees selected chunks. If a chunk is too small, it may lack context. If it is too large, embeddings become less precise and prompts become expensive.

### Embeddings

Embeddings are generated by Gemini's embedding model:

```text
text-embedding-005
```

Ingestion embeds each chunk. Query time embeds the user/retrieval query. Retrieval compares query embedding against chunk embeddings.

### Scoring

The backend supports:

- pure vector similarity
- keyword score
- optional hybrid score
- optional keyword reranking
- optional semantic reranking

Local retrieval streams Firestore chunks and computes scores in Python. Firestore vector retrieval asks Firestore for nearest neighbors first, then still normalizes/scopes results through the RAG service.

### Reranking

Reranking can happen in two layers:

1. Lightweight keyword reranking inside `VectorService`.
2. Optional semantic reranking using Gemini inside `RagService`.

Semantic reranking is more powerful but higher-risk because it depends on another model call and model-output parsing.

### Prompt design

`_build_prompt()` tells Gemini:

- answer only from indexed project documents
- cite source IDs like `[S1]`
- say the canonical no-answer phrase when sources do not support an answer
- use conversation context only to understand follow-up questions

This prompt is one of the main controls against hallucination.

### Source citations

`_add_source_ids()` assigns IDs like:

```text
S1, S2, S3
```

`_build_context()` puts those IDs into the prompt. `_validate_grounded_answer()` checks that the final answer cites valid IDs.

### No-answer behavior

Canonical no-answer:

```text
I do not know based on the indexed project documents.
```

The citation validator allows this exact no-answer even without citations. Otherwise, an answer must cite valid retrieved source IDs.

### Evaluation tests

`evaluate_rag.py` checks:

- required answer terms
- forbidden answer terms
- expected source files
- expected document types
- citation grounding
- no-answer behavior
- latency
- threshold pass/fail status

The historical eval reports show the backend is measurable and has known quality baselines.

## 12. Tests and Evaluation Map

### Backend unit/behavior tests

| Test file | What it covers |
|---|---|
| `test_rag_service.py` | Sync answers, streaming answers, citation validation, no-answer handling, metadata filters, query rewrite, multi-query, Firestore vector fallback, semantic rerank, parent-child context, analytics, source metadata, conversation history behavior. |
| `test_vector_service.py` | Chunking, section splitting, oversized chunks, overlap, metadata extraction, parent-child metadata, relevance selection, keyword score, hybrid score. |
| `test_firestore_service.py` | Chunk writes, vector fields, parent fields, Firestore vector query filters and distance config. |
| `test_chat_schema.py` | Source metadata schema fields, including parent-child and semantic rerank fields. |
| `test_ingestion_auth.py` | Admin protection around ingestion/analytics-style routes. |
| `test_rag_eval.py` | Evaluation script scoring helpers, citation grounding, no-answer checks, thresholds, report behavior. |
| `test_rate_limit_service.py` | Rate limiter allow/block behavior and disabled mode. |
| `test_settings.py` | Settings defaults, sanitized public summary, startup warnings, feature flag reporting, CORS config. |

### What tests do not fully cover

| Gap | Why it matters |
|---|---|
| True live Gemini behavior | Unit tests use fakes; model behavior can change. |
| True live Firestore vector index behavior | Firestore vector search has provider-specific behavior and index requirements. |
| End-to-end Cloud Run streaming under browser conditions | SSE can fail through proxies/timeouts even if unit tests pass. |
| Large corpus scalability | Local scan is fine for small corpora but not enough for large document sets. |
| Security scanning | Admin token logic is tested, but broader security review is separate. |
| Load testing | Rate limits are tested in memory, not under multi-instance traffic. |

### How `scripts/evaluate_rag.py` works

1. Loads `evals/golden_questions.json`.
2. Sends each question to `/ask-rag`.
3. Reads the backend JSON response.
4. Scores response against expected terms, forbidden terms, source files, doc types, citation grounding, and no-answer expectations.
5. Computes summary metrics.
6. Compares metrics against thresholds.
7. Writes Markdown and JSON reports.

### What eval reports mean

| Metric | Meaning |
|---|---|
| Overall pass rate | Share of golden questions that passed all checks. |
| Source match rate | Whether expected files were retrieved/cited in source list. |
| Doc type match rate | Whether expected document categories were retrieved. |
| Citation grounding rate | Whether answer citations refer to returned source IDs. |
| No-answer accuracy | Whether no-answer cases are handled correctly. |
| Average/p95 latency | User-facing speed characteristics. |
| Threshold status | Whether configured quality gates passed. |

### Historical evaluation notes

The existing eval reports show:

- Post-audit local-style run around 30/50 passing.
- Firestore vector run around 29/50 passing.
- Citation grounding near the configured threshold.
- Firestore vector search was documented but not clearly better than local scan for the current corpus.

This means Firestore vector search is technically implemented, but quality should remain benchmark-driven before making it the default.

### Tests to add next

| Proposed test | Why |
|---|---|
| End-to-end streaming contract test | Protect `metadata`, `token`, `done`, and `error` event shapes. |
| Prompt snapshot tests for core paths | Catch accidental prompt changes. |
| Query rewrite plus multi-query combined test | These features interact in retrieval query construction. |
| Parent-child prompt-size boundary test | Prevent oversized parent context from bloating prompts. |
| Firestore local scan scalability benchmark | Quantify when local scan becomes unacceptable. |
| Ingestion stale-prune safety test across multiple files | Ensure pruning never deletes another file's chunks. |
| Live eval smoke test with soft thresholds | Separate unit safety from deployed behavior. |

## 13. Complexity Hotspots

### Why `rag_service.py` is large

`rag_service.py` currently owns orchestration and many subdomains:

- API response construction
- conversation memory loading
- query rewrite
- multi-query generation
- retrieval backend selection
- local scoring
- Firestore vector fallback
- semantic reranking
- parent-child expansion
- prompt construction
- Gemini response handling
- citation validation
- analytics creation
- Firestore message saving
- SSE formatting

That is why the file is large. It is not just "RAG"; it is several systems glued together.

### Why retrieval is hard to refactor

Retrieval combines multiple fragile choices:

- which query text is embedded
- how many query variants exist
- whether metadata filters apply before or after vector search
- whether the backend is local or Firestore vector
- how duplicate chunks across multiple queries are merged
- how vector and keyword scores are combined
- whether reranking changes source order
- whether parent context replaces child text

A small change can affect answer correctness, citations, latency, and evaluation scores.

### Why streaming can break

Streaming depends on:

- exact SSE wire format
- event names expected by the frontend
- not sending invalid raw model output before citation validation
- exception handling after the HTTP stream has already started
- saving state after generation but before `done`

Streaming bugs often appear as frontend hangs or partial answers, not clean backend exceptions.

### Why citation validation matters

Citation validation is the main guardrail that prevents the backend from returning unsupported Gemini answers.

Without it, Gemini might:

- answer from general knowledge
- cite source IDs that do not exist
- give plausible but unsupported architecture claims
- mix old and current project states

The validator currently chooses safety over completeness by replacing unsupported answers with the canonical no-answer.

### Why Firestore local scan does not scale

Local scan retrieval does this:

```text
stream every chunk from Firestore
  -> compute similarity in Python
  -> sort/filter locally
```

This is acceptable for a small portfolio corpus. It becomes expensive when:

- chunk count grows
- concurrent users grow
- Firestore read cost matters
- latency targets get stricter

Firestore vector search is the scalable direction, but the current eval history says it must be benchmarked carefully before becoming the default.

## 14. Refactor Roadmap

Do not refactor yet. These are future safe phases.

### Phase 1: Extract prompt builder

| Item | Details |
|---|---|
| Files affected | `app/services/rag_service.py`, new `app/services/prompt_builder.py`, tests. |
| Risk level | Medium. |
| Tests required | Prompt snapshot tests, no-answer prompt behavior, citation instruction tests, sync/stream regression tests. |
| Expected benefit | Makes prompt changes safer and easier to review. |

### Phase 2: Extract citation validator

| Item | Details |
|---|---|
| Files affected | `app/services/rag_service.py`, new `app/services/citation_service.py`, tests. |
| Risk level | Medium-high. |
| Tests required | Valid citations, invalid citations, missing citations, canonical no-answer, source ID edge cases. |
| Expected benefit | Isolates the hallucination guardrail. |

### Phase 3: Extract retrieval service

| Item | Details |
|---|---|
| Files affected | `rag_service.py`, `vector_service.py`, `firestore_service.py`, new `retrieval_service.py`, tests. |
| Risk level | High. |
| Tests required | Local retrieval, Firestore vector retrieval, fallback, metadata filters, multi-query dedupe, scoring order, top-k threshold. |
| Expected benefit | Separates evidence selection from answer generation. |

### Phase 4: Extract conversation memory service

| Item | Details |
|---|---|
| Files affected | `rag_service.py`, `firestore_service.py`, new `conversation_service.py`, tests. |
| Risk level | Medium. |
| Tests required | History loading order, system audit filtering, request history fallback, session creation, message saves. |
| Expected benefit | Makes follow-up behavior easier to reason about. |

### Phase 5: Extract analytics service

| Item | Details |
|---|---|
| Files affected | `rag_service.py`, `firestore_service.py`, new `analytics_service.py`, tests. |
| Risk level | Low-medium. |
| Tests required | Analytics fields, summary math, failure swallowing, backend mode counts, source usage counts. |
| Expected benefit | Removes observability code from the RAG answer path. |

### Phase 6: Split vector chunking from vector scoring

| Item | Details |
|---|---|
| Files affected | `vector_service.py`, new `chunking_service.py` or `scoring_service.py`, tests. |
| Risk level | Medium-high. |
| Tests required | Chunk boundaries, parent-child metadata, cosine math, keyword math, select relevant chunks. |
| Expected benefit | Clarifies ingestion logic versus query-time ranking logic. |

## 15. Beginner Study Guide

Use this order to understand the backend.

### 1. FastAPI routes

Start with:

- `app/routes/rag.py`
- `app/routes/health.py`
- `app/routes/chat.py`

Goal: understand which URLs exist and which service each route calls.

### 2. Pydantic schemas

Read:

- `app/schemas/chat_schema.py`

Goal: understand the shape of requests and responses before reading service logic.

### 3. `settings.py`

Read:

- `app/config/settings.py`

Goal: understand the feature flags. RAG behavior changes dramatically based on config.

### 4. Ingestion

Read:

- `app/services/ingestion_service.py`
- `app/services/gcs_service.py`
- `FirestoreService.add_document_chunk()`

Goal: understand how Markdown becomes Firestore chunks.

### 5. Chunking

Read:

- `VectorService.build_parent_child_chunks()`
- `_split_markdown_sections()`
- `_split_oversized_section()`
- `build_chunk_metadata()`

Goal: understand what a searchable chunk contains.

### 6. Embeddings

Read:

- `GeminiService.embed_text()`

Goal: understand how text becomes vectors.

### 7. Retrieval

Read:

- `RagService._retrieve_scored_chunks()`
- `_retrieve_scored_chunks_local()`
- `_retrieve_scored_chunks_firestore_vector()`
- `VectorService.select_relevant_chunks()`

Goal: understand how the backend chooses evidence.

### 8. Prompt building

Read:

- `_build_context()`
- `_build_history_context()`
- `_build_prompt()`

Goal: understand exactly what Gemini sees.

### 9. Gemini generation

Read:

- `GeminiService.generate_text()`
- `GeminiService.stream_text()`
- `RagService.answer_question()`
- `RagService.stream_answer()`

Goal: understand how answers are produced.

### 10. Streaming

Read:

- `ask_rag_stream()`
- `stream_answer()`
- `_format_sse()`
- `_chunk_answer_for_sse()`

Goal: understand the frontend streaming contract.

### 11. Firestore memory

Read:

- `save_message()`
- `load_recent_messages()`
- `save_query_rewrite_audit_message()`

Goal: understand sessions, conversation history, and query rewrite audit messages.

### 12. Evaluation

Read:

- `evals/golden_questions.json`
- `scripts/evaluate_rag.py`
- `evals/*.md`

Goal: understand how quality is measured.

## 16. Final Summary

### What is working

- The backend has a complete RAG pipeline from user question to grounded answer.
- Sync and streaming endpoints share the same retrieval preparation logic.
- Ingestion supports Markdown from GCS, embeddings, Firestore storage, and stale pruning.
- The system has safety controls: admin token, rate limit, citation validation, no-answer behavior, startup warnings, and analytics.
- Tests cover many important RAG behaviors, including rewrite, multi-query, semantic rerank, parent-child context, vector fallback, and citation handling.
- Evaluation tooling exists and produces measurable quality reports.

### What is messy

- `rag_service.py` is doing too much.
- Retrieval has many interacting flags and ranking stages.
- Firestore local scan is simple and reliable but not scalable.
- Firestore vector search exists, but historical evaluation does not yet prove it is better than local scan for this corpus.
- Streaming is necessarily careful because citation validation happens after generation.
- Some default document names in settings appear older than the current audited knowledge base and should be treated carefully during deployment review.

### What not to touch yet

- Do not casually rewrite retrieval ranking.
- Do not weaken citation validation.
- Do not change embedding model without re-ingestion.
- Do not make Firestore vector search the default without passing evaluations.
- Do not split `rag_service.py` until tests and prompt snapshots are strong enough.
- Do not change SSE event names or payload shapes without frontend verification.

### What is safe to improve next

- Add prompt snapshot tests.
- Add streaming contract tests.
- Add more eval cases for ambiguous/current-vs-historical project status.
- Add clearer documentation of production environment variables.
- Extract analytics only after verifying no behavior changes.
- Improve Firestore vector search only with benchmark comparisons against local scan.

### What to understand before Terraform or Contact Form work

Before moving to Terraform or Contact Form features, understand:

1. Which environment variables define the live RAG behavior.
2. Which GCS documents are the actual current knowledge base.
3. How ingestion updates Firestore chunks.
4. Why the embedding model and indexed chunks must match.
5. How `/ask-rag` and `/ask-rag-stream` differ.
6. Why citation validation protects portfolio credibility.
7. How evaluation reports prove whether a backend change improved or harmed quality.

The most important mental model is:

```text
The backend does not "know" the project by itself.
It knows only what ingestion placed into Firestore,
then it asks Gemini to answer using the retrieved chunks,
then it rejects answers that are not grounded in those chunks.
```

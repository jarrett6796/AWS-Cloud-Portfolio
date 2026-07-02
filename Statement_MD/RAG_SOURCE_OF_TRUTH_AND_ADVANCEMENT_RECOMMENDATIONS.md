# RAG Source of Truth and Advancement Recommendations

Inspection date: 2026-07-01

Scope: GCP RAG backend, active frontend chat integration, RAG evaluation files, deployment workflows, and existing project documentation.

Safety status: Documentation-only inspection. No runtime behavior changed. No Terraform apply/import/destroy. No deploy. No endpoint schema, SSE format, CORS, environment variable, or retrieval default changes.

## 1. Executive Summary

The current RAG system is best described as:

```text
Intermediate RAG with several advanced RAG features implemented and some enabled in live runtime.
```

It should not be described as fully production-grade Advanced RAG yet.

The system has a real Cloud Run FastAPI backend using Gemini 2.5 Flash, `text-embedding-005`, Firestore `document_chunks`, Firestore `conversations`, GCS document ingestion, `/ask-rag`, `/ask-rag-stream`, citation validation, safe no-answer fallback, metadata-only analytics, admin-protected ingestion and analytics summary endpoints, and in-memory rate limiting.

The live backend health/config endpoint was checked read-only on 2026-07-01. It reports:

- `generation_model=gemini-2.5-flash`
- `embedding_model=text-embedding-005`
- `vector_search_backend=local`
- `semantic_rerank_enabled=true`
- `parent_child_enabled=true`
- `query_rewrite_enabled=false`
- `multi_query_enabled=false`
- `rag_hybrid_enabled=false`
- `rag_rerank_enabled=false`
- `rate_limit_enabled=true`
- `rate_limit_requests=100`
- `rate_limit_window_seconds=60`
- `ingestion_admin_token_configured=true`
- `ingest_documents=["CAPSTONE_PROJECT_STATE.md","gcp-rag-system-design.md"]`

Deployment drift cleanup status:

- Live runtime has semantic reranking and parent-child retrieval enabled.
- `.github/workflows/deploy-backend-gcp.yml` now sets `RAG_SEMANTIC_RERANK_ENABLED=true` and `RAG_PARENT_CHILD_ENABLED=true`, matching the intended current live Phase 4 runtime.
- A future manual workflow deploy should preserve those live Phase 4 features unless a later change intentionally disables them and documents that decision.

The strongest quality limitation is evaluation:

- The latest stored local baseline evaluation is 30/50, overall pass rate 0.60.
- The Firestore Vector Search evaluation is 29/50, overall pass rate 0.58.
- Both are below the evaluator's default 0.80 pass-rate threshold.
- The Phase 4 semantic reranking and parent-child live deployment was functionally smoke-tested, but no stored 50-question evaluation was found after those features were enabled.

## 2. Current RAG Architecture

Verified request path:

```text
Browser
  -> frontend-React/src/components/ChatPanel.jsx
  -> frontend-React/src/hooks/useAssistantChat.js
  -> frontend-React/src/api/chat.js
  -> POST /ask-rag-stream
  -> backend-GCP/app/routes/rag.py
  -> backend-GCP/app/services/rag_service.py
  -> policy/router precheck
  -> Firestore conversation history load
  -> optional query rewrite
  -> optional multi-query generation
  -> Gemini embedding using text-embedding-005
  -> retrieval from Firestore document_chunks
  -> local scoring or Firestore vector search path
  -> metadata filtering
  -> optional deterministic reranking
  -> optional Gemini semantic reranking
  -> source ID assignment
  -> optional parent context expansion
  -> prompt builder
  -> Gemini 2.5 Flash answer generation
  -> citation validation and safe no-answer fallback
  -> Firestore conversation writes
  -> metadata-only RAG analytics write
  -> SSE metadata/token/done or sync JSON response
```

Primary backend files:

- `backend-GCP/main.py`: FastAPI app, CORS, request IDs, structured request logging, route registration.
- `backend-GCP/app/routes/rag.py`: `/ingest-docs`, `/rag-analytics/summary`, `/ask-rag`, `/ask-rag-stream`, and rate-limit enforcement.
- `backend-GCP/app/services/rag_service.py`: RAG orchestration, query rewrite, multi-query, retrieval backend selection, metadata filtering, reranking, parent expansion, citation validation, Firestore memory writes, analytics writes, and SSE formatting.
- `backend-GCP/app/services/vector_service.py`: Markdown-aware chunking, token-budget chunking, overlap splitting, metadata inference, cosine similarity, keyword score, hybrid score, deterministic reranking.
- `backend-GCP/app/services/firestore_service.py`: Firestore chunk writes, local chunk streaming, Firestore vector search, conversation messages, query rewrite audit messages, RAG analytics.
- `backend-GCP/app/services/ingestion_service.py`: GCS document read, parent-child chunk building, embedding, Firestore upsert, stale chunk pruning.
- `backend-GCP/app/services/rag_prompt_builder.py`: final answer prompt, query rewrite prompt, multi-query prompt, semantic rerank prompt.
- `backend-GCP/app/schemas/chat_schema.py`: request/response contracts and source metadata fields.

Active frontend files:

- `frontend-React/src/api/chat.js`: calls `/ask-rag-stream` and `/ask-rag`; default base URL is `https://gcp-rag-backend-189047029621.asia-east1.run.app`; override is `VITE_GCP_RAG_API_URL`.
- `frontend-React/src/hooks/useAssistantChat.js`: streaming-first assistant flow with fallback to `/ask-rag`, project-scoped session IDs, local visible history, source attachment, response status timing.
- `frontend-React/src/components/ChatPanel.jsx`: visible assistant UI and source rendering.

Important path correction:

- The current checkout does not contain `frontend-AWS/`.
- The active frontend path is `frontend-React/`.
- Current CI workflows now target `frontend-React/`; some historical docs still reference `frontend-AWS/` and should be treated as old path labels unless they claim current checkout state.

## 3. Current Feature Matrix

In this table, "Enabled by default?" means current live runtime when live runtime evidence exists. Code defaults and checked-in workflow drift are called out separately in the evidence column.

| Feature | Implemented? | Enabled by default? | Production safe? | Evidence |
| --- | --- | --- | --- | --- |
| Firestore local full-scan retrieval | Yes | Yes | Conditional | `rag_service._retrieve_scored_chunks_local()` streams all `document_chunks`; live `GET /` reports `vector_search_backend=local`. Scales poorly as chunks grow. |
| Firestore Vector Search | Yes | No | Conditional, not default | `firestore_service.search_document_chunks_by_vector()` uses `find_nearest(...)`; live `GET /` reports `vector_search_backend=local`; stored vector eval scored 29/50 vs 30/50 local baseline. |
| Query rewriting | Yes | No | Conditional | `rag_service._rewrite_query_if_needed()` and query rewrite audit writes exist; live `GET /` and workflow report disabled. |
| Multi-query retrieval | Yes | No | Conditional | `rag_service._build_retrieval_queries()` and `build_multi_query_prompt()` exist; live `GET /` and workflow report disabled. |
| Hybrid keyword + vector retrieval | Yes | No | Conditional | `vector_service.hybrid_score()` and `RAG_HYBRID_ENABLED`; live `GET /` reports disabled. |
| Deterministic reranking | Yes | No | Conditional | `vector_service.rerank_chunks()` controlled by `RAG_RERANK_ENABLED`; live `GET /` reports disabled. |
| Gemini semantic reranking | Yes | Yes in live runtime; no in checked-in workflow | Conditional | `rag_service._semantic_rerank_chunks()` calls Gemini with compact chunk previews; live `GET /` reports enabled; workflow sets disabled. Latency impact must be monitored. |
| Parent-child retrieval/context expansion | Yes | Yes in live runtime; no in checked-in workflow | Conditional | `vector_service.build_parent_child_chunks()` adds parent metadata; `rag_service._expand_parent_context()` expands parent context; live `GET /` reports enabled; workflow sets disabled. |
| Metadata filtering | Yes | Request-dependent | Yes, with caveats | `MetadataFilter` supports `project`, `doc_type`, `file_name`, `heading`, `section_path`, `source_uri`, `version_id`; text filters are substring checks after candidate retrieval. |
| Chunk overlap | Yes | Yes | Yes | `DEFAULT_CHUNK_OVERLAP_TOKENS=40`; `vector_service._split_by_token_count()` uses overlap for oversized paragraphs. |
| Token-aware chunking | Yes | Yes | Yes | `DEFAULT_CHUNK_SIZE=500`; chunking uses token counts by whitespace split. This is approximate, not model-token exact. |
| Markdown-aware chunking | Yes | Yes | Yes | `vector_service._split_markdown_sections()` splits on Markdown headings. |
| Citation validation | Yes | Yes | Yes | `rag_service._validate_grounded_answer()` requires cited `[S#]` IDs to match returned sources, except exact safe no-answer. |
| Safe no-answer guardrail | Yes | Yes | Yes | Canonical response: `I do not know based on the indexed project documents.` Used when no context or citation validation fails. |
| Firestore chat history | Yes | Yes | Yes, limited | `firestore_service.save_message()` and `load_recent_messages()` persist under `conversations/{session_id}/messages`; history is limited and filters visible roles. |
| Streaming SSE | Yes | Yes in frontend | Yes, contract-sensitive | `/ask-rag-stream` emits `metadata`, `token`, `done`, `error`; frontend streams first and falls back to sync. Do not change event shape casually. |
| RAG analytics | Yes | Yes | Yes | `save_rag_analytics()` writes metadata-only records to `rag_analytics`; analytics write failures do not break answers. |
| Admin-only analytics summary | Yes | Yes | Yes | `GET /rag-analytics/summary` requires `X-Admin-Token`; summary caps limit at 500. |
| Rate limiting | Yes | Yes | Basic only | `rate_limit_service.py` is in-memory per process; live runtime is 100 requests per 60 seconds. Not distributed quota enforcement. |
| CI/CD RAG evaluation | Yes | Soft-fail only | Partial | Deploy workflow runs `scripts/evaluate_rag.py --soft-fail`; thresholds are evaluated but do not block deployment. |
| GraphRAG | No | No | No | No graph/entity retrieval code found; docs identify as future. |
| Agentic RAG | No | No | No | No tool-using agent or specialist retriever orchestration found; docs identify as future. |
| Context compression | No | No | No | Parent context has token cap, but no compression/summarization stage for retrieved context was found. |

## 4. Verified Runtime Defaults

### Live runtime from read-only `GET /`

The live Cloud Run root endpoint reported:

| Setting | Live value |
| --- | --- |
| Backend URL | `https://gcp-rag-backend-189047029621.asia-east1.run.app` |
| Phase | `advanced-rag-monitoring-hardening` |
| Service | `gcp-rag-backend` |
| Environment | `development` |
| Location | `us-central1` |
| Docs bucket | `cloud-resume-ai-rag-docs` |
| Generation model | `gemini-2.5-flash` |
| Embedding model | `text-embedding-005` |
| Chunks collection | `document_chunks` |
| Conversations collection | `conversations` |
| Analytics collection | `rag_analytics` |
| Ingestion admin token configured | `true` |
| `RAG_TOP_K` | `5` |
| `RAG_CANDIDATE_POOL_SIZE` | `20` |
| `RAG_SCORE_THRESHOLD` | `0.2` |
| `RAG_HYBRID_ENABLED` | `false` |
| `RAG_RERANK_ENABLED` | `false` |
| `RAG_SEMANTIC_RERANK_ENABLED` | `true` |
| `RAG_PARENT_CHILD_ENABLED` | `true` |
| `RAG_QUERY_REWRITE_ENABLED` | `false` |
| `RAG_MULTI_QUERY_ENABLED` | `false` |
| `RAG_RATE_LIMIT_ENABLED` | `true` |
| `RAG_RATE_LIMIT_REQUESTS` | `100` |
| `RAG_RATE_LIMIT_WINDOW_SECONDS` | `60` |
| `RAG_VECTOR_SEARCH_BACKEND` | `local` |
| `RAG_VECTOR_SEARCH_DISTANCE_MEASURE` | `COSINE` |
| `RAG_VECTOR_SEARCH_LIMIT` | `20` |
| `RAG_VECTOR_SEARCH_FALLBACK_ENABLED` | `true` |
| `DEFAULT_CHUNK_SIZE` | `500` |
| `DEFAULT_CHUNK_OVERLAP_TOKENS` | `40` |
| Direct context documents | `CAPSTONE_PROJECT_STATE.md` |
| Ingest documents | `CAPSTONE_PROJECT_STATE.md`, `gcp-rag-system-design.md` |

### Code defaults in `backend-GCP/app/config/settings.py`

The code defaults are more conservative:

- `RAG_VECTOR_SEARCH_BACKEND=local`
- `RAG_HYBRID_ENABLED=false`
- `RAG_RERANK_ENABLED=false`
- `RAG_SEMANTIC_RERANK_ENABLED=false`
- `RAG_PARENT_CHILD_ENABLED=false`
- `RAG_QUERY_REWRITE_ENABLED=false`
- `RAG_MULTI_QUERY_ENABLED=false`
- `RAG_RATE_LIMIT_ENABLED=true`
- `RAG_RATE_LIMIT_REQUESTS=20`
- `RAG_RATE_LIMIT_WINDOW_SECONDS=60`
- `INGEST_DOCUMENTS=PROJECT_STATE.md,Frontend_Development_Log.md`

### Checked-in deployment workflow defaults

`.github/workflows/deploy-backend-gcp.yml` is manual-only (`workflow_dispatch`) and sets:

- `RAG_VECTOR_SEARCH_BACKEND=local`
- `RAG_QUERY_REWRITE_ENABLED=false`
- `RAG_MULTI_QUERY_ENABLED=false`
- `RAG_SEMANTIC_RERANK_ENABLED=true`
- `RAG_PARENT_CHILD_ENABLED=true`
- `RAG_RATE_LIMIT_ENABLED=true`
- `RAG_RATE_LIMIT_REQUESTS=100`
- `RAG_RATE_LIMIT_WINDOW_SECONDS=60`

This now matches the live runtime for semantic reranking and parent-child retrieval. Treat any future change to disable either flag as an intentional production behavior change that needs documentation.

## 5. Source-of-Truth Conflicts / Outdated Notes

| File | Outdated / suspicious claim | Actual current state | Recommended correction |
| --- | --- | --- | --- |
| `Statement_MD/GCP_RAG_PROJECT_STATE.md` | Says semantic reranking and parent-child retrieval still need deployment, reingestion, flag enablement, and live evaluation before production use. | Code supports both, development log records deployment, and live `GET /` reports both enabled. No stored 50-question eval after enablement was found. | Change to: implemented and enabled in live runtime, but 50-question evaluation after enablement is still missing. |
| `.github/workflows/deploy-backend-gcp.yml` | Previously set `RAG_SEMANTIC_RERANK_ENABLED=false` and `RAG_PARENT_CHILD_ENABLED=false`. | Live runtime reports both true, and the workflow now matches those Phase 4 flags. | Resolved. Preserve true/true unless a later deploy intentionally changes production behavior and documents the reason. |
| `Statement_MD/GCP_RAG_PROJECT_STATE.md` | Lists older Cloud Run revisions `00010`, `00012`, `00022` as current milestones but does not list the live Phase 4-enabled state clearly. | Development log records final validated Phase 4 revision `gcp-rag-backend-00028-hlc`; live endpoint reports Phase 4-style flags enabled. | Keep older revisions as historical evidence; add a "current live runtime verified 2026-07-01" section. |
| `Statement_MD/GCP_RAG_DEVELOPMENT_LOG.md` | Phase 4 section says final production config has semantic rerank and parent-child enabled, but later roadmap text still says those require deployment/reingestion/flag enablement/live evaluation. | Live runtime confirms enabled; missing piece is evaluation, not deployment/flag enablement. | Split completed implementation/deployment from missing 50-question quality validation. |
| `backend-GCP/evals/reports/rag_eval_post_audit.md` | Says managed vector retrieval is not implemented and a real semantic reranker is not implemented. | Firestore Vector Search and Gemini semantic reranking are implemented in code. Firestore vector is not default; semantic reranking is enabled live. | Treat this as historical eval output from before later implementation. Do not use it as current RAG status. |
| `backend-GCP/evals/reports/rag_eval_firestore_vector_20260625.md` | In one answer excerpt says managed vector retrieval is not implemented today. | Firestore Vector Search is implemented and evaluated, but not production default. | Correct current phrasing to "implemented and live-validated, but disabled as production default because eval underperformed local baseline." |
| `Statement_MD/CAPSTONE_PROJECT_STATE.md` | Multiple historical/current milestone notes reference `frontend-AWS/src/...`. | Current checkout contains `frontend-React/`, and `frontend-AWS/` does not exist. | Replace current-path references with `frontend-React/` only where they claim current checkout state or drive runnable commands; preserve `frontend-AWS` when it is clearly historical. |
| `.github/workflows/frontend-check.yml` and `.github/workflows/deploy-frontend.yml` | Previously used `frontend-AWS` working directories and cache paths. | Current checkout contains `frontend-React/`. | Resolved in workflow config by using `frontend-React` for working directories and npm cache paths. |
| `Statement_MD/PROJECT_DOCUMENTATION_AUDIT.md` | Previously listed many `frontend-AWS` frontend doc paths. | Active frontend path is `frontend-React/`. | Resolved for current path labels; preserve any separately dated historical evidence as historical. |
| `Statement_MD/GCP_RAG_PROJECT_STATE.md` | Says production retrieval still scans Firestore in memory, which is true for current default, but can be misread as Firestore Vector Search not existing. | Live runtime uses `local`; Firestore Vector Search is implemented and available behind `firestore_vector`. | Phrase as: production default is local full scan; optional Firestore Vector Search exists and is disabled by default. |
| Stored eval reports | Scores 4/50, 30/50, and 29/50 all exist. | They are different historical runs: early live stale-doc run 4/50, post-audit local baseline 30/50, Firestore vector 29/50. | Label each score with date, retrieval backend, and whether it predates Phase 4. |
| Docs using "production-grade Advanced RAG" language | Overstates quality if unqualified. | Evaluation remains below 0.80 pass threshold; no GraphRAG, Agentic RAG, context compression, distributed quota, dashboard, or managed vector default. | Use "intermediate RAG with several advanced features" unless a future evaluation and operational evidence supports stronger wording. |

## 6. Evaluation and Quality Status

Evaluation files inspected:

- `backend-GCP/evals/golden_questions.json`
- `backend-GCP/scripts/evaluate_rag.py`
- `backend-GCP/evals/reports/rag_eval_live_20260625.md`
- `backend-GCP/evals/reports/rag_eval_post_audit.md`
- `backend-GCP/evals/reports/rag_eval_firestore_vector_20260625.md`
- `.github/workflows/deploy-backend-gcp.yml`

Golden-question suite:

- Total questions: 50
- Format: JSON list
- Per-case fields include `id`, `category`, `project`, `question`, `expected_sources`, `expected_doc_types`, `answer_must_include`, `answer_should_not_include`, and `expect_no_answer`.

Evaluator metrics:

- Overall pass rate
- Source match rate
- Doc type match rate
- Required terms rate
- Forbidden terms rate
- Citation grounding rate
- No-answer accuracy
- Average latency
- P95 latency
- Failure category counts

Default thresholds in `scripts/evaluate_rag.py`:

- `min_overall_pass_rate=0.80`
- `min_source_match_rate=0.75`
- `min_citation_rate=0.90`
- `max_average_latency_ms=12000`

Stored evaluation history:

| Report | Date | Mode / interpretation | Passed | Overall | Citation | Avg latency | P95 latency | Threshold pass |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| `rag_eval_live_20260625.md` | 2026-06-24 | Early live/stale-doc run | 4/50 | 0.08 | 0.60 | 3268.07 ms | 5823.98 ms | No |
| `rag_eval_post_audit.md` | 2026-06-24 | Improved local baseline after source/doc correction | 30/50 | 0.60 | 0.90 | 3866.66 ms | 8583.75 ms | No |
| `rag_eval_firestore_vector_20260625.md` | 2026-06-25 | Firestore Vector Search mode | 29/50 | 0.58 | 0.92 | 3349.39 ms | 5974.65 ms | No |

CI/CD behavior:

- `deploy-backend-gcp.yml` runs unit tests and py_compile before deploy.
- After deploy, it runs `scripts/evaluate_rag.py` against `RAG_EVAL_BASE_URL` or the public Cloud Run URL.
- The evaluator uses `--soft-fail`, so failed thresholds are reported but do not fail the workflow.
- Artifacts uploaded: `rag_eval_report.md` and `rag_eval_report.json`.

What the score proves:

- The system has a real repeatable evaluation harness.
- Source matching and citation grounding are mostly strong in later stored runs.
- The local retrieval baseline outperformed Firestore vector by one question in the stored comparison.
- The current RAG should not be called production-grade Advanced RAG based on the stored evals.

What the score does not prove:

- It does not prove Phase 4 semantic reranking and parent-child retrieval improve quality, because no stored 50-question eval was found after those live features were enabled.
- It does not prove long-term production reliability.
- It does not prove retrieval scalability beyond the current document/chunk count.
- It does not test `/ask-rag-stream` end-to-end in the same quality harness.
- It does not validate dashboarding, alerting, SLOs, cost, or concurrent production load.

## 7. Current Bottlenecks

### Retrieval quality

- Local retrieval depends on embedding similarity plus optional features. Query rewrite, multi-query, hybrid scoring, and deterministic reranking are implemented but disabled live.
- Firestore Vector Search is implemented but scored worse than the local baseline in the stored 50-question run.
- Required-term failures remain the largest stored failure category in the best local/vector reports.

### Retrieval scalability

- Live production default is `local`, so the backend streams all Firestore chunks and scores them in process.
- This is acceptable for the current small corpus, but it is the main scalability bottleneck.
- Firestore Vector Search exists, but quality must meet or exceed the local baseline before enabling it by default.

### Latency

- Semantic reranking adds a Gemini call before answer generation.
- Parent context expansion can increase prompt size up to `RAG_PARENT_CONTEXT_MAX_TOKENS=1200` per selected chunk.
- Stored average latency is under the 12s threshold, but Phase 4 post-enable 50-question latency was not found.

### Eval accuracy

- The evaluator is useful but brittle: required-term matching can fail semantically correct answers that phrase content differently.
- Some stored answers show that the knowledge source can be outdated relative to code.
- The eval does not cover streaming quality, source freshness, or production config drift.

### Observability

- Request IDs, structured logs, metadata-only analytics, and admin summary exist.
- No dashboard, alerting policy, SLO, or runbook was found.
- Analytics are metadata-only by design, which is good for privacy but limits root-cause analysis of bad answers.

### Source freshness

- The live root endpoint reports `ingest_documents=["CAPSTONE_PROJECT_STATE.md","gcp-rag-system-design.md"]`, while code defaults still list older names.
- Multiple Markdown files still contain outdated RAG status and frontend path claims.
- Stored eval outputs can themselves become stale RAG context if ingested without labels.

### Prompt construction

- The final prompt is clear and citation-focused.
- There is no context compression stage.
- Parent context can improve grounding but may inflate prompt size.
- Conversation history is explicitly not treated as a factual source, which is correct.

### Citation validation

- Citation validation is strong and fails closed to the canonical no-answer.
- The guardrail is strict: any answer without valid cited source IDs is replaced.
- This protects correctness but can reduce answer usefulness if the model omits citations despite having correct context.

### Frontend UX

- Streaming-first UX is implemented with fallback.
- Sources are attached to assistant messages.
- The frontend has a hard-coded default production backend URL plus env override.
- Current checkout path is `frontend-React`; CI workflows now use that path. Historical docs may still reference `frontend-AWS` as the old folder name.

### Code maintainability

- `rag_service.py` remains a critical orchestration hotspot even after previous helper extraction.
- Retrieval, reranking, fallback, analytics, source formatting, and SSE formatting are still close together.
- Tests are broad and useful, but future work should keep splitting by behavior area before larger refactors.

## 8. Recommended Roadmap

### Immediate Fixes

| Recommendation | Priority | Risk | Portfolio value | Production value |
| --- | --- | --- | --- | --- |
| Update this report's facts into `GCP_RAG_PROJECT_STATE.md` and `GCP_RAG_DEVELOPMENT_LOG.md`. | P0 | Low | High | High |
| Keep workflow/live alignment for semantic reranking and parent-child flags. | P0 | Medium | High | High |
| Keep stored eval reports labeled as historical by backend mode and date. | P0 | Low | High | Medium |
| Keep current-path frontend references on `frontend-React` where this checkout is the target. | P1 | Medium | Medium | High for CI |
| Clarify Firestore Vector Search status: implemented and validated, not production default. | P1 | Low | High | High |
| Add an explicit "Phase 4 enabled but not 50-question evaluated" note. | P1 | Low | High | High |
| Preserve `/ask-rag-stream` event names and payload shapes. | P1 | Low | Medium | High |
| Keep "Intermediate RAG with several advanced RAG features implemented" as the public maturity label. | P1 | Low | High | Medium |

### Next Engineering Improvements

| Recommendation | Priority | Risk | Portfolio value | Production value |
| --- | --- | --- | --- | --- |
| Run the 50-question evaluator against the current Phase 4 live runtime in a controlled window, acknowledging it writes conversations/analytics. | P0 | Medium | High | High |
| Inspect the 20 to 21 failing eval cases from the 30/50 and 29/50 runs. | P1 | Low | High | High |
| Tune golden question required terms so they catch real regressions without overfitting phrasing. | P1 | Medium | Medium | High |
| Tune retrieval candidate pool, semantic rerank top N, and keep K using eval evidence. | P1 | Medium | High | High |
| Add a streaming evaluator or smoke suite that validates SSE `metadata`, `token`, `done`, `error`. | P1 | Medium | Medium | High |
| Add an internal dashboard for `rag_analytics` summary metrics. | P2 | Medium | High | Medium |
| Add alerting or periodic monitor for citation-validation block rate and no-answer rate. | P2 | Medium | Medium | High |
| Split tests by feature area before further `rag_service.py` extraction. | P2 | Low | Medium | Medium |
| Add context compression only after Phase 4 eval establishes the current baseline. | P2 | Medium | Medium | Medium |
| Add distributed rate limiting only if traffic or abuse patterns justify it. | P3 | Medium | Low | Medium |

### Advanced / Later

| Recommendation | Priority | Risk | Portfolio value | Production value |
| --- | --- | --- | --- | --- |
| Re-test Firestore Vector Search after retrieval tuning and source refresh. | P2 | Medium | High | High |
| Consider Vertex AI Vector Search only when corpus size and latency justify a managed ANN service beyond Firestore. | P3 | High | High | High at scale |
| Add specialist retrievers or a multi-source router only after current single-corpus eval is stable. | P3 | High | High | Medium |
| Add GraphRAG only when the content has meaningful entities/relationships that simple document retrieval misses. | P4 | High | High | Medium |
| Add Agentic RAG/tool calling only after safety, eval, and observability are stronger. | P4 | High | High | Medium |

## 9. What Not to Do Yet

- Do not claim "production-grade Advanced RAG" based on the current stored eval results.
- Do not make Firestore Vector Search the default until it equals or beats the local baseline.
- Do not add GraphRAG or Agentic RAG before fixing documentation drift and Phase 4 evaluation.
- Do not refactor SSE formatting casually; it is a frontend contract.
- Do not mix code-supported features with live-enabled features in documentation.
- Do not ingest stale eval reports or historical docs without labels that prevent outdated answers.
- Do not weaken the evaluator just to raise the pass rate. Fix source freshness, retrieval, or eval wording with evidence.
- Do not run Terraform apply/import/destroy as part of RAG improvement work.

## 10. Final Recommendation

Use this document as the current RAG source-of-truth baseline until the state docs are cleaned.

The next best step is not a new advanced feature. The next best step is to close the source-of-truth loop:

1. Update `GCP_RAG_PROJECT_STATE.md` so it matches live runtime and code.
2. Fix or intentionally document the deploy workflow drift for Phase 4 flags.
3. Run a controlled 50-question evaluation against the current Phase 4 runtime.
4. Use failing cases to tune retrieval and source content before adding GraphRAG, Agentic RAG, or another vector backend.

After that, the RAG system can be credibly presented as an intermediate RAG platform with real advanced capabilities, live production integration, and an honest roadmap toward stronger advanced RAG.

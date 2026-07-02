# RAG Evaluation Report

- Generated at: `2026-06-24T17:44:26.615932+00:00`
- Base URL: `https://gcp-rag-backend-189047029621.asia-east1.run.app`
- Questions: `evals/golden_questions.json`
- Soft fail: `True`

## Historical Context

- Date of run: `2026-06-24`
- Backend mode: local retrieval after source/documentation correction and reingestion.
- Result label: historical `30/50` local baseline.
- Current interpretation: this is the stored local baseline for comparison, but it predates the current Phase 4 semantic reranking plus parent-child live runtime.

## Summary

- Total cases: `50`
- Passed cases: `30`
- Failed cases: `20`
- Overall pass rate: `0.6`
- Source match rate: `1.0`
- Doc type match rate: `0.98`
- Required terms rate: `0.64`
- Forbidden terms rate: `0.98`
- Citation grounding rate: `0.9`
- No-answer accuracy: `0.86`
- Average latency ms: `3866.66`
- P95 latency ms: `8583.75`

## Thresholds

- Threshold pass: `False`
- Failed thresholds: `overall_pass_rate`
- min_overall_pass_rate: `0.8`
- min_source_match_rate: `0.75`
- min_citation_rate: `0.9`
- max_average_latency_ms: `12000.0`

## Failure Categories

- doc_type_mismatch: `1`
- forbidden_claim: `1`
- missing_citation: `5`
- missing_required_terms: `18`
- wrong_no_answer: `7`

## Results

### rag_arch_001 - FAIL

- Category: `architecture`
- Question: Why does the RAG backend use GCP Cloud Run?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer, doc_type_mismatch`
- Latency ms: `6385.33`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents. The retrieved context indicates that the RAG backend uses GCP Cloud Run for deployment and various functionalities, but it does not explicitly state the reasons for choosing Cloud Run [S1, S2, S3, S4, S5].

### rag_arch_002 - PASS

- Category: `architecture`
- Question: Describe the current GCP RAG backend stack.
- Failure reasons: ``
- Latency ms: `4786.43`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The current GCP RAG backend stack includes FastAPI, Cloud Run, Vertex AI Gemini API (specifically Gemini 2.5 Flash), and `text-embedding-005` for embeddings [S3, S2]. It utilizes Firestore for storing document chunks, embeddings, and persistent conversation hi...

### rag_arch_003 - PASS

- Category: `architecture`
- Question: What services make up the current AI assistant backend?
- Failure reasons: ``
- Latency ms: `9828.62`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The current AI assistant backend is composed of the following services: * FastAPI [S5] * Cloud Run [S5] * Vertex AI Gemini API [S5] * Gemini 2.5 Flash [S5] * `text-embedding-005` [S5] * Firestore for document chunks and embeddings [S5] * Google Cloud Storage f...

### rag_arch_004 - FAIL

- Category: `architecture`
- Question: What is the current maturity classification of the backend?
- Failure reasons: `missing_required_terms`
- Latency ms: `8725.97`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The current maturity classification of the backend is "Intermediate RAG with several advanced RAG features implemented" [S1].

### rag_retrieval_001 - FAIL

- Category: `retrieval`
- Question: How does current retrieval select relevant chunks?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer`
- Latency ms: `5405.9`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_retrieval_002 - PASS

- Category: `retrieval`
- Question: What is the biggest retrieval scalability limitation right now?
- Failure reasons: ``
- Latency ms: `3346.65`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The biggest retrieval scalability limitation is that retrieval still scans Firestore in memory [S2, S3]. The current system calculates cosine similarity locally by scanning Firestore `document_chunks` in memory [S1]. This prevents it from being a fully product...

### rag_retrieval_003 - PASS

- Category: `retrieval`
- Question: Is managed vector retrieval implemented today?
- Failure reasons: ``
- Latency ms: `3410.43`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

No, managed vector retrieval is not implemented today [S2, S3]. The current system still scans Firestore in memory [S2, S3]. A managed vector index, such as Firestore Vector Search or Vertex AI Vector Search, is planned for Phase 4 of the Advanced RAG Roadmap...

### rag_retrieval_004 - PASS

- Category: `retrieval`
- Question: What hybrid retrieval capability exists today?
- Failure reasons: ``
- Latency ms: `2150.83`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The current system includes optional hybrid keyword + vector retrieval, which can be enabled using `RAG_HYBRID_ENABLED` and `RAG_VECTOR_SCORE_WEIGHT` [S3]. This feature is disabled by default to maintain the current Cloud Run behavior [S3]. Retrieval now uses...

### rag_ingest_001 - FAIL

- Category: `ingestion`
- Question: How does document ingestion work?
- Failure reasons: `missing_required_terms`
- Latency ms: `3378.62`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Document ingestion is handled by the `ingestion_service.py` within the `backend-GCP/app/services/` directory [S1]. The `/ingest-docs` endpoint is protected by an `X-Admin-Token` header, which is backed by `INGESTION_ADMIN_TOKEN`, making ingestion an admin-only...

### rag_ingest_002 - FAIL

- Category: `ingestion`
- Question: What makes ingestion idempotent?
- Failure reasons: `missing_required_terms`
- Latency ms: `7985.67`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Ingestion is made idempotent by using deterministic Firestore chunk document IDs and pruning stale duplicate chunk documents after successful file ingestion, which makes the `/ingest-docs` endpoint rerunnable [S5].

### rag_ingest_003 - PASS

- Category: `ingestion`
- Question: How is the ingestion endpoint protected?
- Failure reasons: ``
- Latency ms: `3686.67`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The ingestion endpoint, `POST /ingest-docs`, is protected by an `X-Admin-Token` header [S1], [S3]. This token is backed by `INGESTION_ADMIN_TOKEN`, which is passed from GitHub secrets into Cloud Run during deployment [S2], [S3]. If the token is missing, incorr...

### rag_metadata_001 - PASS

- Category: `metadata`
- Question: What metadata fields are stored for chunks after Phase 1 hardening?
- Failure reasons: ``
- Latency ms: `4588.6`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

After Phase 1 hardening, new ingestion writes the following metadata fields for `document_chunks`: `project`, `doc_type`, `section_path`, `source_uri`, `version_id`, `file_name`, `heading`, `chunk_index`, `content_hash`, `char_count`, and `updated_at` [S2].

### rag_metadata_002 - PASS

- Category: `metadata`
- Question: Which metadata filters are supported?
- Failure reasons: ``
- Latency ms: `2958.12`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The system supports metadata filtering by `file_name` and `heading` [S1, S5]. Additionally, `/ask-rag` and `/ask-rag-stream` can filter by exact `project`, `doc_type`, `file_name`, and `version_id`, as well as case-insensitive substring matching for `heading`,...

### rag_metadata_003 - PASS

- Category: `metadata`
- Question: What happens if metadata filtering removes every chunk?
- Failure reasons: ``
- Latency ms: `2283.25`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

If metadata filtering removes every chunk, the existing safe no-answer behavior is preserved [S2].

### rag_rewrite_001 - PASS

- Category: `query_rewrite`
- Question: How does query rewriting handle follow-up questions?
- Failure reasons: ``
- Latency ms: `3939.81`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

Query rewriting handles follow-up questions by turning them into standalone retrieval queries [S2, S5]. This process uses recent user/assistant conversation history to transform vague follow-up questions before embedding, hybrid scoring, and reranking [S5]. Th...

### rag_rewrite_002 - FAIL

- Category: `query_rewrite`
- Question: What happens if query rewriting fails?
- Failure reasons: `missing_required_terms, wrong_no_answer`
- Latency ms: `3247.85`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents. The provided context describes query rewriting as an opt-in feature where rewritten or expanded queries are used for retrieval, and the final answer prompt remains anchored to the original user question [S1...

### rag_multi_001 - FAIL

- Category: `multi_query`
- Question: What does multi-query retrieval do?
- Failure reasons: `missing_required_terms`
- Latency ms: `2986.65`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Multi-query retrieval generates several search variants and merges results [S2]. When enabled, it asks Gemini for alternate retrieval queries, embeds the original query plus variants, scores each Firestore chunk across the query set, keeps the best score per `...

### rag_multi_002 - FAIL

- Category: `multi_query`
- Question: How does multi-query retrieval handle generation failure?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer`
- Latency ms: `5832.86`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_citation_001 - PASS

- Category: `citation_validation`
- Question: How are generated answers grounded to returned sources?
- Failure reasons: ``
- Latency ms: `4268.25`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

Generated answers are grounded to returned sources through several mechanisms: 1. The grounded answer prompt requires source ID citations for factual claims [S3]. Stricter prompt instructions require citation labels, such as `[S1]`, for factual claims [S4]. 2....

### rag_citation_002 - FAIL

- Category: `citation_validation`
- Question: What happens to answers without valid source citations?
- Failure reasons: `missing_required_terms`
- Latency ms: `3070.4`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

If Gemini returns an answer that does not cite at least one valid returned source ID, or cites unavailable source IDs, the backend replaces the answer with a safe no-answer response before saving the assistant message [S1]. This process is part of runtime cita...

### rag_rate_001 - FAIL

- Category: `rate_limiting`
- Question: Which public RAG endpoints have rate limiting?
- Failure reasons: `missing_required_terms`
- Latency ms: `1807.32`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Public RAG endpoints have a lightweight in-memory rate limiter controlled by `RAG_RATE_LIMIT_ENABLED`, `RAG_RATE_LIMIT_REQUESTS`, and `RAG_RATE_LIMIT_WINDOW_SECONDS` [S1]. The current deployment workflow sets these to `true`, `20` requests, and `60` seconds, r...

### rag_rate_002 - PASS

- Category: `rate_limiting`
- Question: Is the current rate limiter distributed production quota enforcement?
- Failure reasons: ``
- Latency ms: `1600.39`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

No, the current rate limiter is a Phase 1 abuse-control measure and not a distributed production quota system [S1]. It is a lightweight in-memory limiter for public RAG endpoints [S1].

### rag_memory_001 - PASS

- Category: `firestore_memory`
- Question: Where is conversation memory persisted?
- Failure reasons: ``
- Latency ms: `3941.35`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

Conversation memory is persisted in Firestore under `conversations/{session_id}/messages/{message_id}` by the GCP backend [S1]. The persistent chat history feature was deployed to Cloud Run [S3] and is part of Phase 10 of the project development [S4]. The arch...

### rag_memory_002 - PASS

- Category: `firestore_memory`
- Question: Are query rewrite audit messages shown to users?
- Failure reasons: ``
- Latency ms: `2479.23`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

No, Firestore system audit messages for query rewriting are backend-only and filtered out of user/assistant conversation context [S1]. Rewritten retrieval queries are stored only as backend system audit messages in Firestore [S2].

### rag_sse_001 - FAIL

- Category: `sse_streaming`
- Question: What SSE events does the streaming RAG endpoint return?
- Failure reasons: `missing_required_terms`
- Latency ms: `1842.96`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The streaming RAG endpoint (`POST /ask-rag-stream`) streams source metadata first, then answer tokens, and finally a completion event [S1].

### rag_sse_002 - FAIL

- Category: `sse_streaming`
- Question: Does the streaming path still validate citations before returning text?
- Failure reasons: `missing_required_terms`
- Latency ms: `2039.02`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Yes, the streaming path validates the completed generated answer before emitting final Server-Sent Events (SSE) token chunks [S4]. This prevents the frontend from displaying unsupported factual text [S4].

### rag_analytics_001 - FAIL

- Category: `rag_analytics`
- Question: What RAG analytics are recorded?
- Failure reasons: `forbidden_claim`
- Latency ms: `4261.77`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": false, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

RAG analytics records track request/session metadata, response mode, latency, source count, source file names, max score, no-answer status, citation-validation block status, query rewrite usage, retrieval query count, multi-query setting, and metadata-filter u...

### rag_analytics_002 - PASS

- Category: `rag_analytics`
- Question: How is the analytics summary endpoint protected?
- Failure reasons: ``
- Latency ms: `2163.08`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The analytics summary endpoint, `GET /rag-analytics/summary`, is protected by an `X-Admin-Token` header, which is backed by `INGESTION_ADMIN_TOKEN` [S2]. This is the same guard used for ingestion [S2].

### aws_counter_001 - PASS

- Category: `aws_visitor_counter`
- Question: What services are used by the AWS visitor counter path?
- Failure reasons: ``
- Latency ms: `1680.56`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The AWS visitor counter path uses the following services: * S3 static hosting [S1] * CloudFront CDN + HTTPS [S1] * API Gateway [S1] * Lambda [S1] * DynamoDB [S1]

### aws_counter_002 - FAIL

- Category: `aws_visitor_counter`
- Question: Is the AWS visitor counter currently rebuilt in the new AWS account?
- Failure reasons: `missing_required_terms`
- Latency ms: `3857.9`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

No, the AWS visitor counter was not rebuilt in a new AWS account. Its behavior [S1], code, and deployment workflows were not modified [S4, S5]. The AWS visitor counter behavior remains unchanged [S3].

### cloud_run_001 - FAIL

- Category: `cloud_run`
- Question: What backend service hosts the FastAPI RAG app?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer`
- Latency ms: `2905.64`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### cloud_run_002 - PASS

- Category: `cloud_run`
- Question: What runtime health checks exist for the backend?
- Failure reasons: ``
- Latency ms: `2443.11`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The backend has a health check route, as indicated by `app/routes/health.py` in the backend structure [S3]. During a live RAG evaluation, `GET /` returned HTTP `200`, which was used as the documented Cloud Run root URL for health status, although `GET /healthz...

### vertex_001 - FAIL

- Category: `vertex_ai`
- Question: Which Vertex AI model generates answers?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer`
- Latency ms: `1896.8`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### vertex_002 - PASS

- Category: `vertex_ai`
- Question: Which embedding model is used by the current RAG backend?
- Failure reasons: ``
- Latency ms: `2025.27`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The current RAG backend uses the `text-embedding-005` model [S1].

### limits_001 - PASS

- Category: `limitations`
- Question: What still prevents this system from being production-grade Advanced RAG?
- Failure reasons: ``
- Latency ms: `3160.67`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The system is not yet fully production-grade Advanced RAG because retrieval still scans Firestore in memory, and it does not yet include a managed vector index, a real semantic reranker, a monitoring/analytics dashboard, GraphRAG, or Agentic RAG [S1].

### limits_002 - PASS

- Category: `limitations`
- Question: Is GraphRAG implemented in this backend?
- Failure reasons: ``
- Latency ms: `3051.91`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

No, GraphRAG is not yet implemented in this backend [S1, S3]. It is considered an optional Phase 5 Advanced RAG pattern that should come later, as it is more complex than needed for the current portfolio stage [S5]. The current system does not include GraphRAG...

### limits_003 - PASS

- Category: `limitations`
- Question: Is Agentic RAG implemented in this backend?
- Failure reasons: ``
- Latency ms: `8583.75`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

No, Agentic RAG is not yet implemented in this backend [S1]. The system does not yet include Agentic RAG [S1].

### limits_004 - PASS

- Category: `limitations`
- Question: Is semantic reranking implemented today?
- Failure reasons: ``
- Latency ms: `2582.84`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

No, a real semantic reranker is not yet implemented [S1, S4]. The system currently includes optional heuristic reranking [S4] and opt-in deterministic reranking [S3].

### no_answer_001 - PASS

- Category: `no_answer`
- Question: What is Jarrett's private bank account number?
- Failure reasons: ``
- Latency ms: `8027.86`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: ``
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### no_answer_002 - PASS

- Category: `no_answer`
- Question: What is the exact salary for the next job offer?
- Failure reasons: ``
- Latency ms: `2222.32`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: ``
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### no_answer_003 - FAIL

- Category: `no_answer`
- Question: Which unreleased internal company roadmap is Jarrett following?
- Failure reasons: `wrong_no_answer`
- Latency ms: `3701.51`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: ``
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": true, "source_match": true}`

Answer excerpt:

Jarrett is following the "Advanced RAG Roadmap — Phase 1 to Phase 5" [S2]. This roadmap outlines improvements across several phases, including Retrieval Quality Quick Wins, Better Retrieval Logic, Evaluation and Observability, Managed Vector Retrieval, and Adv...

### no_answer_004 - PASS

- Category: `no_answer`
- Question: What is the password for the GCP service account?
- Failure reasons: ``
- Latency ms: `2796.61`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: ``
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### no_answer_005 - PASS

- Category: `no_answer`
- Question: What production customer data is stored in this portfolio?
- Failure reasons: ``
- Latency ms: `5565.03`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: ``
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

Based on the indexed project documents, the portfolio stores persistent conversation history for the RAG assistant in Firestore under `conversations/{session_id}/messages/{message_id}` [S3]. It also stores rewritten retrieval queries as backend system audit me...

### rag_eval_001 - FAIL

- Category: `retrieval`
- Question: What does the RAG evaluation script validate?
- Failure reasons: `missing_required_terms`
- Latency ms: `2155.41`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The RAG evaluation script validates several aspects of the RAG system [S1]. It tracks pass/fail failure categories, measures average and p95 latency, and enforces configurable thresholds for overall pass rate, source match rate, citation grounding rate, and av...

### rag_eval_002 - PASS

- Category: `limitations`
- Question: What should be the next RAG architecture upgrade after evaluation?
- Failure reasons: ``
- Latency ms: `2257.45`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

After evaluation and observability, the next RAG architecture upgrade should be Managed Vector Retrieval [S1]. This phase involves replacing the current in-memory Firestore scanning with a production-style managed vector index, such as Firestore Vector Search...

### rag_security_001 - PASS

- Category: `rate_limiting`
- Question: What public endpoint protection was added in Phase 1?
- Failure reasons: ``
- Latency ms: `3794.04`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

In Phase 1, a lightweight in-memory rate limiter was added for public RAG endpoints as an abuse-control measure. This limiter is controlled by `RAG_RATE_LIMIT_ENABLED`, `RAG_RATE_LIMIT_REQUESTS`, and `RAG_RATE_LIMIT_WINDOW_SECONDS` [S2].

### rag_logs_001 - FAIL

- Category: `architecture`
- Question: What logging improvements exist for Cloud Run operations?
- Failure reasons: `missing_required_terms`
- Latency ms: `6949.22`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

For Cloud Run operations, logging improvements include JSON-formatted Cloud Run logs, request IDs, request duration logs, controlled error logs, and metadata-only service logs for Gemini, GCS, Firestore, ingestion, and RAG flow [S2].

### rag_error_001 - PASS

- Category: `limitations`
- Question: How does the backend handle unsupported answers?
- Failure reasons: ``
- Latency ms: `2370.53`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The backend handles unsupported answers through runtime citation validation [S1, S2]. If the Gemini model generates an answer that does not cite at least one valid returned source ID, or cites unavailable source IDs, the backend replaces the answer with a safe...

### rag_docs_001 - FAIL

- Category: `ingestion`
- Question: What kind of source documents are ingested for the RAG assistant?
- Failure reasons: `missing_required_terms`
- Latency ms: `4593.48`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The RAG assistant ingests documents that are processed with Markdown-aware chunking, respecting Markdown section and paragraph boundaries [S3]. The system generally refers to ingesting "files" and "docs" [S3, S5].

### rag_ci_001 - PASS

- Category: `rag_analytics`
- Question: How does CI currently use RAG evaluation?
- Failure reasons: ``
- Latency ms: `4309.18`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

CI currently uses RAG evaluation by running the evaluator script (`backend-GCP/scripts/evaluate_rag.py`) as part of the `.github/workflows/deploy-backend-gcp.yml` workflow [S1]. Specifically, the CI workflow: * Installs backend dependencies [S1]. * Runs backen...

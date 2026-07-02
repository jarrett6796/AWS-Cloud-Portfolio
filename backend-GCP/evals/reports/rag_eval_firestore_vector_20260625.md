# RAG Evaluation Report

- Generated at: `2026-06-25T07:49:37.434129+00:00`
- Base URL: `https://gcp-rag-backend-189047029621.asia-east1.run.app`
- Questions: `evals/golden_questions.json`
- Soft fail: `True`

## Historical Context

- Date of run: `2026-06-25`
- Backend mode: `firestore_vector` retrieval.
- Result label: historical `29/50` Firestore Vector Search run.
- Current interpretation: vector mode was validated but underperformed the 30/50 local baseline, so production remained on `local`. This is not evidence for the current Phase 4 local runtime with semantic reranking and parent-child enabled.

## Summary

- Total cases: `50`
- Passed cases: `29`
- Failed cases: `21`
- Overall pass rate: `0.58`
- Source match rate: `1.0`
- Doc type match rate: `0.98`
- Required terms rate: `0.64`
- Forbidden terms rate: `0.96`
- Citation grounding rate: `0.92`
- No-answer accuracy: `0.86`
- Average latency ms: `3349.39`
- P95 latency ms: `5974.65`

## Thresholds

- Threshold pass: `False`
- Failed thresholds: `overall_pass_rate`
- min_overall_pass_rate: `0.8`
- min_source_match_rate: `0.75`
- min_citation_rate: `0.9`
- max_average_latency_ms: `12000.0`

## Failure Categories

- doc_type_mismatch: `1`
- forbidden_claim: `2`
- missing_citation: `4`
- missing_required_terms: `18`
- wrong_no_answer: `7`

## Results

### rag_arch_001 - FAIL

- Category: `architecture`
- Question: Why does the RAG backend use GCP Cloud Run?
- Failure reasons: `wrong_no_answer, doc_type_mismatch`
- Latency ms: `7741.02`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": true, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents. The retrieved context indicates that the RAG backend is deployed to GCP Cloud Run [S1, S2, S3, S5] and uses Cloud Run FastAPI [S4], but it does not explicitly state the reasons for choosing Cloud Run.

### rag_arch_002 - PASS

- Category: `architecture`
- Question: Describe the current GCP RAG backend stack.
- Failure reasons: ``
- Latency ms: `1871.53`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The current GCP RAG backend stack includes [S3]: * FastAPI * Cloud Run * Vertex AI Gemini API * Gemini 2.5 Flash * `text-embedding-005` * Firestore for document chunks and embeddings * Google Cloud Storage for document source files

### rag_arch_003 - PASS

- Category: `architecture`
- Question: What services make up the current AI assistant backend?
- Failure reasons: ``
- Latency ms: `4378.95`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The current AI assistant backend is composed of the following services: * FastAPI [S5] * Cloud Run [S5] * Vertex AI Gemini API, specifically Gemini 2.5 Flash for generation and `text-embedding-005` for embeddings [S5], [S4] * Firestore for document chunks, emb...

### rag_arch_004 - FAIL

- Category: `architecture`
- Question: What is the current maturity classification of the backend?
- Failure reasons: `missing_required_terms`
- Latency ms: `1664.74`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The current maturity classification of the backend is "Intermediate RAG with several advanced RAG features implemented" [S1].

### rag_retrieval_001 - FAIL

- Category: `retrieval`
- Question: How does current retrieval select relevant chunks?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer`
- Latency ms: `5934.3`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_retrieval_002 - PASS

- Category: `retrieval`
- Question: What is the biggest retrieval scalability limitation right now?
- Failure reasons: ``
- Latency ms: `3684.69`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The biggest retrieval scalability limitation is that retrieval still scans Firestore in memory [S2, S3]. The current system calculates cosine similarity locally by scanning Firestore `document_chunks` in memory [S1]. This prevents it from being fully productio...

### rag_retrieval_003 - PASS

- Category: `retrieval`
- Question: Is managed vector retrieval implemented today?
- Failure reasons: ``
- Latency ms: `3402.14`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

No, managed vector retrieval is not implemented today [S2, S3]. The current system still scans Firestore in memory for retrieval [S1, S2, S3]. A production-style system would use a managed vector index like Firestore Vector Search or Vertex AI Vector Search, w...

### rag_retrieval_004 - PASS

- Category: `retrieval`
- Question: What hybrid retrieval capability exists today?
- Failure reasons: ``
- Latency ms: `1982.62`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The current system includes optional hybrid keyword + vector retrieval, which can be enabled using `RAG_HYBRID_ENABLED` and `RAG_VECTOR_SCORE_WEIGHT` [S3]. This feature is disabled by default to maintain the current Cloud Run behavior [S3].

### rag_ingest_001 - FAIL

- Category: `ingestion`
- Question: How does document ingestion work?
- Failure reasons: `missing_required_terms`
- Latency ms: `5974.65`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Document ingestion is handled by `backend-GCP/app/services/ingestion_service.py` [S1], [S4]. The `/ingest-docs` endpoint is protected by an `X-Admin-Token` header, making it admin-only [S1], [S4]. Key aspects of document ingestion include: * It uses determinis...

### rag_ingest_002 - FAIL

- Category: `ingestion`
- Question: What makes ingestion idempotent?
- Failure reasons: `missing_required_terms`
- Latency ms: `2101.37`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Ingestion is made idempotent by using deterministic Firestore chunk document IDs and pruning stale duplicate chunk documents after successful file ingestion, which makes `/ingest-docs` rerunnable [S5].

### rag_ingest_003 - PASS

- Category: `ingestion`
- Question: How is the ingestion endpoint protected?
- Failure reasons: ``
- Latency ms: `3432.67`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The ingestion endpoint, `POST /ingest-docs`, is protected by an `X-Admin-Token` header [S1], [S3]. This token is backed by `INGESTION_ADMIN_TOKEN` [S1]. The deployment workflow passes `INGESTION_ADMIN_TOKEN` from GitHub secrets into Cloud Run [S2], [S3]. If th...

### rag_metadata_001 - PASS

- Category: `metadata`
- Question: What metadata fields are stored for chunks after Phase 1 hardening?
- Failure reasons: ``
- Latency ms: `4111.64`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

After Phase 1 hardening, new ingestion writes the following metadata fields for `document_chunks`: `project`, `doc_type`, `section_path`, `source_uri`, `version_id`, `file_name`, `heading`, `chunk_index`, `content_hash`, `char_count`, and `updated_at` [S2].

### rag_metadata_002 - PASS

- Category: `metadata`
- Question: Which metadata filters are supported?
- Failure reasons: ``
- Latency ms: `3312.26`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The supported metadata filters include `file_name`, `heading`, `project`, `doc_type`, `version_id`, `section_path`, and `source_uri` [S2]. Specifically: * `file_name` and `heading` are accepted fields in the `metadata_filter` object [S1]. * `/ask-rag` and `/as...

### rag_metadata_003 - PASS

- Category: `metadata`
- Question: What happens if metadata filtering removes every chunk?
- Failure reasons: ``
- Latency ms: `2122.48`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

If metadata filters remove every chunk, the existing safe no-answer behavior is preserved [S2].

### rag_rewrite_001 - PASS

- Category: `query_rewrite`
- Question: How does query rewriting handle follow-up questions?
- Failure reasons: ``
- Latency ms: `3735.85`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

Query rewriting handles follow-up questions by transforming them into standalone retrieval queries [S2, S5]. This process uses recent user/assistant conversation history to make vague follow-up questions more explicit for retrieval [S5]. The rewritten or expan...

### rag_rewrite_002 - FAIL

- Category: `query_rewrite`
- Question: What happens if query rewriting fails?
- Failure reasons: `missing_required_terms, wrong_no_answer`
- Latency ms: `3588.24`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents. The provided context describes query rewriting as an opt-in feature used for retrieval, where the final answer prompt remains anchored to the original user question [S1]. It also mentions that query rewriti...

### rag_multi_001 - FAIL

- Category: `multi_query`
- Question: What does multi-query retrieval do?
- Failure reasons: `missing_required_terms`
- Latency ms: `2841.98`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Multi-query retrieval generates several search variants from the original query, embeds the original query plus its variants, and then scores each Firestore chunk across this set of queries [S1, S2]. It keeps the best score per file name and chunk index, and t...

### rag_multi_002 - FAIL

- Category: `multi_query`
- Question: How does multi-query retrieval handle generation failure?
- Failure reasons: `missing_required_terms, wrong_no_answer`
- Latency ms: `5658.95`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

The provided context does not specifically detail how multi-query retrieval handles generation failure. However, the system has a general mechanism for handling situations where an answer cannot be generated [S1, S3, S4]. If retrieval returns no selected chunk...

### rag_citation_001 - PASS

- Category: `citation_validation`
- Question: How are generated answers grounded to returned sources?
- Failure reasons: ``
- Latency ms: `5038.7`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

Generated answers are grounded to returned sources through several mechanisms: 1. **Prompt Instructions** The grounded answer prompt requires source ID citations for factual claims [S3]. Stricter prompt instructions require citation labels, such as `[S1]`, for...

### rag_citation_002 - FAIL

- Category: `citation_validation`
- Question: What happens to answers without valid source citations?
- Failure reasons: `missing_required_terms`
- Latency ms: `2548.84`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

If Gemini returns an answer that does not cite at least one valid returned source ID, or cites unavailable source IDs, the backend replaces the answer with a safe no-answer response before saving the assistant message [S1]. This runtime citation validation als...

### rag_rate_001 - FAIL

- Category: `rate_limiting`
- Question: Which public RAG endpoints have rate limiting?
- Failure reasons: `missing_required_terms`
- Latency ms: `1950.31`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

A lightweight in-memory limiter is controlled by `RAG_RATE_LIMIT_ENABLED`, `RAG_RATE_LIMIT_REQUESTS`, and `RAG_RATE_LIMIT_WINDOW_SECONDS` for public RAG endpoints [S1].

### rag_rate_002 - PASS

- Category: `rate_limiting`
- Question: Is the current rate limiter distributed production quota enforcement?
- Failure reasons: ``
- Latency ms: `1739.99`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

No, the current rate limiter is not a distributed production quota system [S1]. It is described as a Phase 1 abuse-control measure, using a lightweight in-memory limiter for public RAG endpoints [S1].

### rag_memory_001 - PASS

- Category: `firestore_memory`
- Question: Where is conversation memory persisted?
- Failure reasons: ``
- Latency ms: `2616.73`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

Conversation memory is persisted in Firestore [S1, S2, S3, S4]. Specifically, the GCP backend stores persistent conversation history in Firestore under `conversations/{session_id}/messages/{message_id}` [S1].

### rag_memory_002 - PASS

- Category: `firestore_memory`
- Question: Are query rewrite audit messages shown to users?
- Failure reasons: ``
- Latency ms: `2559.15`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

No, query rewrite audit messages are backend-only and are filtered out of user/assistant conversation context [S1]. They are stored as backend system audit messages in Firestore and are not shown in the frontend UI [S2].

### rag_sse_001 - FAIL

- Category: `sse_streaming`
- Question: What SSE events does the streaming RAG endpoint return?
- Failure reasons: `missing_required_terms`
- Latency ms: `1841.58`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The streaming RAG endpoint (`POST /ask-rag-stream`) streams source metadata first, then answer tokens, and finally a completion event [S1].

### rag_sse_002 - FAIL

- Category: `sse_streaming`
- Question: Does the streaming path still validate citations before returning text?
- Failure reasons: `missing_required_terms`
- Latency ms: `1899.65`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Yes, the streaming path validates the completed generated answer before emitting final SSE token chunks [S4]. This ensures the frontend does not display unsupported factual text [S4].

### rag_analytics_001 - FAIL

- Category: `rag_analytics`
- Question: What RAG analytics are recorded?
- Failure reasons: `forbidden_claim`
- Latency ms: `12131.51`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": false, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

Metadata-only RAG analytics records track request/session metadata, response mode, latency, source count, source file names, max score, no-answer status, citation-validation block status, query rewrite usage, retrieval query count, multi-query setting, and met...

### rag_analytics_002 - PASS

- Category: `rag_analytics`
- Question: How is the analytics summary endpoint protected?
- Failure reasons: ``
- Latency ms: `2277.51`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The analytics summary endpoint, `GET /rag-analytics/summary`, is protected by an `X-Admin-Token` and the `INGESTION_ADMIN_TOKEN` guard, which is the same protection used for ingestion [S2].

### aws_counter_001 - PASS

- Category: `aws_visitor_counter`
- Question: What services are used by the AWS visitor counter path?
- Failure reasons: ``
- Latency ms: `1714.86`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The AWS visitor counter path uses the following services: * S3 static hosting [S1] * CloudFront CDN + HTTPS [S1] * API Gateway [S1] * Lambda [S1] * DynamoDB [S1]

### aws_counter_002 - FAIL

- Category: `aws_visitor_counter`
- Question: Is the AWS visitor counter currently rebuilt in the new AWS account?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer`
- Latency ms: `4120.8`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### cloud_run_001 - PASS

- Category: `cloud_run`
- Question: What backend service hosts the FastAPI RAG app?
- Failure reasons: ``
- Latency ms: `2686.1`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The FastAPI RAG app is hosted on Google Cloud Run [S3, S4]. The live backend URL is `https://gcp-rag-backend-189047029621.asia-east1.run.app` [S1].

### cloud_run_002 - FAIL

- Category: `cloud_run`
- Question: What runtime health checks exist for the backend?
- Failure reasons: `missing_required_terms`
- Latency ms: `2536.94`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The backend uses `GET /` as a runtime health check, which returned HTTP `200` during a live RAG evaluation [S1]. The backend structure also includes a `health.py` route within `app/routes/` [S3].

### vertex_001 - PASS

- Category: `vertex_ai`
- Question: Which Vertex AI model generates answers?
- Failure reasons: ``
- Latency ms: `2251.92`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The Vertex AI model that generates answers is Gemini 2.5 Flash [S1], [S2].

### vertex_002 - PASS

- Category: `vertex_ai`
- Question: Which embedding model is used by the current RAG backend?
- Failure reasons: ``
- Latency ms: `1821.5`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The current RAG backend uses `text-embedding-005` [S1].

### limits_001 - PASS

- Category: `limitations`
- Question: What still prevents this system from being production-grade Advanced RAG?
- Failure reasons: ``
- Latency ms: `2448.82`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The system is not yet fully production-grade Advanced RAG because [S1]: * Retrieval still scans Firestore in memory [S1]. * It does not yet include a managed vector index [S1]. * It does not yet include a real semantic reranker [S1]. * It does not yet include...

### limits_002 - FAIL

- Category: `limitations`
- Question: Is GraphRAG implemented in this backend?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer`
- Latency ms: `2992.19`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### limits_003 - PASS

- Category: `limitations`
- Question: Is Agentic RAG implemented in this backend?
- Failure reasons: ``
- Latency ms: `2000.37`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

No, Agentic RAG is not yet implemented in this backend [S1]. The system does not yet include Agentic RAG [S1].

### limits_004 - FAIL

- Category: `limitations`
- Question: Is semantic reranking implemented today?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer`
- Latency ms: `3094.29`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### no_answer_001 - PASS

- Category: `no_answer`
- Question: What is Jarrett's private bank account number?
- Failure reasons: ``
- Latency ms: `2469.51`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: ``
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### no_answer_002 - PASS

- Category: `no_answer`
- Question: What is the exact salary for the next job offer?
- Failure reasons: ``
- Latency ms: `2210.19`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: ``
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### no_answer_003 - FAIL

- Category: `no_answer`
- Question: Which unreleased internal company roadmap is Jarrett following?
- Failure reasons: `forbidden_claim`
- Latency ms: `3054.03`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: ``
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": false, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents. The provided context details an "Advanced RAG Roadmap — Phase 1 to Phase 5" [S2] and a "Recommended Next Implementation Order" [S1] for Jarrett's project, but does not refer to an "unreleased internal compa...

### no_answer_004 - PASS

- Category: `no_answer`
- Question: What is the password for the GCP service account?
- Failure reasons: ``
- Latency ms: `3094.91`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: ``
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### no_answer_005 - PASS

- Category: `no_answer`
- Question: What production customer data is stored in this portfolio?
- Failure reasons: ``
- Latency ms: `5080.11`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: ``
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

Based on the indexed project documents, there is no mention of "production customer data" being stored in this portfolio. The portfolio stores visitor count data [S2] and persistent conversation history for the AI assistant in Firestore [S4].

### rag_eval_001 - FAIL

- Category: `retrieval`
- Question: What does the RAG evaluation script validate?
- Failure reasons: `missing_required_terms`
- Latency ms: `3635.35`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The RAG evaluation script (`backend-GCP/scripts/evaluate_rag.py`) validates various aspects of the RAG system [S1, S2]. It tracks and enforces configurable thresholds for: * Overall pass rate [S1] * Source match rate [S1] * Citation grounding rate [S1] * Avera...

### rag_eval_002 - PASS

- Category: `limitations`
- Question: What should be the next RAG architecture upgrade after evaluation?
- Failure reasons: ``
- Latency ms: `3480.54`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

After evaluation, the next RAG architecture upgrade should be Managed Vector Retrieval [S1, S3]. This involves replacing the current in-memory Firestore scanning with a production-style managed vector index, such as Firestore Vector Search or Vertex AI Vector...

### rag_security_001 - PASS

- Category: `rate_limiting`
- Question: What public endpoint protection was added in Phase 1?
- Failure reasons: ``
- Latency ms: `4001.44`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

In Phase 1, a lightweight in-memory rate limiter was added for public RAG endpoints as an abuse-control measure. This is controlled by `RAG_RATE_LIMIT_ENABLED`, `RAG_RATE_LIMIT_REQUESTS`, and `RAG_RATE_LIMIT_WINDOW_SECONDS` [S2].

### rag_logs_001 - FAIL

- Category: `architecture`
- Question: What logging improvements exist for Cloud Run operations?
- Failure reasons: `missing_required_terms`
- Latency ms: `2733.78`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

For Cloud Run operations, logging improvements include the addition of JSON-formatted Cloud Run logs, request IDs, request duration logs, controlled error logs, and metadata-only service logs for Gemini, GCS, Firestore, ingestion, and RAG flow [S2].

### rag_error_001 - PASS

- Category: `limitations`
- Question: How does the backend handle unsupported answers?
- Failure reasons: ``
- Latency ms: `2634.27`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The backend handles unsupported answers through runtime citation validation [S1, S2]. If the Gemini model returns an answer that does not cite at least one valid returned source ID, or cites unavailable source IDs, the backend replaces the answer with a safe n...

### rag_docs_001 - FAIL

- Category: `ingestion`
- Question: What kind of source documents are ingested for the RAG assistant?
- Failure reasons: `missing_required_terms`
- Latency ms: `3313.06`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The RAG assistant ingests source documents that are processed using Markdown-aware chunking, respecting Markdown headings and paragraph boundaries [S1, S3]. Ingestion uses deterministic Firestore chunk IDs and prunes stale duplicate chunk documents [S1, S3]. T...

### rag_ci_001 - PASS

- Category: `rag_analytics`
- Question: How does CI currently use RAG evaluation?
- Failure reasons: ``
- Latency ms: `3950.32`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

CI currently uses RAG evaluation by running the `evaluate_rag.py` script as part of the `.github/workflows/deploy-backend-gcp.yml` workflow [S1]. This workflow installs backend dependencies, runs unit tests, compiles Python files, deploys the backend to Cloud...

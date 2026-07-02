# RAG Evaluation Report

- Generated at: `2026-06-24T16:44:41.894301+00:00`
- Base URL: `https://gcp-rag-backend-189047029621.asia-east1.run.app`
- Questions: `evals/golden_questions.json`
- Soft fail: `True`

## Historical Context

- Date of run: `2026-06-24`
- Backend mode: early live local retrieval against stale deployed source/index content.
- Result label: historical `4/50` stale-source baseline only.
- Current interpretation: this predates the post-audit source refresh and predates the Phase 4 semantic reranking plus parent-child live runtime. Do not treat it as current quality evidence.

## Summary

- Total cases: `50`
- Passed cases: `4`
- Failed cases: `46`
- Overall pass rate: `0.08`
- Source match rate: `1.0`
- Required terms rate: `0.28`
- Forbidden terms rate: `0.98`
- Citation grounding rate: `0.6`
- No-answer accuracy: `0.46`
- Average latency ms: `3268.07`
- P95 latency ms: `5823.98`

## Thresholds

- Threshold pass: `False`
- Failed thresholds: `overall_pass_rate, citation_grounding_rate`
- min_overall_pass_rate: `0.8`
- min_source_match_rate: `0.75`
- min_citation_rate: `0.9`
- max_average_latency_ms: `12000.0`

## Failure Categories

- forbidden_claim: `1`
- missing_citation: `20`
- missing_required_terms: `36`
- source_mismatch: `45`
- wrong_no_answer: `27`

## Results

### rag_arch_001 - FAIL

- Category: `architecture`
- Question: Why does the RAG backend use GCP Cloud Run?
- Failure reasons: `missing_required_terms, source_mismatch`
- Latency ms: `4737.1`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The AI/RAG backend was intentionally pivoted to Google Cloud Platform because the AWS Lambda/Bedrock RAG architecture was not practical to complete at the current stage [S3]. The RAG backend currently uses GCP Cloud Run [S2, S5].

### rag_arch_002 - FAIL

- Category: `architecture`
- Question: Describe the current GCP RAG backend stack.
- Failure reasons: `source_mismatch`
- Latency ms: `5646.61`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The current GCP RAG backend stack is built on Google Cloud Platform (GCP) and uses a FastAPI backend deployed on GCP Cloud Run [S4], [S5]. It leverages Firestore for retrieval and Gemini for response generation [S4], [S5]. The backend also integrates with GCS...

### rag_arch_003 - FAIL

- Category: `architecture`
- Question: What services make up the current AI assistant backend?
- Failure reasons: `missing_required_terms, source_mismatch`
- Latency ms: `4461.05`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The current AI assistant backend is composed of several services: * A GCP Cloud Run FastAPI backend [S4]. * Firestore for retrieval [S4], with access handled by `firestore_service.py` [S1], [S2]. * Gemini for response generation [S4], with generation and embed...

### rag_arch_004 - FAIL

- Category: `architecture`
- Question: What is the current maturity classification of the backend?
- Failure reasons: `missing_required_terms, source_mismatch`
- Latency ms: `2960.0`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The backend works but is currently MVP-shaped [S1].

### rag_retrieval_001 - FAIL

- Category: `retrieval`
- Question: How does current retrieval select relevant chunks?
- Failure reasons: `source_mismatch`
- Latency ms: `2706.7`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

Current retrieval selects relevant chunks using vector scoring [S1]. It also includes optional hybrid keyword scoring and optional reranking [S1, S4]. Chunks are filtered based on a configurable candidate pool size (`RAG_CANDIDATE_POOL_SIZE`) and a score thres...

### rag_retrieval_002 - FAIL

- Category: `retrieval`
- Question: What is the biggest retrieval scalability limitation right now?
- Failure reasons: `source_mismatch`
- Latency ms: `2524.07`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

Retrieval currently "still scans Firestore in memory" [S1].

### rag_retrieval_003 - FAIL

- Category: `retrieval`
- Question: Is managed vector retrieval implemented today?
- Failure reasons: `missing_required_terms, source_mismatch`
- Latency ms: `2488.52`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Yes, vector retrieval is implemented [S1]. Specifically, optional hybrid keyword + vector retrieval has been added [S2, S4, S5].

### rag_retrieval_004 - FAIL

- Category: `retrieval`
- Question: What hybrid retrieval capability exists today?
- Failure reasons: `source_mismatch`
- Latency ms: `2939.46`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

Hybrid keyword + vector retrieval is an optional capability that can be enabled using `RAG_HYBRID_ENABLED` and configured with `RAG_VECTOR_SCORE_WEIGHT` [S1]. This feature was added in Phase 7 [S1, S3] and is disabled by default [S1]. Retrieval now uses vector...

### rag_ingest_001 - FAIL

- Category: `ingestion`
- Question: How does document ingestion work?
- Failure reasons: `missing_required_terms, source_mismatch`
- Latency ms: `4375.35`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Document ingestion is handled by `backend-GCP/app/services/ingestion_service.py` [S4] and processes Google Cloud Storage document source files [S3]. The `/ingest-docs` endpoint is rerunnable [S2]. Key aspects of document ingestion include: * Using deterministi...

### rag_ingest_002 - FAIL

- Category: `ingestion`
- Question: What makes ingestion idempotent?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer, source_mismatch`
- Latency ms: `2478.53`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_ingest_003 - FAIL

- Category: `ingestion`
- Question: How is the ingestion endpoint protected?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer, source_mismatch`
- Latency ms: `2311.08`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_metadata_001 - FAIL

- Category: `metadata`
- Question: What metadata fields are stored for chunks after Phase 1 hardening?
- Failure reasons: `missing_required_terms, wrong_no_answer, source_mismatch`
- Latency ms: `2436.21`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

Based on the indexed project documents, metadata fields for chunks were added in Phase 5, not Phase 1. Phase 5 added chunk metadata and content hashes, including Firestore fields for `content_hash`, `char_count`, and `heading` [S1]. Phase 1 focused on controll...

### rag_metadata_002 - FAIL

- Category: `metadata`
- Question: Which metadata filters are supported?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer, source_mismatch`
- Latency ms: `5823.98`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_metadata_003 - FAIL

- Category: `metadata`
- Question: What happens if metadata filtering removes every chunk?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer, source_mismatch`
- Latency ms: `3410.57`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_rewrite_001 - FAIL

- Category: `query_rewrite`
- Question: How does query rewriting handle follow-up questions?
- Failure reasons: `missing_required_terms, wrong_no_answer, source_mismatch`
- Latency ms: `2329.95`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

Based on the indexed project documents, chat history is not yet implemented [S1, S2]. The Advanced RAG Roadmap lists "Chat history" as phase 10 [S4]. Therefore, the documents do not describe how query rewriting handles follow-up questions.

### rag_rewrite_002 - FAIL

- Category: `query_rewrite`
- Question: What happens if query rewriting fails?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer, source_mismatch`
- Latency ms: `2427.43`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_multi_001 - FAIL

- Category: `multi_query`
- Question: What does multi-query retrieval do?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer, source_mismatch`
- Latency ms: `2351.15`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_multi_002 - FAIL

- Category: `multi_query`
- Question: How does multi-query retrieval handle generation failure?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer, source_mismatch`
- Latency ms: `3265.72`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents. The provided context does not contain information about how multi-query retrieval handles generation failure.

### rag_citation_001 - FAIL

- Category: `citation_validation`
- Question: How are generated answers grounded to returned sources?
- Failure reasons: `source_mismatch`
- Latency ms: `3624.84`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The indexed project documents indicate that "Grounded answer citations" are a feature that is still basic and slated for improvement [S2]. "Phase 9 — Grounded answer prompt with citations" is listed as a completed advanced RAG phase [S3]. Future work includes...

### rag_citation_002 - FAIL

- Category: `citation_validation`
- Question: What happens to answers without valid source citations?
- Failure reasons: `missing_citation, wrong_no_answer, source_mismatch`
- Latency ms: `3556.69`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": true, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents. The provided context discusses the implementation and improvement of grounded answer citations [S1, S2, S3, S5], but does not specify what happens to answers that do not have valid source citations.

### rag_rate_001 - FAIL

- Category: `rate_limiting`
- Question: Which public RAG endpoints have rate limiting?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer, source_mismatch`
- Latency ms: `2404.08`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_rate_002 - FAIL

- Category: `rate_limiting`
- Question: Is the current rate limiter distributed production quota enforcement?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer, source_mismatch`
- Latency ms: `2497.35`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_memory_001 - FAIL

- Category: `firestore_memory`
- Question: Where is conversation memory persisted?
- Failure reasons: `missing_required_terms, wrong_no_answer, source_mismatch`
- Latency ms: `1713.05`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

Based on the indexed project documents, conversation memory is not currently persisted, as there is "No chat history yet" [S2]. Adding chat history is listed as a future task [S4].

### rag_memory_002 - FAIL

- Category: `firestore_memory`
- Question: Are query rewrite audit messages shown to users?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer, source_mismatch`
- Latency ms: `3307.26`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_sse_001 - FAIL

- Category: `sse_streaming`
- Question: What SSE events does the streaming RAG endpoint return?
- Failure reasons: `missing_required_terms, wrong_no_answer, source_mismatch`
- Latency ms: `2302.41`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents. The "Advanced RAG Roadmap" indicates that "Streaming responses" are a planned feature [S1], but the context does not specify what SSE events the streaming RAG endpoint would return.

### rag_sse_002 - FAIL

- Category: `sse_streaming`
- Question: Does the streaming path still validate citations before returning text?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer, source_mismatch`
- Latency ms: `2136.21`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_analytics_001 - FAIL

- Category: `rag_analytics`
- Question: What RAG analytics are recorded?
- Failure reasons: `missing_required_terms, wrong_no_answer, source_mismatch`
- Latency ms: `4326.52`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents. The provided context mentions "Structured logging" as a completed advanced RAG phase [S2] and "Monitoring and production hardening" as a planned phase [S1], but it does not specify what RAG analytics are re...

### rag_analytics_002 - FAIL

- Category: `rag_analytics`
- Question: How is the analytics summary endpoint protected?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer, source_mismatch`
- Latency ms: `2912.66`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### aws_counter_001 - FAIL

- Category: `aws_visitor_counter`
- Question: What services are used by the AWS visitor counter path?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer, source_mismatch`
- Latency ms: `2242.37`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### aws_counter_002 - FAIL

- Category: `aws_visitor_counter`
- Question: Is the AWS visitor counter currently rebuilt in the new AWS account?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer, source_mismatch`
- Latency ms: `2429.08`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### cloud_run_001 - FAIL

- Category: `cloud_run`
- Question: What backend service hosts the FastAPI RAG app?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer, source_mismatch`
- Latency ms: `1931.89`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### cloud_run_002 - FAIL

- Category: `cloud_run`
- Question: What runtime health checks exist for the backend?
- Failure reasons: `missing_required_terms, source_mismatch`
- Latency ms: `3847.74`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The backend structure includes a `health.py` file within the `backend-GCP/app/routes/` directory [S4]. This suggests the presence of a health check endpoint. For verification, a backend compile check can be performed using `python -m py_compile main.py` within...

### vertex_001 - FAIL

- Category: `vertex_ai`
- Question: Which Vertex AI model generates answers?
- Failure reasons: `source_mismatch`
- Latency ms: `2590.22`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The Vertex AI Gemini API, specifically Gemini 2.5 Flash, generates answers [S3]. This is part of the GCP Cloud Run FastAPI backend, which handles Gemini response generation [S2].

### vertex_002 - FAIL

- Category: `vertex_ai`
- Question: Which embedding model is used by the current RAG backend?
- Failure reasons: `source_mismatch`
- Latency ms: `1596.69`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The current RAG backend uses `text-embedding-005` [S4].

### limits_001 - FAIL

- Category: `limitations`
- Question: What still prevents this system from being production-grade Advanced RAG?
- Failure reasons: `missing_required_terms, source_mismatch`
- Latency ms: `3791.37`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Based on the advanced RAG roadmap, the system still needs to implement chat history, streaming responses, and monitoring and production hardening to be considered production-grade Advanced RAG [S1]. The current backend phase is "Grounded answer prompt with cit...

### limits_002 - FAIL

- Category: `limitations`
- Question: Is GraphRAG implemented in this backend?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer, source_mismatch`
- Latency ms: `3071.42`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### limits_003 - FAIL

- Category: `limitations`
- Question: Is Agentic RAG implemented in this backend?
- Failure reasons: `missing_citation, wrong_no_answer, source_mismatch`
- Latency ms: `3658.98`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": true, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents. The provided context describes a RAG assistant platform with an advanced RAG roadmap and completed phases, but it does not mention "Agentic RAG" [S1, S4, S5].

### limits_004 - FAIL

- Category: `limitations`
- Question: Is semantic reranking implemented today?
- Failure reasons: `missing_required_terms, source_mismatch`
- Latency ms: `2711.69`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Yes, optional reranking has been implemented [S1, S2, S4]. Phase 8 added opt-in deterministic reranking, which is disabled by default to maintain current Cloud Run behavior [S2].

### no_answer_001 - PASS

- Category: `no_answer`
- Question: What is Jarrett's private bank account number?
- Failure reasons: ``
- Latency ms: `2702.92`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: ``
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### no_answer_002 - PASS

- Category: `no_answer`
- Question: What is the exact salary for the next job offer?
- Failure reasons: ``
- Latency ms: `2230.86`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: ``
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### no_answer_003 - FAIL

- Category: `no_answer`
- Question: Which unreleased internal company roadmap is Jarrett following?
- Failure reasons: `forbidden_claim`
- Latency ms: `3565.24`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: ``
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": false, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents. The provided context describes the "Advanced RAG Roadmap" and "Near-Term Next Steps" for Jarrett's cloud engineering portfolio project [S1, S2]. It does not mention any unreleased internal company roadmap.

### no_answer_004 - PASS

- Category: `no_answer`
- Question: What is the password for the GCP service account?
- Failure reasons: ``
- Latency ms: `3078.28`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: ``
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents. The provided context describes the project's backend structure, services, and stack, but does not contain information regarding passwords for GCP service accounts [S1, S2, S3, S4, S5].

### no_answer_005 - PASS

- Category: `no_answer`
- Question: What production customer data is stored in this portfolio?
- Failure reasons: ``
- Latency ms: `3514.86`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: ``
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_eval_001 - FAIL

- Category: `retrieval`
- Question: What does the RAG evaluation script validate?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer, source_mismatch`
- Latency ms: `1830.42`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_eval_002 - FAIL

- Category: `limitations`
- Question: What should be the next RAG architecture upgrade after evaluation?
- Failure reasons: `missing_required_terms, source_mismatch`
- Latency ms: `9179.56`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The next RAG architecture upgrade after evaluation is "Grounded answer prompt with citations" [S1, S3]. This is also listed as the current backend phase [S3].

### rag_security_001 - FAIL

- Category: `rate_limiting`
- Question: What public endpoint protection was added in Phase 1?
- Failure reasons: `missing_required_terms, wrong_no_answer, source_mismatch`
- Latency ms: `8412.26`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

Based on the indexed project documents, I do not know what public endpoint protection was added in Phase 1. Phase 1 added controlled backend exceptions and stable JSON error payloads [S1].

### rag_logs_001 - FAIL

- Category: `architecture`
- Question: What logging improvements exist for Cloud Run operations?
- Failure reasons: `missing_required_terms, source_mismatch`
- Latency ms: `2666.97`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Phase 2 of the project added JSON-formatted Cloud Run logs, request IDs, request duration logs, controlled error logs, and metadata-only service logs for Gemini, GCS, Firestore, ingestion, and RAG flow [S1].

### rag_error_001 - FAIL

- Category: `limitations`
- Question: How does the backend handle unsupported answers?
- Failure reasons: `missing_required_terms, wrong_no_answer, source_mismatch`
- Latency ms: `4131.55`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

Based on the indexed project documents, there is no information provided on how the backend currently handles unsupported answers. "Controlled error handling" is listed as a planned feature in the Advanced RAG Roadmap [S3].

### rag_docs_001 - FAIL

- Category: `ingestion`
- Question: What kind of source documents are ingested for the RAG assistant?
- Failure reasons: `missing_required_terms, source_mismatch`
- Latency ms: `2613.98`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The RAG assistant ingests "Google Cloud Storage document source files" [S4].

### rag_ci_001 - FAIL

- Category: `rag_analytics`
- Question: How does CI currently use RAG evaluation?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer, source_mismatch`
- Latency ms: `3150.56`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

# RAG Evaluation Report

- Generated at: `2026-07-03T00:29:39.928643+00:00`
- Base URL: `https://gcp-rag-backend-189047029621.asia-east1.run.app`
- Questions: `evals/golden_questions.json`
- Soft fail: `True`

## Summary

- Total cases: `50`
- Passed cases: `19`
- Failed cases: `31`
- Overall pass rate: `0.38`
- Source match rate: `0.88`
- Doc type match rate: `0.96`
- Required terms rate: `0.4`
- Forbidden terms rate: `0.96`
- Citation grounding rate: `0.78`
- No-answer accuracy: `0.78`
- Average latency ms: `5197.33`
- P95 latency ms: `7853.56`

## Thresholds

- Threshold pass: `False`
- Failed thresholds: `overall_pass_rate, citation_grounding_rate`
- min_overall_pass_rate: `0.8`
- min_source_match_rate: `0.75`
- min_citation_rate: `0.9`
- max_average_latency_ms: `12000.0`

## Failure Categories

- doc_type_mismatch: `1`
- forbidden_claim: `1`
- latency_timeout: `1`
- missing_citation: `10`
- missing_required_terms: `29`
- source_mismatch: `5`
- wrong_no_answer: `10`

## Results

### rag_arch_001 - FAIL

- Category: `architecture`
- Question: Why does the RAG backend use GCP Cloud Run?
- Failure reasons: `missing_required_terms, doc_type_mismatch`
- Latency ms: `8110.96`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The RAG backend uses Google Cloud Run for its serverless architecture, which offers several benefits: * **Cost-effectiveness**: It operates on a pay-as-you-go model and scales to zero when there are no user requests, resulting in almost no idle computing costs...

### rag_arch_002 - PASS

- Category: `architecture`
- Question: Describe the current GCP RAG backend stack.
- Failure reasons: ``
- Latency ms: `5426.11`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The current GCP RAG backend stack includes [S5]: * **Compute:** GCP Cloud Run FastAPI [S1], [S5] * **AI/ML Models:** Vertex AI Gemini 2.5 Flash for generation and `text-embedding-005` for embeddings [S1], [S3] * **Database:** Firestore for `document_chunks` an...

### rag_arch_003 - PASS

- Category: `architecture`
- Question: What services make up the current AI assistant backend?
- Failure reasons: ``
- Latency ms: `5939.94`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The current AI assistant backend is composed of several services [S1, S3]: * **Firestore service** (`firestore_service.py`): Handles Firestore access, including persistent conversation history storage [S1, S3]. * **GCS service** (`gcs_service.py`): Manages Goo...

### rag_arch_004 - FAIL

- Category: `architecture`
- Question: What is the current maturity classification of the backend?
- Failure reasons: `missing_required_terms, forbidden_claim`
- Latency ms: `3585.52`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": false, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The current maturity classification of the backend is "Intermediate RAG with several advanced RAG features implemented" [S1]. It has moved beyond basic RAG but is not yet fully production-grade Advanced RAG [S1].

### rag_retrieval_001 - FAIL

- Category: `retrieval`
- Question: How does current retrieval select relevant chunks?
- Failure reasons: `source_mismatch, missing_required_terms`
- Latency ms: `7213.44`
- Sources returned: `gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": false}`

Answer excerpt:

The retrieval process selects relevant chunks through a multi-layered strategy that balances precision, contextual completeness, and system stability [S1, S3]. Key mechanisms include: * **Semantic Search** The user's question is converted into a query embeddin...

### rag_retrieval_002 - PASS

- Category: `retrieval`
- Question: What is the biggest retrieval scalability limitation right now?
- Failure reasons: ``
- Latency ms: `4897.98`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The biggest retrieval scalability limitation is that the current system scans Firestore `document_chunks` in memory and calculates cosine similarity locally [S1, S5]. Production retrieval still defaults to this local Firestore scanning [S2]. A production-style...

### rag_retrieval_003 - FAIL

- Category: `retrieval`
- Question: Is managed vector retrieval implemented today?
- Failure reasons: `missing_required_terms`
- Latency ms: `7853.56`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Managed vector retrieval is partially implemented. The backend has a code-gated Firestore Vector Search retrieval backend, and the Firestore vector index for `document_chunks.embedding` has been created [S3]. However, production retrieval still defaults to loc...

### rag_retrieval_004 - PASS

- Category: `retrieval`
- Question: What hybrid retrieval capability exists today?
- Failure reasons: ``
- Latency ms: `3528.37`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The current system includes optional hybrid keyword + vector scoring [S5]. Retrieval now uses vector scoring, with optional hybrid keyword scoring available [S1].

### rag_ingest_001 - FAIL

- Category: `ingestion`
- Question: How does document ingestion work?
- Failure reasons: `source_mismatch, missing_required_terms`
- Latency ms: `7207.12`
- Sources returned: `gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": false}`

Answer excerpt:

The document ingestion process works through an automated **Document Ingestion Pipeline** [S1]. This pipeline converts Markdown technical documents into a searchable knowledge base

### rag_ingest_002 - FAIL

- Category: `ingestion`
- Question: What makes ingestion idempotent?
- Failure reasons: `missing_required_terms`
- Latency ms: `6966.84`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Idempotent ingestion is a completed implementation milestone [S3]. New ingestion writes metadata fields such as `project`, `doc_type`, `section_path`, `source_uri`, `version_id`, `file_name`, `heading`, `chunk_index`, `content_hash`, `char_count`, and `updated...

### rag_ingest_003 - PASS

- Category: `ingestion`
- Question: How is the ingestion endpoint protected?
- Failure reasons: ``
- Latency ms: `4179.03`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The ingestion endpoint, `POST /ingest-docs`, is protected by requiring an `X-Admin-Token` header [S1]. This token is backed by `INGESTION_ADMIN_TOKEN`, which Cloud Run receives from a GitHub Actions secret [S1, S5]. This ensures that ingestion is admin-only, w...

### rag_metadata_001 - FAIL

- Category: `metadata`
- Question: What metadata fields are stored for chunks after Phase 1 hardening?
- Failure reasons: `source_mismatch, missing_required_terms`
- Latency ms: `7290.71`
- Sources returned: `gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": false}`

Answer excerpt:

The provided context does not explicitly mention "Phase 1 hardening." However, it details the main metadata fields designed and used for each chunk in the RAG knowledge store [S1]. The metadata fields stored for each chunk are: * `chunk_id`: Unique identifier...

### rag_metadata_002 - PASS

- Category: `metadata`
- Question: Which metadata filters are supported?
- Failure reasons: ``
- Latency ms: `6974.44`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The `/ask-rag` and `/ask-rag-stream` endpoints support metadata filtering by the following fields [S1]: * **Exact matching**: `project`, `doc_type`, `file_name`, and `version_id` [S1]. * **Case-insensitive substring matching**: `heading`, `section_path`, and `...

### rag_metadata_003 - PASS

- Category: `metadata`
- Question: What happens if metadata filtering removes every chunk?
- Failure reasons: ``
- Latency ms: `3559.1`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

If metadata filtering removes every chunk, the existing safe no-answer behavior is preserved [S1].

### rag_rewrite_001 - FAIL

- Category: `query_rewrite`
- Question: How does query rewriting handle follow-up questions?
- Failure reasons: `missing_required_terms`
- Latency ms: `4087.66`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Query rewriting transforms follow-up questions into standalone retrieval queries [S1].

### rag_rewrite_002 - FAIL

- Category: `query_rewrite`
- Question: What happens if query rewriting fails?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer`
- Latency ms: `7401.6`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_multi_001 - FAIL

- Category: `multi_query`
- Question: What does multi-query retrieval do?
- Failure reasons: `missing_required_terms`
- Latency ms: `3498.59`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Multi-query retrieval generates several search variants and merges the results [S1].

### rag_multi_002 - FAIL

- Category: `multi_query`
- Question: How does multi-query retrieval handle generation failure?
- Failure reasons: `missing_required_terms`
- Latency ms: `4942.39`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Multi-query retrieval is part of a system that includes no-answer confidence handling, which prevents the assistant from answering when the retrieved context is too weak [S1].

### rag_citation_001 - FAIL

- Category: `citation_validation`
- Question: How are generated answers grounded to returned sources?
- Failure reasons: `source_mismatch, missing_required_terms`
- Latency ms: `7706.69`
- Sources returned: `gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": false}`

Answer excerpt:

The AI Assistant's generated answers are grounded to returned sources through a prompt grounding strategy [S1]. Key aspects of this strategy include: * **Context Assembly** The system combines the user's question, retrieved chunks, parent context, and source m...

### rag_citation_002 - FAIL

- Category: `citation_validation`
- Question: What happens to answers without valid source citations?
- Failure reasons: `missing_required_terms`
- Latency ms: `5389.03`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Runtime citation validation replaces unsupported generated answers with a safe no-answer response before they are returned or saved [S4]. The grounded answer prompt requires source ID citations for factual claims [S4].

### rag_rate_001 - PASS

- Category: `rate_limiting`
- Question: Which public RAG endpoints have rate limiting?
- Failure reasons: ``
- Latency ms: `3860.84`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The public RAG endpoints that have rate limiting are `/ask-rag` and `/ask-rag-stream` [S3]. These routes are controlled by a lightweight configurable in-memory rate limiter [S1, S3, S4, S5].

### rag_rate_002 - FAIL

- Category: `rate_limiting`
- Question: Is the current rate limiter distributed production quota enforcement?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer`
- Latency ms: `4761.9`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_memory_001 - FAIL

- Category: `firestore_memory`
- Question: Where is conversation memory persisted?
- Failure reasons: `source_mismatch, missing_required_terms`
- Latency ms: `3670.3`
- Sources returned: `gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": false}`

Answer excerpt:

Conversation memory is persisted in Firestore [S1, S4]. Specifically, user messages, AI responses, timestamps, and related metadata are stored in Firestore [S1].

### rag_memory_002 - PASS

- Category: `firestore_memory`
- Question: Are query rewrite audit messages shown to users?
- Failure reasons: ``
- Latency ms: `4291.55`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

No, Firestore system audit messages for query rewriting remain backend-only and are filtered out of the user/assistant conversation context [S1, S3, S4]. Rewritten retrieval queries are stored only as backend system audit messages in Firestore [S5].

### rag_sse_001 - FAIL

- Category: `sse_streaming`
- Question: What SSE events does the streaming RAG endpoint return?
- Failure reasons: `missing_required_terms`
- Latency ms: `5374.68`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The streaming RAG endpoint (`POST /ask-rag-stream`) returns streamed text (answer tokens) and source metadata, which allows for progressive rendering of responses and sources [S1, S3, S4]. The streamed text visibly grows while the request is loading, and sourc...

### rag_sse_002 - FAIL

- Category: `sse_streaming`
- Question: Does the streaming path still validate citations before returning text?
- Failure reasons: `missing_required_terms`
- Latency ms: `4290.3`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Yes, runtime citation validation replaces unsupported generated answers with a safe no-answer response before they are returned or saved [S3]. The streaming path progressively renders responses, and sources render after metadata arrives [S3, S2].

### rag_analytics_001 - FAIL

- Category: `rag_analytics`
- Question: What RAG analytics are recorded?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer`
- Latency ms: `6892.14`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_analytics_002 - FAIL

- Category: `rag_analytics`
- Question: How is the analytics summary endpoint protected?
- Failure reasons: `missing_required_terms`
- Latency ms: `3853.12`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The RAG analytics summary endpoint is admin-only [S1].

### aws_counter_001 - PASS

- Category: `aws_visitor_counter`
- Question: What services are used by the AWS visitor counter path?
- Failure reasons: ``
- Latency ms: `3037.48`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The AWS Visitor Counter previously used S3 static hosting, CloudFront CDN + HTTPS, API Gateway, Lambda, and DynamoDB [S1]. The rebuild additions include SNS, EventBridge, IAM roles and policies, and deployment integration [S1].

### aws_counter_002 - FAIL

- Category: `aws_visitor_counter`
- Question: Is the AWS visitor counter currently rebuilt in the new AWS account?
- Failure reasons: `missing_required_terms`
- Latency ms: `4247.42`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

No, the AWS visitor counter is not currently rebuilt in the new AWS account [S1]. Its rebuild is still pending [S2] and is listed as "rebuild-required until implemented and verified" [S5].

### cloud_run_001 - FAIL

- Category: `cloud_run`
- Question: What backend service hosts the FastAPI RAG app?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer`
- Latency ms: `4128.2`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### cloud_run_002 - PASS

- Category: `cloud_run`
- Question: What runtime health checks exist for the backend?
- Failure reasons: ``
- Latency ms: `4655.19`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The backend includes a `health.py` module within its routes [S1, S2]. During a live RAG evaluation, an attempt to access `GET /healthz` resulted in an HTTP `404` error, while `GET /` returned an HTTP `200` [S3].

### vertex_001 - FAIL

- Category: `vertex_ai`
- Question: Which Vertex AI model generates answers?
- Failure reasons: `missing_required_terms`
- Latency ms: `4844.89`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The system uses **Vertex AI Gemini** to generate the final answer [S1].

### vertex_002 - PASS

- Category: `vertex_ai`
- Question: Which embedding model is used by the current RAG backend?
- Failure reasons: ``
- Latency ms: `3254.44`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The current RAG backend uses `text-embedding-005` [S1].

### limits_001 - FAIL

- Category: `limitations`
- Question: What still prevents this system from being production-grade Advanced RAG?
- Failure reasons: `missing_required_terms`
- Latency ms: `4789.95`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The system is not yet fully production-grade Advanced RAG due to several factors: * Production retrieval still defaults to local Firestore scanning [S1, S2]. * Firestore Vector Search did not outperform the local baseline in the latest live evaluation and is c...

### limits_002 - FAIL

- Category: `limitations`
- Question: Is GraphRAG implemented in this backend?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer`
- Latency ms: `4487.43`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### limits_003 - PASS

- Category: `limitations`
- Question: Is Agentic RAG implemented in this backend?
- Failure reasons: ``
- Latency ms: `4226.03`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

No, Agentic RAG is not currently implemented in this backend [S5]. It is considered an advanced RAG pattern that is more complex than needed for the current portfolio stage and should come later [S1]. The current limitations after Phase 1 Immediate state that...

### limits_004 - FAIL

- Category: `limitations`
- Question: Is semantic reranking implemented today?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer`
- Latency ms: `4130.63`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### no_answer_001 - PASS

- Category: `no_answer`
- Question: What is Jarrett's private bank account number?
- Failure reasons: ``
- Latency ms: `4666.33`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: ``
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### no_answer_002 - PASS

- Category: `no_answer`
- Question: What is the exact salary for the next job offer?
- Failure reasons: ``
- Latency ms: `4125.53`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: ``
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### no_answer_003 - PASS

- Category: `no_answer`
- Question: Which unreleased internal company roadmap is Jarrett following?
- Failure reasons: ``
- Latency ms: `5136.89`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: ``
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

Based on the indexed project documents, Jarrett is following the "Advanced RAG Roadmap — Phase 1 to Phase 5" [S1]. The roadmap outlines improvements and goals for the RAG project, including phases like Retrieval Quality Quick Wins, Better Retrieval Logic, Eval...

### no_answer_004 - FAIL

- Category: `no_answer`
- Question: What is the password for the GCP service account?
- Failure reasons: `missing_citation, wrong_no_answer`
- Latency ms: `120.46`
- Sources returned: ``
- Expected sources: ``
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": true, "source_match": true}`

Answer excerpt:

I can't provide secrets, tokens, API keys, or private credential values. I can explain where configuration belongs and how to rotate credentials safely.

### no_answer_005 - PASS

- Category: `no_answer`
- Question: What production customer data is stored in this portfolio?
- Failure reasons: ``
- Latency ms: `5201.09`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: ``
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

Based on the indexed project documents, I do not know what production customer data is stored in this portfolio. The conversation memory is designed to preserve interaction context for multi-turn conversations, storing data such as user messages, assistant res...

### rag_eval_001 - FAIL

- Category: `retrieval`
- Question: What does the RAG evaluation script validate?
- Failure reasons: `missing_required_terms`
- Latency ms: `7098.1`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The RAG evaluation script validates the system's performance against golden questions [S2]. Specifically, it: * Includes 3

### rag_eval_002 - FAIL

- Category: `limitations`
- Question: What should be the next RAG architecture upgrade after evaluation?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer`
- Latency ms: `8064.53`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_security_001 - FAIL

- Category: `rate_limiting`
- Question: What public endpoint protection was added in Phase 1?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer`
- Latency ms: `4830.66`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_logs_001 - FAIL

- Category: `architecture`
- Question: What logging improvements exist for Cloud Run operations?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer`
- Latency ms: `7241.74`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_error_001 - PASS

- Category: `limitations`
- Question: How does the backend handle unsupported answers?
- Failure reasons: ``
- Latency ms: `7065.28`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The backend handles unsupported answers through a "safe no-answer" mechanism and runtime citation validation [S4, S5]. Specifically: * If retrieval results are insufficient, the system explicitly states that there is not enough information in the current docum...

### rag_docs_001 - FAIL

- Category: `ingestion`
- Question: What kind of source documents are ingested for the RAG assistant?
- Failure reasons: `latency_timeout`
- Latency ms: `None`
- Sources returned: ``
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": false, "forbidden_terms": false, "no_answer": false, "required_terms": false, "source_match": false}`
- Error: `Request timed out`

### rag_ci_001 - PASS

- Category: `rag_analytics`
- Question: How does CI currently use RAG evaluation?
- Failure reasons: ``
- Latency ms: `6562.93`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

RAG evaluation is integrated into the CI/CD pipeline. Specifically, the `.github/workflows/deploy-backend-gcp.yml` workflow runs the RAG evaluator after Cloud Run deployment [S2, S4, S5]. This process uploads `rag-evaluation-report` and `rag-evaluation-json` [...

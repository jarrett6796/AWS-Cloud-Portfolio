# RAG Evaluation Report

- Generated at: `2026-07-08T11:36:23.083011+00:00`
- Base URL: `https://gcp-rag-backend-189047029621.asia-east1.run.app`
- Questions: `evals/golden_questions.json`
- Soft fail: `True`

## Summary

- Total cases: `50`
- Passed cases: `16`
- Failed cases: `34`
- Overall pass rate: `0.32`
- Source match rate: `0.82`
- Doc type match rate: `0.96`
- Required terms rate: `0.5`
- Forbidden terms rate: `0.98`
- Citation grounding rate: `0.7`
- No-answer accuracy: `0.92`
- Average latency ms: `6609.55`
- P95 latency ms: `9263.78`

## Thresholds

- Threshold pass: `False`
- Failed thresholds: `overall_pass_rate, citation_grounding_rate`
- min_overall_pass_rate: `0.8`
- min_source_match_rate: `0.75`
- min_citation_rate: `0.9`
- max_average_latency_ms: `12000.0`

## Failure Categories

- doc_type_mismatch: `2`
- forbidden_claim: `1`
- missing_citation: `15`
- missing_required_terms: `25`
- source_mismatch: `9`
- wrong_no_answer: `4`

## Results

### rag_arch_001 - FAIL

- Category: `architecture`
- Question: Why does the RAG backend use GCP Cloud Run?
- Failure reasons: `missing_required_terms, doc_type_mismatch`
- Latency ms: `7640.18`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/Implementation 實作流程.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The RAG backend uses Google Cloud Run because it is a serverless architecture that offers several benefits [S4, S5]: * **Cost-effectiveness**: It operates on a pay-as-you-go model and can scale to zero when there are no user requests, resulting in almost no id...

### rag_arch_002 - PASS

- Category: `architecture`
- Question: Describe the current GCP RAG backend stack.
- Failure reasons: ``
- Latency ms: `6930.34`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/Implementation 實作流程.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The current GCP RAG backend stack is orchestrated by FastAPI [S4] and runs on Cloud Run [S1]. Key components and services include: * **FastAPI** for process control and API endpoints [S1, S4]. * **Vertex AI Gemini 2.5 Flash** for generation and **`text-embeddi...

### rag_arch_003 - FAIL

- Category: `architecture`
- Question: What services make up the current AI assistant backend?
- Failure reasons: `missing_citation`
- Latency ms: `7997.81`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, knowledge-base/crc-rag/Architecture 架構圖.md, knowledge-base/crc-rag/Implementation 實作流程.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The current AI assistant backend is composed of several services: * **FastAPI** provides API services [S3, S5]. * **Google Cloud Run** serves as the deployment platform for the FastAPI backend [S2, S3, S5]. * **Vertex AI Gemini** (specifically Gemini 2.5 Flash...

### rag_arch_004 - FAIL

- Category: `architecture`
- Question: What is the current maturity classification of the backend?
- Failure reasons: `missing_required_terms`
- Latency ms: `4820.3`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The current maturity classification of the backend is "Intermediate RAG with several advanced RAG features implemented" [S1].

### rag_retrieval_001 - FAIL

- Category: `retrieval`
- Question: How does current retrieval select relevant chunks?
- Failure reasons: `source_mismatch, missing_required_terms, missing_citation`
- Latency ms: `7103.27`
- Sources returned: `gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": false}`

Answer excerpt:

The current retrieval system selects relevant chunks through a multi-layered approach to balance precision and context completeness [S1, S2, S5]. Key strategies include: * **Semantic Search**: Converts the user's question into a query embedding and compares it...

### rag_retrieval_002 - PASS

- Category: `retrieval`
- Question: What is the biggest retrieval scalability limitation right now?
- Failure reasons: ``
- Latency ms: `6462.87`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The biggest retrieval scalability limitation is that the current system scans Firestore `document_chunks` in memory and calculates cosine similarity locally [S1, S5]. Production retrieval still defaults to this local Firestore scanning [S2]. A production-style...

### rag_retrieval_003 - FAIL

- Category: `retrieval`
- Question: Is managed vector retrieval implemented today?
- Failure reasons: `missing_citation`
- Latency ms: `7079.96`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

Managed vector retrieval is not fully implemented and enabled for production use today. While a code-gated Firestore Vector Search retrieval backend exists, the system currently defaults to local Firestore scanning [S2, S3, S4]. Firestore Vector Search is vali...

### rag_retrieval_004 - FAIL

- Category: `retrieval`
- Question: What hybrid retrieval capability exists today?
- Failure reasons: `missing_required_terms`
- Latency ms: `8445.38`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/Implementation 實作流程.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The current retrieval strategy employs a multi-layered design that combines several techniques to balance precision, contextual completeness, and system stability [S1, S2]. This hybrid approach includes: * **Semantic Search** to compare user questions with chu...

### rag_ingest_001 - FAIL

- Category: `ingestion`
- Question: How does document ingestion work?
- Failure reasons: `source_mismatch, missing_required_terms`
- Latency ms: `9603.35`
- Sources returned: `gcp-rag-system-design.md, knowledge-base/crc-rag/Implementation 實作流程.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": false}`

Answer excerpt:

The document ingestion process works as follows: When technical documents are added or updated, the system automatically re-executes the Document Ingestion Pipeline [S2, S3]. This pipeline converts Markdown technical documents into a searchable knowledge base...

### rag_ingest_002 - FAIL

- Category: `ingestion`
- Question: What makes ingestion idempotent?
- Failure reasons: `missing_required_terms`
- Latency ms: `8060.72`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/Implementation 實作流程.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The ingestion process is made idempotent by using a content hash to support incremental updates [S5]. When document content is updated, the system can determine if a chunk has truly changed through its `content_hash` [S5]. This avoids reprocessing all document...

### rag_ingest_003 - PASS

- Category: `ingestion`
- Question: How is the ingestion endpoint protected?
- Failure reasons: ``
- Latency ms: `5225.77`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/Implementation 實作流程.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The `/ingest-docs` endpoint is protected with an `X-Admin-Token` header, which is backed by `INGESTION_ADMIN_TOKEN` [S1]. This ensures that while public chat routes remain unauthenticated, document ingestion is restricted to administrators [S1].

### rag_metadata_001 - FAIL

- Category: `metadata`
- Question: What metadata fields are stored for chunks after Phase 1 hardening?
- Failure reasons: `source_mismatch, missing_required_terms, missing_citation`
- Latency ms: `6339.01`
- Sources returned: `gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": false}`

Answer excerpt:

After Phase 1 hardening, the following metadata fields are stored for each chunk in the RAG knowledge store [S1, S2]: * **chunk_id**: Unique identifier for each chunk, used for querying, updating, tracking, and debugging [S1, S2]. * **parent_id**: Identifier f...

### rag_metadata_002 - FAIL

- Category: `metadata`
- Question: Which metadata filters are supported?
- Failure reasons: `missing_required_terms, missing_citation`
- Latency ms: `6476.58`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The AI Assistant supports metadata filtering based on `project id`, `document type`, `module`, and `tags` [S1, S2, S4, S5]. This helps to limit the search scope and prevent mixing content from different projects [S1, S2, S4, S5].

### rag_metadata_003 - FAIL

- Category: `metadata`
- Question: What happens if metadata filtering removes every chunk?
- Failure reasons: `source_mismatch, missing_required_terms, missing_citation, wrong_no_answer`
- Latency ms: `8806.33`
- Sources returned: `gcp-rag-system-design.md, knowledge-base/crc-rag/Implementation 實作流程.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": false}`

Answer excerpt:

Based on the indexed project documents, the specific outcome of metadata filtering removing every chunk is not explicitly detailed [S1, S2, S3]. However

### rag_rewrite_001 - FAIL

- Category: `query_rewrite`
- Question: How does query rewriting handle follow-up questions?
- Failure reasons: `missing_required_terms`
- Latency ms: `4463.92`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Query rewriting transforms follow-up questions into standalone retrieval queries [S1].

### rag_rewrite_002 - FAIL

- Category: `query_rewrite`
- Question: What happens if query rewriting fails?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer`
- Latency ms: `6239.83`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents. The provided context describes what query rewriting is and its implementation status, but it does not specify what happens if query rewriting fails [S4, S5].

### rag_multi_001 - FAIL

- Category: `multi_query`
- Question: What does multi-query retrieval do?
- Failure reasons: `missing_required_terms`
- Latency ms: `4825.75`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/Implementation 實作流程.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Multi-query retrieval generates several search variants and merges results [S1].

### rag_multi_002 - FAIL

- Category: `multi_query`
- Question: How does multi-query retrieval handle generation failure?
- Failure reasons: `missing_required_terms`
- Latency ms: `8124.36`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Multi-query retrieval is part of a phase that includes "No-answer confidence handling," which prevents the AI assistant from answering when the retrieved context is too weak [S1].

### rag_citation_001 - FAIL

- Category: `citation_validation`
- Question: How are generated answers grounded to returned sources?
- Failure reasons: `source_mismatch, missing_required_terms, missing_citation`
- Latency ms: `8227.91`
- Sources returned: `gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": false}`

Answer excerpt:

In Jarrett's RAG AI Assistant, generated answers are grounded to returned sources through a "Prompt Grounding" strategy [S1, S2]. This strategy ensures that the Large Language Model (LLM) generates responses based on the project document content provided by th...

### rag_citation_002 - FAIL

- Category: `citation_validation`
- Question: What happens to answers without valid source citations?
- Failure reasons: `missing_required_terms`
- Latency ms: `6219.26`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Runtime citation validation replaces unsupported generated answers with a safe no-answer response before they are returned or saved [S4]. This is because the grounded answer prompt requires source ID citations for factual claims [S4].

### rag_rate_001 - PASS

- Category: `rate_limiting`
- Question: Which public RAG endpoints have rate limiting?
- Failure reasons: ``
- Latency ms: `5050.48`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The public RAG endpoints that have rate limiting are `/ask-rag` and `/ask-rag-stream` [S2]. These routes are controlled by a lightweight in-memory limiter [S2, S3, S4].

### rag_rate_002 - FAIL

- Category: `rate_limiting`
- Question: Is the current rate limiter distributed production quota enforcement?
- Failure reasons: `missing_citation`
- Latency ms: `5371.16`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

No, the current rate limiter is a lightweight in-memory limiter and a Phase 1 abuse-control measure, not a distributed production quota system [S1, S2, S3].

### rag_memory_001 - FAIL

- Category: `firestore_memory`
- Question: Where is conversation memory persisted?
- Failure reasons: `source_mismatch, missing_required_terms, missing_citation`
- Latency ms: `5140.0`
- Sources returned: `gcp-rag-system-design.md, knowledge-base/crc-rag/Implementation 實作流程.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": false}`

Answer excerpt:

Conversation memory is stored in Firestore [S1, S2, S3].

### rag_memory_002 - FAIL

- Category: `firestore_memory`
- Question: Are query rewrite audit messages shown to users?
- Failure reasons: `forbidden_claim, missing_citation`
- Latency ms: `5352.98`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": false, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

Firestore system audit messages for query rewriting are backend-only and filtered out of user/assistant conversation context [S1, S3, S4]. This means they are not shown to users.

### rag_sse_001 - FAIL

- Category: `sse_streaming`
- Question: What SSE events does the streaming RAG endpoint return?
- Failure reasons: `missing_required_terms`
- Latency ms: `7081.7`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, knowledge-base/crc-rag/Implementation 實作流程.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The streaming RAG endpoint returns AI-generated content incrementally via Server-Sent Events (SSE) [S1]. Users can see the AI-generated content in real-time [S1]. The stream also includes metadata, such as sources, which render after arrival [S4]. Once the ans...

### rag_sse_002 - FAIL

- Category: `sse_streaming`
- Question: Does the streaming path still validate citations before returning text?
- Failure reasons: `missing_required_terms`
- Latency ms: `6003.55`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Yes, runtime citation validation replaces unsupported generated answers with a safe no-answer response before they are returned or saved, which applies to the streaming path (`POST /ask-rag-stream`) [S3].

### rag_analytics_001 - FAIL

- Category: `rag_analytics`
- Question: What RAG analytics are recorded?
- Failure reasons: `source_mismatch, missing_required_terms`
- Latency ms: `6859.14`
- Sources returned: `gcp-rag-system-design.md, knowledge-base/crc-rag/Implementation 實作流程.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": false}`

Answer excerpt:

RAG analytics record important information for each query, including retrieved documents (or chunks), response time, and related execution logs [S1]. Specifically, the system records the query, retrieved chunks, source metadata, generated response (or response...

### rag_analytics_002 - FAIL

- Category: `rag_analytics`
- Question: How is the analytics summary endpoint protected?
- Failure reasons: `missing_required_terms`
- Latency ms: `7724.59`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The RAG analytics summary endpoint is "Admin-only" [S1].

### aws_counter_001 - PASS

- Category: `aws_visitor_counter`
- Question: What services are used by the AWS visitor counter path?
- Failure reasons: ``
- Latency ms: `5849.89`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, knowledge-base/crc-rag/Architecture 架構圖.md, knowledge-base/crc-rag/Implementation 實作流程.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The AWS visitor counter path uses several AWS services: * **Previous implementation**: S3 static hosting, CloudFront CDN + HTTPS, API Gateway, Lambda, and DynamoDB [S1]. * **Current implementation additions**: SNS, EventBridge, and IAM roles and policies [S1]....

### aws_counter_002 - PASS

- Category: `aws_visitor_counter`
- Question: Is the AWS visitor counter currently rebuilt in the new AWS account?
- Failure reasons: ``
- Latency ms: `14936.11`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

No, the AWS visitor counter is not currently rebuilt in the new AWS account [S1, S5]. A safe visitor counter fallback has been implemented while the AWS backend rebuild is pending [S2]. The status of the Web View Counter is "Planned" [S3].

### cloud_run_001 - PASS

- Category: `cloud_run`
- Question: What backend service hosts the FastAPI RAG app?
- Failure reasons: ``
- Latency ms: `4692.19`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, knowledge-base/crc-rag/Architecture 架構圖.md, knowledge-base/crc-rag/Implementation 實作流程.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The FastAPI RAG app is hosted on Google Cloud Run [S4].

### cloud_run_002 - PASS

- Category: `cloud_run`
- Question: What runtime health checks exist for the backend?
- Failure reasons: ``
- Latency ms: `9263.78`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, knowledge-base/crc-rag/Implementation 實作流程.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The backend includes a `health.py` route [S1]. During live evaluation, `GET /` returned HTTP `200` for the deployed Cloud Run application, while `GET /healthz` returned HTTP `404` [S3, S5]. Additionally, after development, the system undergoes functional verif...

### vertex_001 - FAIL

- Category: `vertex_ai`
- Question: Which Vertex AI model generates answers?
- Failure reasons: `source_mismatch, doc_type_mismatch`
- Latency ms: `5646.97`
- Sources returned: `knowledge-base/crc-rag/Architecture 架構圖.md, knowledge-base/crc-rag/Implementation 實作流程.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": false}`

Answer excerpt:

The Vertex AI Gemini model generates answers [S1, S2]. Specifically, the project uses Vertex AI Gemini 2.5 Flash for answer generation [S3].

### vertex_002 - PASS

- Category: `vertex_ai`
- Question: Which embedding model is used by the current RAG backend?
- Failure reasons: ``
- Latency ms: `4382.6`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The current RAG backend uses `text-embedding-005` [S1].

### limits_001 - FAIL

- Category: `limitations`
- Question: What still prevents this system from being production-grade Advanced RAG?
- Failure reasons: `missing_required_terms`
- Latency ms: `5845.62`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The system is not yet considered production-grade Advanced RAG due to several factors: * Production retrieval still defaults to local Firestore scanning [S1, S2]. * Firestore Vector Search, though validated, is currently disabled because it scored below the lo...

### limits_002 - FAIL

- Category: `limitations`
- Question: Is GraphRAG implemented in this backend?
- Failure reasons: `missing_citation`
- Latency ms: `5940.17`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

No, GraphRAG is not yet implemented in this backend [S2, S3, S4, S5]. It is considered an optional advanced RAG pattern that should be implemented later, after the core system is stable [S1, S2, S4, S5].

### limits_003 - PASS

- Category: `limitations`
- Question: Is Agentic RAG implemented in this backend?
- Failure reasons: ``
- Latency ms: `5452.76`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

No, Agentic RAG is not yet implemented in this backend [S2, S4, S5]. It is considered more complex than needed for the current portfolio stage [S1].

### limits_004 - FAIL

- Category: `limitations`
- Question: Is semantic reranking implemented today?
- Failure reasons: `missing_required_terms, missing_citation`
- Latency ms: `8058.47`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Semantic reranking is implemented as opt-in code paths, but its full deployment, reingestion, and live evaluation are pending [S1, S3, S4]. It was part of the Phase 4 Advanced RAG local implementation [S1, S3, S4].

### no_answer_001 - PASS

- Category: `no_answer`
- Question: What is Jarrett's private bank account number?
- Failure reasons: ``
- Latency ms: `4712.11`
- Sources returned: `knowledge-base/crc-rag/Architecture 架構圖.md, knowledge-base/crc-rag/Overview 綜覽.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: ``
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### no_answer_002 - PASS

- Category: `no_answer`
- Question: What is the exact salary for the next job offer?
- Failure reasons: ``
- Latency ms: `7862.3`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, knowledge-base/crc-rag/Overview 綜覽.md`
- Expected sources: ``
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

Based on the indexed project documents, I do not know the exact salary for the next job offer. The provided context discusses challenges and solutions related to job applications, portfolios, and AI in recruitment, but it does not contain information about spe...

### no_answer_003 - PASS

- Category: `no_answer`
- Question: Which unreleased internal company roadmap is Jarrett following?
- Failure reasons: ``
- Latency ms: `5873.39`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: ``
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### no_answer_004 - FAIL

- Category: `no_answer`
- Question: What is the password for the GCP service account?
- Failure reasons: `missing_citation, wrong_no_answer`
- Latency ms: `225.55`
- Sources returned: ``
- Expected sources: ``
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": true, "source_match": true}`

Answer excerpt:

I can't provide secrets, tokens, API keys, or private credential values. I can explain where configuration belongs and how to rotate credentials safely.

### no_answer_005 - FAIL

- Category: `no_answer`
- Question: What production customer data is stored in this portfolio?
- Failure reasons: `wrong_no_answer`
- Latency ms: `6946.53`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, knowledge-base/crc-rag/Architecture 架構圖.md`
- Expected sources: ``
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": true, "source_match": true}`

Answer excerpt:

The portfolio stores the following production customer data: * **Contact form content**: This includes the name, email, and message from recruiter/user contact forms, stored in the `contact_records` table in AWS DynamoDB [S1]. * **AI assistant conversation his...

### rag_eval_001 - FAIL

- Category: `retrieval`
- Question: What does the RAG evaluation script validate?
- Failure reasons: `missing_required_terms`
- Latency ms: `5867.34`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The RAG evaluation script (`backend-GCP/scripts/evaluate_rag.py`) validates various aspects of the RAG system. It includes 30 golden questions covering architecture, retrieval, ingestion, Firestore memory, SSE streaming, citation validation, AWS visitor counte...

### rag_eval_002 - PASS

- Category: `limitations`
- Question: What should be the next RAG architecture upgrade after evaluation?
- Failure reasons: ``
- Latency ms: `8491.95`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

After evaluation, the next RAG architecture upgrade should be Managed Vector Retrieval, specifically implementing Firestore Vector Search or Vertex AI Vector Search [S2, S1]. This phase aims to replace Firestore full-scan retrieval with a production-style vect...

### rag_security_001 - FAIL

- Category: `rate_limiting`
- Question: What public endpoint protection was added in Phase 1?
- Failure reasons: `missing_citation`
- Latency ms: `5567.62`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

In Phase 1, public route rate limiting was added as an abuse-control measure for public RAG endpoints [S2, S3, S5]. This rate limiting is controlled by `RAG_RATE_LIMIT_ENABLED`, `RAG_RATE_LIMIT_REQUESTS`, and `RAG_RATE_LIMIT_WINDOW_SECONDS`, which are currentl...

### rag_logs_001 - FAIL

- Category: `architecture`
- Question: What logging improvements exist for Cloud Run operations?
- Failure reasons: `missing_required_terms`
- Latency ms: `7652.21`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, knowledge-base/crc-rag/Architecture 架構圖.md, knowledge-base/crc-rag/Implementation 實作流程.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

For Cloud Run operations, a completed implementation milestone includes structured logging [S4]. Additionally, Cloud Logging supports the evaluation and observability phase by tracking project questions, response time, errors, source usage, and session behavio...

### rag_error_001 - PASS

- Category: `limitations`
- Question: How does the backend handle unsupported answers?
- Failure reasons: ``
- Latency ms: `8094.9`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The backend handles unsupported answers through runtime citation validation. This process replaces any unsupported generated answers with a safe no-answer response before they are returned or saved [S3]. This mechanism is part of the system's design goal for f...

### rag_docs_001 - FAIL

- Category: `ingestion`
- Question: What kind of source documents are ingested for the RAG assistant?
- Failure reasons: `source_mismatch, missing_required_terms`
- Latency ms: `5399.89`
- Sources returned: `gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": false}`

Answer excerpt:

The RAG assistant primarily ingests **Markdown technical documents** as its knowledge source [S1, S2, S5]. These documents include project status records, architecture descriptions, development logs, test records, and deployment documents [S5]. Markdown was ch...

### rag_ci_001 - PASS

- Category: `rag_analytics`
- Question: How does CI currently use RAG evaluation?
- Failure reasons: ``
- Latency ms: `6038.69`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

CI currently uses RAG evaluation by running the evaluator after Cloud Run deployment as part of the `.github/workflows/deploy-backend-gcp.yml` workflow [S5]. The evaluation runs with a `--soft-fail` flag, and it uploads `rag-evaluation-report` and `rag-evaluat...

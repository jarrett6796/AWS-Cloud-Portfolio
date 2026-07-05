# RAG Evaluation Report

- Generated at: `2026-07-04T03:38:03.753362+00:00`
- Base URL: `http://127.0.0.1:8080`
- Questions: `evals/golden_questions.json`
- Soft fail: `True`

## Summary

- Total cases: `50`
- Passed cases: `19`
- Failed cases: `31`
- Overall pass rate: `0.38`
- Source match rate: `0.82`
- Doc type match rate: `0.96`
- Required terms rate: `0.46`
- Forbidden terms rate: `0.98`
- Citation grounding rate: `0.78`
- No-answer accuracy: `0.74`
- Average latency ms: `3932.47`
- P95 latency ms: `6560.19`

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
- missing_citation: `11`
- missing_required_terms: `27`
- source_mismatch: `9`
- wrong_no_answer: `13`

## Results

### rag_arch_001 - FAIL

- Category: `architecture`
- Question: Why does the RAG backend use GCP Cloud Run?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer, doc_type_mismatch`
- Latency ms: `6813.54`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": false, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_arch_002 - PASS

- Category: `architecture`
- Question: Describe the current GCP RAG backend stack.
- Failure reasons: ``
- Latency ms: `5169.32`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/Implementation 實作流程.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The current GCP RAG backend stack is built using FastAPI for process control and is deployed on Cloud Run [S3, S4]. Key components and services include: * **Framework**: FastAPI [S3, S4]. * **Deployment**: Cloud Run [S3]. * **AI Models**: Vertex AI Gemini 2.5...

### rag_arch_003 - PASS

- Category: `architecture`
- Question: What services make up the current AI assistant backend?
- Failure reasons: ``
- Latency ms: `4961.02`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, knowledge-base/crc-rag/Architecture 架構圖.md, knowledge-base/crc-rag/Implementation 實作流程.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The AI assistant backend is composed of several services: * **FastAPI** serves as the API framework [S3, S4, S5]. * **Google Cloud Run** is used as the container platform for deployment [S3, S4]. * **Gemini 2.5 Flash** is the Large Language Model (LLM) [S3]. *...

### rag_arch_004 - FAIL

- Category: `architecture`
- Question: What is the current maturity classification of the backend?
- Failure reasons: `missing_required_terms, forbidden_claim`
- Latency ms: `2757.21`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": false, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The current classification of the backend is "Intermediate RAG with several advanced RAG features implemented" [S1]. It is not yet fully production-grade Advanced RAG [S1].

### rag_retrieval_001 - FAIL

- Category: `retrieval`
- Question: How does current retrieval select relevant chunks?
- Failure reasons: `source_mismatch, missing_required_terms`
- Latency ms: `5898.21`
- Sources returned: `gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": false}`

Answer excerpt:

The current retrieval process selects relevant chunks through a multi-layered strategy designed to balance precision, contextual completeness, and system stability [S1, S2]. Key strategies include: * **Semantic Search** The user's question is converted into a...

### rag_retrieval_002 - PASS

- Category: `retrieval`
- Question: What is the biggest retrieval scalability limitation right now?
- Failure reasons: ``
- Latency ms: `3370.85`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The biggest retrieval scalability limitation is that the current system scans Firestore `document_chunks` in memory and calculates cosine similarity locally [S1, S5]. This means production retrieval still defaults to local Firestore scanning [S4].

### rag_retrieval_003 - FAIL

- Category: `retrieval`
- Question: Is managed vector retrieval implemented today?
- Failure reasons: `missing_required_terms`
- Latency ms: `4246.23`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Yes, managed vector retrieval using Firestore Vector Search has been implemented, deployed, and validated [S2, S3]. The backend now includes a code-gated Firestore Vector Search retrieval backend, and the Firestore vector index for `document_chunks.embedding`...

### rag_retrieval_004 - FAIL

- Category: `retrieval`
- Question: What hybrid retrieval capability exists today?
- Failure reasons: `missing_required_terms`
- Latency ms: `6152.92`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/Implementation 實作流程.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The retrieval strategy currently implemented is a multi-layered design that balances retrieval accuracy, context completeness, and system stability [S2, S3]. It does not rely solely on single vector similarity search but combines several mechanisms [S2, S3]: *...

### rag_ingest_001 - FAIL

- Category: `ingestion`
- Question: How does document ingestion work?
- Failure reasons: `source_mismatch, missing_required_terms, missing_citation, wrong_no_answer`
- Latency ms: `4981.44`
- Sources returned: `gcp-rag-system-design.md, knowledge-base/crc-rag/Implementation 實作流程.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": false}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_ingest_002 - FAIL

- Category: `ingestion`
- Question: What makes ingestion idempotent?
- Failure reasons: `missing_required_terms`
- Latency ms: `4854.57`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/Implementation 實作流程.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The ingestion process is made idempotent by using a `content_hash` to support incremental updates [S5]. When document content is updated, the system can use the `content_hash` to determine if a chunk has truly changed, which avoids reprocessing all documents e...

### rag_ingest_003 - PASS

- Category: `ingestion`
- Question: How is the ingestion endpoint protected?
- Failure reasons: ``
- Latency ms: `3279.86`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/Implementation 實作流程.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The ingestion endpoint, specifically `POST /ingest-docs`, is protected by an admin token [S3, S5]. It requires an `X-Admin-Token` [S3, S5]. The `INGESTION_ADMIN_TOKEN` is passed from GitHub secrets into Cloud Run [S3, S5]. If the token is missing, incorrect, o...

### rag_metadata_001 - FAIL

- Category: `metadata`
- Question: What metadata fields are stored for chunks after Phase 1 hardening?
- Failure reasons: `source_mismatch, missing_required_terms, missing_citation, wrong_no_answer`
- Latency ms: `4342.33`
- Sources returned: `gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": false}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_metadata_002 - FAIL

- Category: `metadata`
- Question: Which metadata filters are supported?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer`
- Latency ms: `3379.13`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/Implementation 實作流程.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_metadata_003 - FAIL

- Category: `metadata`
- Question: What happens if metadata filtering removes every chunk?
- Failure reasons: `source_mismatch, missing_required_terms, missing_citation, wrong_no_answer`
- Latency ms: `5101.56`
- Sources returned: `gcp-rag-system-design.md, knowledge-base/crc-rag/Implementation 實作流程.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": false}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_rewrite_001 - FAIL

- Category: `query_rewrite`
- Question: How does query rewriting handle follow-up questions?
- Failure reasons: `missing_required_terms`
- Latency ms: `3080.52`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Query rewriting turns follow-up questions into standalone retrieval queries [S1].

### rag_rewrite_002 - FAIL

- Category: `query_rewrite`
- Question: What happens if query rewriting fails?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer`
- Latency ms: `6880.99`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_multi_001 - FAIL

- Category: `multi_query`
- Question: What does multi-query retrieval do?
- Failure reasons: `missing_required_terms`
- Latency ms: `3082.8`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/Implementation 實作流程.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Multi-query retrieval generates several search variants and merges the results [S2].

### rag_multi_002 - FAIL

- Category: `multi_query`
- Question: How does multi-query retrieval handle generation failure?
- Failure reasons: `missing_required_terms`
- Latency ms: `4064.99`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/Implementation 實作流程.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Multi-query retrieval includes "No-answer confidence handling" which prevents the assistant from answering when the retrieved context is too weak [S4].

### rag_citation_001 - FAIL

- Category: `citation_validation`
- Question: How are generated answers grounded to returned sources?
- Failure reasons: `source_mismatch, missing_required_terms, missing_citation, wrong_no_answer`
- Latency ms: `4440.95`
- Sources returned: `gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": false}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_citation_002 - FAIL

- Category: `citation_validation`
- Question: What happens to answers without valid source citations?
- Failure reasons: `missing_required_terms`
- Latency ms: `3224.28`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Runtime citation validation replaces unsupported generated answers with a safe no-answer response before they are returned or saved [S4]. The grounded answer prompt requires source ID citations for factual claims [S4].

### rag_rate_001 - PASS

- Category: `rate_limiting`
- Question: Which public RAG endpoints have rate limiting?
- Failure reasons: ``
- Latency ms: `2799.57`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

Public RAG endpoints `/ask-rag` and `/ask-rag-stream` have a lightweight configurable in-memory rate limiter [S1]. This rate limiting is controlled by `RAG_RATE_LIMIT_ENABLED`, `RAG_RATE_LIMIT_REQUESTS`, and `RAG_RATE_LIMIT_WINDOW_SECONDS` [S2]. The deployment...

### rag_rate_002 - PASS

- Category: `rate_limiting`
- Question: Is the current rate limiter distributed production quota enforcement?
- Failure reasons: ``
- Latency ms: `3164.41`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

No, the current rate limiter is a Phase 1 abuse-control measure and not a distributed production quota system [S4]. It is a lightweight in-memory limiter for public RAG endpoints [S1, S4].

### rag_memory_001 - FAIL

- Category: `firestore_memory`
- Question: Where is conversation memory persisted?
- Failure reasons: `source_mismatch, missing_required_terms, missing_citation, wrong_no_answer`
- Latency ms: `3868.9`
- Sources returned: `gcp-rag-system-design.md, knowledge-base/crc-rag/Implementation 實作流程.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": false}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_memory_002 - PASS

- Category: `firestore_memory`
- Question: Are query rewrite audit messages shown to users?
- Failure reasons: ``
- Latency ms: `2548.27`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

No, Firestore system audit messages for query rewriting are backend-only and filtered out of user/assistant conversation context [S2].

### rag_sse_001 - FAIL

- Category: `sse_streaming`
- Question: What SSE events does the streaming RAG endpoint return?
- Failure reasons: `missing_required_terms`
- Latency ms: `3000.9`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, knowledge-base/crc-rag/Implementation 實作流程.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The streaming RAG endpoint, `POST /ask-rag-stream`, streams source metadata first, then answer tokens, and finally a completion event [S2].

### rag_sse_002 - FAIL

- Category: `sse_streaming`
- Question: Does the streaming path still validate citations before returning text?
- Failure reasons: `missing_required_terms`
- Latency ms: `3246.55`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Yes, the streaming path validates the completed generated answer before emitting final SSE token chunks, ensuring the frontend does not display unsupported factual text [S3].

### rag_analytics_001 - FAIL

- Category: `rag_analytics`
- Question: What RAG analytics are recorded?
- Failure reasons: `source_mismatch, missing_required_terms`
- Latency ms: `3405.21`
- Sources returned: `gcp-rag-system-design.md, knowledge-base/crc-rag/Implementation 實作流程.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": false}`

Answer excerpt:

The RAG system records important information for each query to facilitate debugging and performance analysis [S2]. Specifically, it records the query, retrieved chunks, source metadata, generated response content, latency, and error status [S3, S4, S5]. It als...

### rag_analytics_002 - PASS

- Category: `rag_analytics`
- Question: How is the analytics summary endpoint protected?
- Failure reasons: ``
- Latency ms: `3186.24`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The RAG analytics summary endpoint is protected by an `X-Admin-Token` and `INGESTION_ADMIN_TOKEN` guard [S2]. This is the same protection mechanism used for ingestion [S2, S4].

### aws_counter_001 - PASS

- Category: `aws_visitor_counter`
- Question: What services are used by the AWS visitor counter path?
- Failure reasons: ``
- Latency ms: `4062.84`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, knowledge-base/crc-rag/Architecture 架構圖.md, knowledge-base/crc-rag/Implementation 實作流程.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The AWS visitor counter path uses the following services: * S3 for static hosting [S1] * CloudFront for CDN + HTTPS [S1] * API Gateway [S1, S2, S3, S4] * Lambda [S1, S2, S3, S4] * DynamoDB [S1, S2, S3, S4] Additionally, the rebuild of the AWS Visitor Counter i...

### aws_counter_002 - PASS

- Category: `aws_visitor_counter`
- Question: Is the AWS visitor counter currently rebuilt in the new AWS account?
- Failure reasons: ``
- Latency ms: `3692.8`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

No, the AWS visitor counter is not currently rebuilt in the new AWS account [S1]. Its current implementation status is "rebuild required" [S1]. A safe visitor counter fallback has been implemented while the AWS backend rebuild is pending [S2]. Lambda, API Gate...

### cloud_run_001 - FAIL

- Category: `cloud_run`
- Question: What backend service hosts the FastAPI RAG app?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer`
- Latency ms: `3287.81`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, knowledge-base/crc-rag/Architecture 架構圖.md, knowledge-base/crc-rag/Implementation 實作流程.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### cloud_run_002 - FAIL

- Category: `cloud_run`
- Question: What runtime health checks exist for the backend?
- Failure reasons: `missing_required_terms, missing_citation, wrong_no_answer`
- Latency ms: `5872.52`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, knowledge-base/crc-rag/Implementation 實作流程.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": false, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### vertex_001 - FAIL

- Category: `vertex_ai`
- Question: Which Vertex AI model generates answers?
- Failure reasons: `source_mismatch, doc_type_mismatch`
- Latency ms: `3447.14`
- Sources returned: `knowledge-base/crc-rag/Architecture 架構圖.md, knowledge-base/crc-rag/Implementation 實作流程.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": false, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": false}`

Answer excerpt:

The Vertex AI model that generates answers is Vertex AI Gemini [S1, S2, S5]. Specifically, for answer generation, the project uses Vertex AI Gemini 2.5 Flash [S3].

### vertex_002 - PASS

- Category: `vertex_ai`
- Question: Which embedding model is used by the current RAG backend?
- Failure reasons: ``
- Latency ms: `3520.48`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

The current RAG backend uses `text-embedding-005` [S1]. Live embeddings are 768-dimensional [S2].

### limits_001 - FAIL

- Category: `limitations`
- Question: What still prevents this system from being production-grade Advanced RAG?
- Failure reasons: `missing_required_terms`
- Latency ms: `4204.47`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The system is not yet fully production-grade Advanced RAG due to several factors: * Production retrieval still defaults to local Firestore scanning [S1, S2]. * Firestore Vector Search did not outperform the local baseline in the latest live evaluation and is c...

### limits_002 - PASS

- Category: `limitations`
- Question: Is GraphRAG implemented in this backend?
- Failure reasons: ``
- Latency ms: `2974.57`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

No, GraphRAG is not implemented in this backend [S4, S5]. It is considered an optional phase for later development [S5].

### limits_003 - PASS

- Category: `limitations`
- Question: Is Agentic RAG implemented in this backend?
- Failure reasons: ``
- Latency ms: `3342.72`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

No, Agentic RAG is not implemented in this backend [S2]. It is described as closer to enterprise Advanced RAG and more complex than needed for the current portfolio stage [S2]. The current RAG maturity is classified as "Intermediate RAG with several advanced R...

### limits_004 - FAIL

- Category: `limitations`
- Question: Is semantic reranking implemented today?
- Failure reasons: `missing_required_terms`
- Latency ms: `4004.54`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Yes, semantic reranking is implemented [S5]. The backend now includes optional Gemini semantic reranking over compact chunk previews [S5]. It is part of the Phase 4 Advanced RAG local implementation, with disabled-by-default flags exposed in `backend-GCP/app/c...

### no_answer_001 - PASS

- Category: `no_answer`
- Question: What is Jarrett's private bank account number?
- Failure reasons: ``
- Latency ms: `2921.03`
- Sources returned: `knowledge-base/crc-rag/Architecture 架構圖.md, knowledge-base/crc-rag/Overview 綜覽.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: ``
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### no_answer_002 - PASS

- Category: `no_answer`
- Question: What is the exact salary for the next job offer?
- Failure reasons: ``
- Latency ms: `3048.2`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, knowledge-base/crc-rag/Overview 綜覽.md`
- Expected sources: ``
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### no_answer_003 - FAIL

- Category: `no_answer`
- Question: Which unreleased internal company roadmap is Jarrett following?
- Failure reasons: `wrong_no_answer`
- Latency ms: `4433.28`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: ``
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": true, "source_match": true}`

Answer excerpt:

Jarrett is following the "Recommended Next Implementation Order" [S1] and the "Advanced RAG Roadmap — Phase 1 to Phase 5" [S3].

### no_answer_004 - FAIL

- Category: `no_answer`
- Question: What is the password for the GCP service account?
- Failure reasons: `missing_citation, wrong_no_answer`
- Latency ms: `3.46`
- Sources returned: ``
- Expected sources: ``
- Checks: `{"citation_grounding": false, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": true, "source_match": true}`

Answer excerpt:

I can't provide secrets, tokens, API keys, or private credential values. I can explain where configuration belongs and how to rotate credentials safely.

### no_answer_005 - PASS

- Category: `no_answer`
- Question: What production customer data is stored in this portfolio?
- Failure reasons: ``
- Latency ms: `6560.19`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, knowledge-base/crc-rag/Architecture 架構圖.md`
- Expected sources: ``
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

I do not know based on the indexed project documents.

### rag_eval_001 - FAIL

- Category: `retrieval`
- Question: What does the RAG evaluation script validate?
- Failure reasons: `missing_required_terms`
- Latency ms: `3114.81`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

The RAG evaluation validates retrieval source match, required answer keywords, forbidden claims, and source-ID grounding [S4].

### rag_eval_002 - PASS

- Category: `limitations`
- Question: What should be the next RAG architecture upgrade after evaluation?
- Failure reasons: ``
- Latency ms: `4547.66`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

After evaluation, the next RAG architecture upgrade should be Managed Vector Retrieval, which includes implementing Firestore Vector Search or Vertex AI Vector Search [S3]. This is listed as Phase 4 in the Advanced RAG Roadmap [S3] and follows "Project analyti...

### rag_security_001 - PASS

- Category: `rate_limiting`
- Question: What public endpoint protection was added in Phase 1?
- Failure reasons: ``
- Latency ms: `4088.4`
- Sources returned: `CAPSTONE_PROJECT_STATE.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

In Phase 1, a lightweight in-memory rate limiter was added for public RAG endpoints as an abuse-control measure [S2, S5]. This rate limiting is controlled by `RAG_RATE_LIMIT_ENABLED`, `RAG_RATE_LIMIT_REQUESTS`, and `RAG_RATE_LIMIT_WINDOW_SECONDS` [S5].

### rag_logs_001 - FAIL

- Category: `architecture`
- Question: What logging improvements exist for Cloud Run operations?
- Failure reasons: `missing_required_terms`
- Latency ms: `2892.02`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, knowledge-base/crc-rag/Architecture 架構圖.md, knowledge-base/crc-rag/Implementation 實作流程.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": true}`

Answer excerpt:

Phase 2 of the project added several logging improvements for Cloud Run operations, including JSON-formatted Cloud Run logs, request IDs, request duration logs, controlled error logs, and metadata-only service logs for Gemini, GCS, Firestore, ingestion, and RA...

### rag_error_001 - FAIL

- Category: `limitations`
- Question: How does the backend handle unsupported answers?
- Failure reasons: `wrong_no_answer`
- Latency ms: `4805.27`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": false, "required_terms": true, "source_match": true}`

Answer excerpt:

The backend handles unsupported answers through runtime citation validation [S1, S2]. Specifically: * If retrieval yields no selected chunks, the backend skips answer generation and returns "I do not know based on the indexed project documents" [S1]. * If the...

### rag_docs_001 - FAIL

- Category: `ingestion`
- Question: What kind of source documents are ingested for the RAG assistant?
- Failure reasons: `source_mismatch, missing_required_terms`
- Latency ms: `2987.67`
- Sources returned: `gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": false, "source_match": false}`

Answer excerpt:

The RAG assistant ingests **Markdown technical documents** as its primary knowledge source [S1, S2, S5]. These documents serve as the single source of truth for the RAG system [S1, S2]. Specifically, the Markdown technical documents include: * Project status r...

### rag_ci_001 - PASS

- Category: `rag_analytics`
- Question: How does CI currently use RAG evaluation?
- Failure reasons: ``
- Latency ms: `3509.06`
- Sources returned: `CAPSTONE_PROJECT_STATE.md, gcp-rag-system-design.md, knowledge-base/crc-rag/RAG 系統設計.md`
- Expected sources: `CAPSTONE_PROJECT_STATE.md`
- Checks: `{"citation_grounding": true, "doc_type_match": true, "forbidden_terms": true, "no_answer": true, "required_terms": true, "source_match": true}`

Answer excerpt:

CI currently uses RAG evaluation by running the evaluator after Cloud Run deployment with a `--soft-fail` flag [S5]. This process is part of the `.github/workflows/deploy-backend-gcp.yml` workflow [S5]. After execution, it uploads `rag-evaluation-report` and `...

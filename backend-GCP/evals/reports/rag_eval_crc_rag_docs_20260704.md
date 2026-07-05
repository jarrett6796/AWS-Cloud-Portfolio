# CRC-RAG Evaluation Report

- Generated at: `2026-07-04T03:33:38.221223+00:00`
- Total cases: `4`
- Passed cases: `3`
- Failed cases: `1`
- Pass rate: `0.75`

## Results

### crc_rag_architecture - PASS

- Question: What is the overall architecture of the AI-powered multi-cloud portfolio platform?
- Top source: `knowledge-base/crc-rag/Architecture 架構圖.md`
- Top heading: `**Technology Stack｜技術棧總覽**`
- Checks: `{"basic_response_relevance": true, "citation_grounded": true, "citation_presence": true, "not_safe_no_answer": true, "retrieval_source_correctness": true, "source_presence": true}`
- Missing terms: ``
- Cited source IDs: `S1, S2, S5`

Answer excerpt:

The AI-powered multi-cloud portfolio platform utilizes a Multi-Cloud Architecture [S1, S5]. AWS is responsible for website hosting, serverless services [S1], frontend website, and analytics data storage [S5]. GCP provides AI inference, Advanced RAG, and conversation memory functions [S1], as well as...

### crc_rag_retrieval - FAIL

- Question: How does the RAG system retrieve project documentation?
- Top source: `knowledge-base/crc-rag/RAG 系統設計.md`
- Top heading: `4.6.1 Purpose & Design Philosophy（目的與設計理念）`
- Checks: `{"basic_response_relevance": false, "citation_grounded": false, "citation_presence": false, "not_safe_no_answer": false, "retrieval_source_correctness": true, "source_presence": true}`
- Missing terms: `RAG, retrieve`
- Cited source IDs: ``

Answer excerpt:

I do not know based on the indexed project documents.

### crc_rag_implementation - PASS

- Question: What are the main implementation steps of the CRC-RAG project?
- Top source: `knowledge-base/crc-rag/RAG 系統設計.md`
- Top heading: `**4.9 RAG Analytics and Evaluation（RAG 分析與評估）**`
- Checks: `{"basic_response_relevance": true, "citation_grounded": true, "citation_presence": true, "not_safe_no_answer": true, "retrieval_source_correctness": true, "source_presence": true}`
- Missing terms: ``
- Cited source IDs: `S5`

Answer excerpt:

The main implementation steps of the CRC-RAG project, as described in the system design, include: * Knowledge source management [S5] * Document ingestion [S5] * Chunking [S5] * Metadata design [S5] * Retrieval pipeline [S5] * Response generation [S5] * Conversation memory management [S5] * RAG analy...

### crc_rag_services - PASS

- Question: Which AWS and GCP services are used in the capstone project?
- Top source: `knowledge-base/crc-rag/Architecture 架構圖.md`
- Top heading: `**Technology Stack Overview**`
- Checks: `{"basic_response_relevance": true, "citation_grounded": true, "citation_presence": true, "not_safe_no_answer": true, "retrieval_source_correctness": true, "source_presence": true}`
- Missing terms: ``
- Cited source IDs: `S1`

Answer excerpt:

The capstone project utilizes a multi-cloud architecture, incorporating services from both AWS and GCP [S2, S3]. **AWS Services:** * Amazon S3 (Static Website Hosting) [S1, S4] * Amazon CloudFront (Content Delivery Network) [S1, S4] * Amazon API Gateway (API Management) [S1, S4] * AWS Lambda (Server...

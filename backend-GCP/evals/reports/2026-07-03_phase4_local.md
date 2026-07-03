# Phase 4 RAG Evaluation Report

Stub filename convention:

- Markdown: `YYYY-MM-DD_phase4_local.md`
- JSON: `YYYY-MM-DD_phase4_local.json`

Filled report files:

- Markdown: `2026-07-03_phase4_local.md`
- JSON: `2026-07-03_phase4_local.json`
- Raw evaluator Markdown: `2026-07-03_phase4_local_raw.md`
- Raw evaluator JSON: `2026-07-03_phase4_local_raw.json`

## Run Metadata

- Date of run: `2026-07-03`
- Base URL: `https://gcp-rag-backend-189047029621.asia-east1.run.app`
- Questions file: `evals/golden_questions.json`
- vector_search_backend: `local`
- semantic_rerank: `enabled`
- parent_child: `enabled`
- query_rewrite: `disabled`
- multi_query: `disabled`
- rate_limit: `enabled, 100 requests / 60 seconds`
- Evaluator command: `.venv/bin/python scripts/evaluate_rag.py --base-url https://gcp-rag-backend-189047029621.asia-east1.run.app --questions evals/golden_questions.json --output evals/reports/2026-07-03_phase4_local_raw.md --json-output evals/reports/2026-07-03_phase4_local_raw.json --timeout 45 --soft-fail`

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

## Baseline Comparison

- Historical local baseline: `30/50` on 2026-06-24 with `vector_search_backend=local`, before current Phase 4 semantic rerank plus parent-child runtime.
- Historical Firestore Vector Search baseline: `29/50` on 2026-06-25 with `vector_search_backend=firestore_vector`.
- New run comparison: `2026-07-03 Phase 4 local run passed 19/50 (0.38); this regressed by 11 cases versus the historical 30/50 local baseline and by 10 cases versus the historical 29/50 firestore_vector baseline.`

## Failure Categories

| Failure category | Count | Representative examples |
| --- | ---: | --- |
| retrieval miss | 6 | `rag_arch_001`: Why does the RAG backend use GCP Cloud Run? (failed: doc_type_match, required_terms) - Doc-type check failed and the local CAPSTONE source contains the missing FastAPI term, but retrieval returned state/test_record doc types rather than the expected architecture doc type.<br>`rag_retrieval_001`: How does current retrieval select relevant chunks? (failed: source_match, required_terms) - Source match failed: only gcp-rag-system-design.md was returned while the expected CAPSTONE source contains vector/candidate/score wording.<br>`rag_ingest_001`: How does document ingestion work? (failed: source_match, required_terms) - Source match failed and the expected CAPSTONE source contains GCS/chunks/embeddings details; retrieved context produced only a generic ingestion answer. |
| prompt/citation issue | 8 | `rag_rewrite_002`: What happens if query rewriting fails? (failed: required_terms, citation_grounding, no_answer) - The evaluator returned safe no-answer without citations even though expected sources were returned and the source corpus contains fallback/original behavior.<br>`rag_rate_002`: Is the current rate limiter distributed production quota enforcement? (failed: required_terms, citation_grounding, no_answer) - The model returned safe no-answer with no citation even though the expected CAPSTONE source was returned and contains in-memory Phase 1 rate-limit details.<br>`rag_analytics_001`: What RAG analytics are recorded? (failed: required_terms, citation_grounding, no_answer) - The model returned safe no-answer with no citation despite expected sources being returned and the corpus containing latency/source/no-answer analytics fields. |
| source freshness | 3 | `rag_retrieval_003`: Is managed vector retrieval implemented today? (failed: required_terms) - The evaluator expects wording that managed vector retrieval is not implemented, but current docs say Firestore Vector Search is implemented and validated, though not default.<br>`limits_001`: What still prevents this system from being production-grade Advanced RAG? (failed: required_terms) - The answer omits semantic reranker as a remaining blocker because semantic reranking is now live-enabled; older source text and evaluator expectations still treat it as pending.<br>`limits_004`: Is semantic reranking implemented today? (failed: required_terms, citation_grounding, no_answer) - The expected no/semantic-reranker answer is stale: current live config and docs say semantic reranking is implemented and enabled, while older source text still conflicts. |
| evaluator wording/brittleness | 13 | `rag_arch_004`: What is the current maturity classification of the backend? (failed: required_terms, forbidden_terms) - The answer says "Intermediate RAG" and clearly negates production-grade status, but the exact phrase "production-grade Advanced RAG" tripped the forbidden-term check and "advanced RAG" did not satisfy "advanced features".<br>`rag_ingest_002`: What makes ingestion idempotent? (failed: required_terms) - Returned sources include the expected docs and the answer is about idempotent ingestion metadata, but it missed exact required terms deterministic/prunes.<br>`rag_rewrite_001`: How does query rewriting handle follow-up questions? (failed: required_terms) - The answer correctly describes rewriting follow-ups into standalone retrieval queries but missed the exact term original. |
| unclear | 1 | `rag_docs_001`: What kind of source documents are ingested for the RAG assistant? (failed: source_match, doc_type_match, required_terms, forbidden_terms, citation_grounding, no_answer) - The request hit the client-side 45 second timeout, so no retrieved sources, checks, or answer text were captured for categorization. |

## All Failing Questions

| ID | Category | Failed evaluator checks | Failure reasons | Categorization | Justification |
| --- | --- | --- | --- | --- | --- |
| `rag_arch_001` | `architecture` | `doc_type_match, required_terms` | `missing_required_terms, doc_type_mismatch` | retrieval miss | Doc-type check failed and the local CAPSTONE source contains the missing FastAPI term, but retrieval returned state/test_record doc types rather than the expected architecture doc type. |
| `rag_arch_004` | `architecture` | `required_terms, forbidden_terms` | `missing_required_terms, forbidden_claim` | evaluator wording/brittleness | The answer says "Intermediate RAG" and clearly negates production-grade status, but the exact phrase "production-grade Advanced RAG" tripped the forbidden-term check and "advanced RAG" did not satisfy "advanced features". |
| `rag_retrieval_001` | `retrieval` | `source_match, required_terms` | `source_mismatch, missing_required_terms` | retrieval miss | Source match failed: only gcp-rag-system-design.md was returned while the expected CAPSTONE source contains vector/candidate/score wording. |
| `rag_retrieval_003` | `retrieval` | `required_terms` | `missing_required_terms` | source freshness | The evaluator expects wording that managed vector retrieval is not implemented, but current docs say Firestore Vector Search is implemented and validated, though not default. |
| `rag_ingest_001` | `ingestion` | `source_match, required_terms` | `source_mismatch, missing_required_terms` | retrieval miss | Source match failed and the expected CAPSTONE source contains GCS/chunks/embeddings details; retrieved context produced only a generic ingestion answer. |
| `rag_ingest_002` | `ingestion` | `required_terms` | `missing_required_terms` | evaluator wording/brittleness | Returned sources include the expected docs and the answer is about idempotent ingestion metadata, but it missed exact required terms deterministic/prunes. |
| `rag_metadata_001` | `metadata` | `source_match, required_terms` | `source_mismatch, missing_required_terms` | retrieval miss | Source match failed and the answer itself says the retrieved context did not explicitly mention Phase 1 hardening; CAPSTONE contains doc_type and section_path. |
| `rag_rewrite_001` | `query_rewrite` | `required_terms` | `missing_required_terms` | evaluator wording/brittleness | The answer correctly describes rewriting follow-ups into standalone retrieval queries but missed the exact term original. |
| `rag_rewrite_002` | `query_rewrite` | `required_terms, citation_grounding, no_answer` | `missing_required_terms, missing_citation, wrong_no_answer` | prompt/citation issue | The evaluator returned safe no-answer without citations even though expected sources were returned and the source corpus contains fallback/original behavior. |
| `rag_multi_001` | `multi_query` | `required_terms` | `missing_required_terms` | evaluator wording/brittleness | The answer says multi-query generates variants and merges results, but missed the exact dedupe term. |
| `rag_multi_002` | `multi_query` | `required_terms` | `missing_required_terms` | evaluator wording/brittleness | Returned context discusses multi-query behavior but the answer missed fallback/single-query exact wording. |
| `rag_citation_001` | `citation_validation` | `source_match, required_terms` | `source_mismatch, missing_required_terms` | retrieval miss | Source match failed and the answer grounded itself to gcp-rag-system-design.md only while the expected CAPSTONE source contains citation/source grounding details. |
| `rag_citation_002` | `citation_validation` | `required_terms` | `missing_required_terms` | evaluator wording/brittleness | The answer correctly says unsupported answers are replaced with a safe no-answer response, but did not include the canonical phrase do not know based on the indexed documents. |
| `rag_rate_002` | `rate_limiting` | `required_terms, citation_grounding, no_answer` | `missing_required_terms, missing_citation, wrong_no_answer` | prompt/citation issue | The model returned safe no-answer with no citation even though the expected CAPSTONE source was returned and contains in-memory Phase 1 rate-limit details. |
| `rag_memory_001` | `firestore_memory` | `source_match, required_terms` | `source_mismatch, missing_required_terms` | retrieval miss | Source match failed and the answer omitted conversations/session_id even though CAPSTONE contains the Firestore conversation path and session_id details. |
| `rag_sse_001` | `sse_streaming` | `required_terms` | `missing_required_terms` | evaluator wording/brittleness | The answer describes streaming tokens and metadata but omitted the exact done event term. |
| `rag_sse_002` | `sse_streaming` | `required_terms` | `missing_required_terms` | evaluator wording/brittleness | The answer substantively says citation validation happens before return/save, but missed the exact validates term. |
| `rag_analytics_001` | `rag_analytics` | `required_terms, citation_grounding, no_answer` | `missing_required_terms, missing_citation, wrong_no_answer` | prompt/citation issue | The model returned safe no-answer with no citation despite expected sources being returned and the corpus containing latency/source/no-answer analytics fields. |
| `rag_analytics_002` | `rag_analytics` | `required_terms` | `missing_required_terms` | evaluator wording/brittleness | The answer says the endpoint is admin-only but missed the exact X-Admin-Token term. |
| `aws_counter_002` | `aws_visitor_counter` | `required_terms` | `missing_required_terms` | evaluator wording/brittleness | The answer correctly says the counter is pending/rebuild-required, but missed the exact planned term. |
| `cloud_run_001` | `cloud_run` | `required_terms, citation_grounding, no_answer` | `missing_required_terms, missing_citation, wrong_no_answer` | prompt/citation issue | The model returned safe no-answer with no citation even though returned CAPSTONE chunks include Cloud Run and FastAPI hosting details. |
| `vertex_001` | `vertex_ai` | `required_terms` | `missing_required_terms` | evaluator wording/brittleness | The answer identifies Vertex AI Gemini but omitted the exact 2.5 Flash model wording. |
| `limits_001` | `limitations` | `required_terms` | `missing_required_terms` | source freshness | The answer omits semantic reranker as a remaining blocker because semantic reranking is now live-enabled; older source text and evaluator expectations still treat it as pending. |
| `limits_002` | `limitations` | `required_terms, citation_grounding, no_answer` | `missing_required_terms, missing_citation, wrong_no_answer` | prompt/citation issue | The model returned safe no-answer with no citation despite returned CAPSTONE source text containing GraphRAG limitation status. |
| `limits_004` | `limitations` | `required_terms, citation_grounding, no_answer` | `missing_required_terms, missing_citation, wrong_no_answer` | source freshness | The expected no/semantic-reranker answer is stale: current live config and docs say semantic reranking is implemented and enabled, while older source text still conflicts. |
| `no_answer_004` | `no_answer` | `citation_grounding, no_answer` | `missing_citation, wrong_no_answer` | evaluator wording/brittleness | The answer safely refused to provide credentials, but the no-answer detector only recognizes specific do-not-know/indexed-context phrases. |
| `rag_eval_001` | `retrieval` | `required_terms` | `missing_required_terms` | evaluator wording/brittleness | The answer begins to describe the evaluator but missed exact source/keywords/grounded terms in the captured response. |
| `rag_eval_002` | `limitations` | `required_terms, citation_grounding, no_answer` | `missing_required_terms, missing_citation, wrong_no_answer` | prompt/citation issue | The model returned safe no-answer with no citation despite returned roadmap/state sources containing managed-vector/retrieval next-step language. |
| `rag_security_001` | `rate_limiting` | `required_terms, citation_grounding, no_answer` | `missing_required_terms, missing_citation, wrong_no_answer` | prompt/citation issue | The model returned safe no-answer with no citation even though returned CAPSTONE chunks include public route rate limiting. |
| `rag_logs_001` | `architecture` | `required_terms, citation_grounding, no_answer` | `missing_required_terms, missing_citation, wrong_no_answer` | prompt/citation issue | The model returned safe no-answer with no citation even though returned CAPSTONE chunks include structured request logging details. |
| `rag_docs_001` | `ingestion` | `source_match, doc_type_match, required_terms, forbidden_terms, citation_grounding, no_answer` | `latency_timeout` | unclear | The request hit the client-side 45 second timeout, so no retrieved sources, checks, or answer text were captured for categorization. |

## Side Effects

- Live `/ask-rag` requests sent: `50`.
- Client-completed responses: `49`.
- Client timeout responses: `1` (`rag_docs_001`).
- Confirmed records from completed responses, based on documented `/ask-rag` behavior of saving user + assistant messages and one analytics record per completed response: `98` conversation message records + `49` `rag_analytics` records = `147` confirmed records.
- Possible additional records from the timed-out request if it completed server-side after the client timeout: `2` conversation message records + `1` `rag_analytics` record, for a possible total of `150` records.
- Without admin Firestore reads, the timed-out request cannot be confirmed as completed or not completed server-side.

## Hypothesis Assessment

This run contradicts the hypothesis that semantic rerank plus parent-child are net-positive relative to the pre-Phase-4 stored baselines if judged by this evaluator: 19/50 is below both 30/50 local and 29/50 firestore_vector. The evidence is not a clean feature-quality verdict because failures include stale source/evaluator expectations, prompt/citation safe-no-answer behavior, and one timeout.

## Notes

- The evaluator captures answer excerpts, source file names, doc types, source IDs, check booleans, and latency; it does not capture full generated answers or retrieved chunk text.
- `gcp-rag-system-design.md` was returned by the live backend but is not present in this local checkout, so source-corpus checks were direct for `Statement_MD/CAPSTONE_PROJECT_STATE.md` and observational for the design doc.
- No backend behavior files were modified for this measurement task.

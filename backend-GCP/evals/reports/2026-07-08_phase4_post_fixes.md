# Phase 4 RAG Evaluation Report - Post Fixes

Filled report files:

- Markdown: `2026-07-08_phase4_post_fixes.md`
- JSON: `2026-07-08_phase4_post_fixes.json`
- Raw evaluator Markdown: `2026-07-08_phase4_post_fixes_raw.md`
- Raw evaluator JSON: `2026-07-08_phase4_post_fixes_raw.json`

## Run Metadata

- Date of run: `2026-07-08`
- Base URL: `https://gcp-rag-backend-189047029621.asia-east1.run.app`
- Questions file: `evals/golden_questions.json`
- Live Cloud Run revision: `gcp-rag-backend-00034-zww` (confirmed latestReadyRevisionName before run)
- origin/main latest commit: `25438f1` (`fix(ci): point pre-deploy health check at / instead of /healthz`)
- Citation-regex fix: `129ba02`
- Language-consistency fix: `7d0c4cb`
- vector_search_backend: `local`
- semantic_rerank: `enabled`
- parent_child: `enabled`
- query_rewrite: `disabled`
- multi_query: `disabled`
- rate_limit: `enabled, 100 requests / 60 seconds`
- Evaluator command: `.venv/bin/python scripts/evaluate_rag.py --base-url https://gcp-rag-backend-189047029621.asia-east1.run.app --questions evals/golden_questions.json --output evals/reports/2026-07-08_phase4_post_fixes_raw.md --json-output evals/reports/2026-07-08_phase4_post_fixes_raw.json --timeout 45 --soft-fail`

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

## Baseline Comparison

- Historical pre-Phase-4 local baseline: `30/50` (`0.60`).
- Most recent pre-fix Phase-4 run: `19/50` (`0.38`) from commit `32883b5`, revision `gcp-rag-backend-00032`.
- Current post-fix run: `16/50` (`0.32`).
- Versus pre-Phase-4 local baseline: `regressed` by `-14` cases.
- Versus most recent pre-fix Phase-4 run: `regressed` by `-3` cases.

## Important Interpretation Note

The raw evaluator still uses a single-citation regex (`[S1]`) and records grouped citations such as `[S1, S2]` as missing. Several `citation_grounding` failures are therefore evaluator brittleness rather than proof that live answers lack citations. This report preserves the existing evaluator result, as requested, but the raw pass rate likely undercounts grouped-citation answers.

## Failure Categories

| Failure category | Count |
| --- | ---: |
| evaluator wording/brittleness | 18 |
| prompt/citation issue | 1 |
| retrieval miss | 10 |
| source freshness | 4 |
| unsupported expectation | 1 |

## All Failing Questions

| ID | Category | Failed checks | Failure reasons | Classification | Justification |
| --- | --- | --- | --- | --- | --- |
| `rag_arch_001` | `architecture` | `doc_type_match, required_terms` | `missing_required_terms, doc_type_mismatch` | retrieval miss | Doc-type check still misses the expected architecture doc type and the answer omits FastAPI even though Cloud Run context is retrieved. |
| `rag_arch_003` | `architecture` | `citation_grounding` | `missing_citation` | evaluator wording/brittleness | The answer excerpt contains grouped citations like [S3, S5], but the evaluator recorded no cited_source_ids because its citation extractor only recognizes single-source brackets. |
| `rag_arch_004` | `architecture` | `required_terms` | `missing_required_terms` | evaluator wording/brittleness | The answer is substantively correct and says "Intermediate RAG with several advanced RAG features implemented", but the exact required phrase "advanced features" was not matched. |
| `rag_retrieval_001` | `retrieval` | `source_match, required_terms, citation_grounding` | `source_mismatch, missing_required_terms, missing_citation` | retrieval miss | Expected CAPSTONE_PROJECT_STATE.md was not returned; the answer drew from design docs and also used grouped citations that the evaluator missed. |
| `rag_retrieval_003` | `retrieval` | `citation_grounding` | `missing_citation` | evaluator wording/brittleness | The answer includes the expected managed-vector/local-default status, but grouped citations were not extracted by the evaluator. |
| `rag_retrieval_004` | `retrieval` | `required_terms` | `missing_required_terms` | evaluator wording/brittleness | The answer describes the broader retrieval strategy but misses exact required terms optional/keyword/vector. |
| `rag_ingest_001` | `ingestion` | `source_match, required_terms` | `source_mismatch, missing_required_terms` | retrieval miss | Expected CAPSTONE_PROJECT_STATE.md was not returned and the answer omits GCS. |
| `rag_ingest_002` | `ingestion` | `required_terms` | `missing_required_terms` | evaluator wording/brittleness | The answer explains content-hash idempotency but misses exact required terms deterministic/prunes. |
| `rag_metadata_001` | `metadata` | `source_match, required_terms, citation_grounding` | `source_mismatch, missing_required_terms, missing_citation` | retrieval miss | Expected CAPSTONE_PROJECT_STATE.md was not returned and the answer omits doc_type; grouped citations were also missed by the evaluator. |
| `rag_metadata_002` | `metadata` | `required_terms, citation_grounding` | `missing_required_terms, missing_citation` | source freshness | The answer cites older/documentation wording for project/document type/module/tags instead of the current code-supported filter field names file_name/heading/version_id. |
| `rag_metadata_003` | `metadata` | `source_match, required_terms, citation_grounding, no_answer` | `source_mismatch, missing_required_terms, missing_citation, wrong_no_answer` | retrieval miss | Expected CAPSTONE_PROJECT_STATE.md was not returned and the model fell back to a safe no-answer despite related design docs being retrieved. |
| `rag_rewrite_001` | `query_rewrite` | `required_terms` | `missing_required_terms` | evaluator wording/brittleness | The answer correctly says follow-ups are rewritten into standalone retrieval queries, but misses the exact term original. |
| `rag_rewrite_002` | `query_rewrite` | `required_terms, citation_grounding, no_answer` | `missing_required_terms, missing_citation, wrong_no_answer` | prompt/citation issue | The answer remains a safe no-answer for a supported behavior question, though it now includes grouped citations; this is partly improved but still fails required terms/no-answer. |
| `rag_multi_001` | `multi_query` | `required_terms` | `missing_required_terms` | evaluator wording/brittleness | The answer says multi-query generates variants and merges results but misses the exact dedupe term. |
| `rag_multi_002` | `multi_query` | `required_terms` | `missing_required_terms` | evaluator wording/brittleness | The answer is too generic and misses fallback/single-query wording. |
| `rag_citation_001` | `citation_validation` | `source_match, required_terms, citation_grounding` | `source_mismatch, missing_required_terms, missing_citation` | retrieval miss | Expected CAPSTONE_PROJECT_STATE.md was not returned; answer relies on design docs and grouped citations missed by the evaluator. |
| `rag_citation_002` | `citation_validation` | `required_terms` | `missing_required_terms` | evaluator wording/brittleness | The answer describes replacement with safe no-answer, but misses exact do not know/indexed wording. |
| `rag_rate_002` | `rate_limiting` | `citation_grounding` | `missing_citation` | evaluator wording/brittleness | The answer has the expected in-memory/not-distributed conclusion and grouped citations; the remaining failure is evaluator citation extraction. |
| `rag_memory_001` | `firestore_memory` | `source_match, required_terms, citation_grounding` | `source_mismatch, missing_required_terms, missing_citation` | retrieval miss | Expected CAPSTONE_PROJECT_STATE.md was not returned and the answer is too generic, omitting conversations/session_id. |
| `rag_memory_002` | `firestore_memory` | `forbidden_terms, citation_grounding` | `forbidden_claim, missing_citation` | evaluator wording/brittleness | The answer states the audit messages are backend-only/not shown, but exact forbidden-term matching and grouped citations make it fail. |
| `rag_sse_001` | `sse_streaming` | `required_terms` | `missing_required_terms` | evaluator wording/brittleness | The answer describes SSE streaming and metadata but misses exact done event wording. |
| `rag_sse_002` | `sse_streaming` | `required_terms` | `missing_required_terms` | evaluator wording/brittleness | The answer substantively says validation happens before return/save, but misses the exact word validates. |
| `rag_analytics_001` | `rag_analytics` | `source_match, required_terms` | `source_mismatch, missing_required_terms` | retrieval miss | Expected CAPSTONE_PROJECT_STATE.md was not returned and the answer omits no-answer analytics, although it now answers instead of safe no-answer. |
| `rag_analytics_002` | `rag_analytics` | `required_terms` | `missing_required_terms` | evaluator wording/brittleness | The answer says admin-only but misses the exact X-Admin-Token header name. |
| `vertex_001` | `vertex_ai` | `source_match, doc_type_match` | `source_mismatch, doc_type_mismatch` | retrieval miss | The answer is factually good and includes Gemini 2.5 Flash, but it fails because expected CAPSTONE/state source was not returned. |
| `limits_001` | `limitations` | `required_terms` | `missing_required_terms` | source freshness | The evaluator still expects managed vector/semantic reranker as blockers, but semantic reranking has now been deployed live and vector status has changed over time. |
| `limits_002` | `limitations` | `citation_grounding` | `missing_citation` | evaluator wording/brittleness | The answer gives the expected GraphRAG-not-implemented response with grouped citations; the evaluator missed those citations. |
| `limits_004` | `limitations` | `required_terms, citation_grounding` | `missing_required_terms, missing_citation` | source freshness | The expected no/semantic-reranker wording is stale now that the language-consistency deployment confirms semantic reranking-era code is live; retrieved docs still contain conflicting older pending language. |
| `no_answer_004` | `no_answer` | `citation_grounding, no_answer` | `missing_citation, wrong_no_answer` | evaluator wording/brittleness | The answer safely refuses to provide credentials, but the no-answer detector only recognizes do-not-know/indexed-context wording and expects citations even with no sources. |
| `no_answer_005` | `no_answer` | `no_answer` | `wrong_no_answer` | unsupported expectation | The golden case expects no answer, but the indexed corpus contains portfolio data-storage details and the model provides a cited answer. |
| `rag_eval_001` | `retrieval` | `required_terms` | `missing_required_terms` | source freshness | The answer mentions 30 golden questions even though the current golden set is 50; indexed source text appears stale. |
| `rag_security_001` | `rate_limiting` | `citation_grounding` | `missing_citation` | evaluator wording/brittleness | The answer includes the expected rate-limiting protection and grouped citations; the evaluator missed grouped citations. |
| `rag_logs_001` | `architecture` | `required_terms` | `missing_required_terms` | evaluator wording/brittleness | The answer identifies structured logging/Cloud Logging but misses exact required term request. |
| `rag_docs_001` | `ingestion` | `source_match, required_terms` | `source_mismatch, missing_required_terms` | retrieval miss | Expected CAPSTONE_PROJECT_STATE.md was not returned and the answer omits GCS. |

## Side Effects

- Live `/ask-rag` requests sent: `50`.
- Client-completed responses: `50`.
- Client timeout responses: `0`.
- Estimated Firestore records created from completed responses: `100` conversation message records + `50` `rag_analytics` records = `150` records.

## Notes

- No backend behavior files were modified for this measurement task.
- The generated raw evaluator report remains available for per-question excerpts, source files, check booleans, and latencies.

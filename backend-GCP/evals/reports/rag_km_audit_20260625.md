# Phase 2.6 KM Source Audit

- Date: `2026-06-25`
- Backend URL: `https://gcp-rag-backend-189047029621.asia-east1.run.app`
- GCP project: `cloud-resume-ai-rag`
- Firestore collection: `document_chunks`
- GCS bucket: `cloud-resume-ai-rag-docs`

## Knowledge Source Inventory

| Source | Expected | Actual before audit | Actual after audit |
| --- | --- | --- | --- |
| Local committed source | `Statement_MD/CAPSTONE_PROJECT_STATE.md` | Present in repo | Used from `HEAD`, not dirty worktree |
| GCS source | `gs://cloud-resume-ai-rag-docs/CAPSTONE_PROJECT_STATE.md` | Present, 9,135 bytes, updated `2026-06-03T18:06:29Z` | Present, 64,428 bytes, updated `2026-06-24T17:28:13Z` |
| Default local ingest config | `PROJECT_STATE.md`, `Frontend_Development_Log.md` | Did not match live bucket contents | Cloud Run now explicitly uses `CAPSTONE_PROJECT_STATE.md` |
| Golden question expected source | `CAPSTONE_PROJECT_STATE.md` | Indexed, but stale | Indexed from current committed source |

## Firestore Chunk Inventory

| Metric | Before | After |
| --- | ---: | ---: |
| Total chunks | 24 | 23 |
| Distinct source files | 1 | 1 |
| Source files | `CAPSTONE_PROJECT_STATE.md` | `CAPSTONE_PROJECT_STATE.md` |
| Projects | missing | `aws-gcp-rag-capstone` |
| Doc types | missing | `state`, `implementation`, `roadmap`, `test_record` |
| Version IDs | missing | 23 distinct values |
| Updated at range | `2026-06-03T18:57:03Z` to `2026-06-03T18:57:17Z` | `2026-06-24T17:28:22Z` to `2026-06-24T17:28:35Z` |

## Metadata Coverage

| Field | Before | After |
| --- | ---: | ---: |
| `project` | 0 / 24 | 23 / 23 |
| `doc_type` | 0 / 24 | 23 / 23 |
| `section_path` | 0 / 24 | 18 / 23 |
| `source_uri` | 0 / 24 | 23 / 23 |
| `version_id` | 0 / 24 | 23 / 23 |
| `updated_at` | 24 / 24 | 23 / 23 |
| `content_hash` | 24 / 24 | 23 / 23 |

`section_path` remains absent for five headingless chunks, which is expected from the current metadata builder.

## Deployment Configuration Comparison

| Setting | Local current code | Live before audit | Live after audit |
| --- | --- | --- | --- |
| Backend revision/image | Phase 1/2 code in repo | Image from commit `8c3a43e` | Revision `gcp-rag-backend-00018-lq5` from current backend source |
| `GOOGLE_CLOUD_PROJECT` | env-driven | missing | `cloud-resume-ai-rag` |
| `DOCS_BUCKET` | `cloud-resume-ai-rag-docs` | `cloud-resume-ai-rag-docs` | `cloud-resume-ai-rag-docs` |
| `INGEST_DOCUMENTS` | default `PROJECT_STATE.md,Frontend_Development_Log.md` unless set | `PROJECT_STATE.md,Frontend_Development_Log.md` | `CAPSTONE_PROJECT_STATE.md` |
| `DIRECT_CONTEXT_DOCUMENTS` | default `PROJECT_STATE.md,Frontend_Development_Log.md` unless set | `PROJECT_STATE.md,Frontend_Development_Log.md` | `CAPSTONE_PROJECT_STATE.md` |
| `RAG_QUERY_REWRITE_ENABLED` | default false | false | false |
| `RAG_MULTI_QUERY_ENABLED` | default false | false | false |
| `RAG_RATE_LIMIT_ENABLED` | default true | not present in old image summary | true |
| `RAG_RATE_LIMIT_REQUESTS` | default 20 | not present in old image summary | 100 |
| `INGESTION_ADMIN_TOKEN` | env-driven | not configured | removed after reingestion |

## Evaluation Bug Finding

The evaluator used `source_mismatch` for both file-name source mismatches and document-type mismatches. That made the Phase 2.5 report look contradictory: `source_match_rate` was `1.0`, but `source_mismatch` appeared 45 times. The file source metric was correct; the failure category was overloaded. The evaluator now reports `doc_type_mismatch` separately and includes `doc_type_match_rate`.

## Reingestion Actions

- Firestore backup created at `gs://cloud-resume-ai-rag-docs/firestore-backups/phase26-pre-reingest-20260625/`.
- Previous GCS source backed up to `gs://cloud-resume-ai-rag-docs/source-backups/CAPSTONE_PROJECT_STATE_pre_phase26_20260625.md`.
- Committed `HEAD:Statement_MD/CAPSTONE_PROJECT_STATE.md` uploaded to `gs://cloud-resume-ai-rag-docs/CAPSTONE_PROJECT_STATE.md`.
- Current backend source deployed to Cloud Run.
- Temporary ingestion admin token was configured, used once, and removed.
- `/ingest-docs` result: `chunks_created=23`, `chunks_pruned=1`.

## Before And After Evaluation

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| Passed cases | 4 / 50 | 30 / 50 | +26 |
| Overall pass rate | 0.08 | 0.60 | +0.52 |
| Source match rate | 1.00 | 1.00 | 0 |
| Doc type match rate | not reported | 0.98 | n/a |
| Required terms rate | 0.28 | 0.64 | +0.36 |
| Forbidden terms rate | 0.98 | 0.98 | 0 |
| Citation grounding rate | 0.60 | 0.90 | +0.30 |
| No-answer accuracy | 0.46 | 0.86 | +0.40 |
| Average latency ms | 3268.07 | 3866.66 | +598.59 |
| P95 latency ms | 5823.98 | 8583.75 | +2759.77 |

Post-audit evaluation still failed the overall pass threshold of `0.80`. The remaining failures are mostly stricter required-term expectations, no-answer behavior on specific advanced-feature questions, and one forbidden-claim case.

## Root Cause

The live evaluation scored 4 / 50 because the deployed backend and knowledge base were stale:

- Cloud Run was serving an older image from commit `8c3a43e`, not the Phase 1/2 code.
- Runtime env vars did not set `GOOGLE_CLOUD_PROJECT`, `INGEST_DOCUMENTS`, or `DIRECT_CONTEXT_DOCUMENTS` to the current production values.
- GCS contained a 9 KB June 3 version of `CAPSTONE_PROJECT_STATE.md`, while the committed current source is 64 KB.
- Firestore chunks were from June 3 and lacked Phase 1 metadata fields.
- The evaluator also overloaded `source_mismatch` for doc-type mismatches, which made the failure summary misleading.

The main quality problem was stale deployed knowledge and stale deployment configuration, not managed-vector retrieval.

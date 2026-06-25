# Firestore Vector Search Setup

Phase 3A adds an optional Firestore Vector Search retrieval backend for the
RAG service. The default backend remains the existing local full-scan path.

## Runtime Flags

| Env var | Default | Notes |
| --- | --- | --- |
| `RAG_VECTOR_SEARCH_BACKEND` | `local` | Use `firestore_vector` to enable Firestore Vector Search. |
| `RAG_VECTOR_SEARCH_DISTANCE_MEASURE` | `COSINE` | Supported values: `COSINE`, `EUCLIDEAN`, `DOT_PRODUCT`. |
| `RAG_VECTOR_SEARCH_LIMIT` | `20` | Nearest-neighbor candidate count. The service also respects `RAG_CANDIDATE_POOL_SIZE` and `RAG_TOP_K`. |
| `RAG_VECTOR_SEARCH_FALLBACK_ENABLED` | `true` | Falls back to the local full scan if vector search fails. |
| `RAG_FIRESTORE_VECTOR_FIELD` | `embedding` | Firestore vector field used by the nearest-neighbor query. |

## Required Field And Dimension

- Collection: `document_chunks`
- Vector field: `embedding`
- Embedding model: `text-embedding-005`
- Current live embedding dimension: `768`
- Distance measure: `COSINE`

The Phase 3A code writes new ingested embeddings using the Firestore Python
SDK `Vector` type. Existing array-valued embeddings must be reingested before
the `firestore_vector` backend can be used reliably.

## Python SDK Requirement

`google-cloud-firestore>=2.27.0` is required. This version exposes:

- `google.cloud.firestore_v1.vector.Vector`
- `google.cloud.firestore_v1.base_vector_query.DistanceMeasure`
- `CollectionReference.find_nearest(...)`
- `Query.find_nearest(...)`

## Create The Vector Index

Run this after selecting the target GCP project:

```bash
gcloud firestore indexes composite create \
  --project cloud-resume-ai-rag \
  --database="(default)" \
  --collection-group=document_chunks \
  --query-scope=collection \
  --field-config='field-path=embedding,vector-config={"dimension":768,"flat":{}}'
```

Phase 3B live status on 2026-06-25:

- Index creation method: `gcloud firestore indexes composite create`.
- Index name: `projects/cloud-resume-ai-rag/databases/(default)/collectionGroups/document_chunks/indexes/CICAgOjXh4EK`.
- Index status: `READY`.
- Indexed field: `embedding`.
- Vector dimension: `768`.
- Runtime distance measure: `COSINE`.

If exact metadata filters are used with vector search and Firestore asks for a
composite index, create the prompted index as well. Phase 3A applies exact
filters for `project`, `doc_type`, `file_name`, and `version_id` server side.
Substring filters for `heading`, `section_path`, and `source_uri` are still
validated after candidate retrieval.

## Reingest Current Documents

After the index exists, reingest the approved source documents so `embedding`
is stored as a Firestore vector value:

```bash
curl -X POST https://gcp-rag-backend-189047029621.asia-east1.run.app/ingest-docs \
  -H "X-Admin-Token: <admin-token>"
```

Expected behavior:

- Deterministic chunk document IDs are reused.
- Stale chunks for the ingested file are pruned.
- `embedding` is rewritten as a Firestore vector value.
- Existing metadata fields are preserved or regenerated.

Phase 3B reingestion result on 2026-06-25:

- Before reingestion: 23 chunks from `CAPSTONE_PROJECT_STATE.md`, embeddings stored as plain `list`, dimension 768.
- After reingestion: 23 chunks from `CAPSTONE_PROJECT_STATE.md`, embeddings stored as Firestore `Vector`, dimension 768.
- Ingestion response: `chunks_created=23`, `chunks_pruned=0`.
- Metadata coverage after reingestion: `project`, `doc_type`, `source_uri`, `version_id`, and `embedding` on 23/23 chunks; `section_path` on 18/23 chunks.

## Enable Firestore Vector Search

Enable only after the index exists and reingestion succeeds:

```bash
gcloud run services update gcp-rag-backend \
  --project cloud-resume-ai-rag \
  --region asia-east1 \
  --update-env-vars RAG_VECTOR_SEARCH_BACKEND=firestore_vector
```

Rollback:

```bash
gcloud run services update gcp-rag-backend \
  --project cloud-resume-ai-rag \
  --region asia-east1 \
  --update-env-vars RAG_VECTOR_SEARCH_BACKEND=local
```

## Verify

Smoke test:

```bash
curl -X POST https://gcp-rag-backend-189047029621.asia-east1.run.app/ask-rag \
  -H "Content-Type: application/json" \
  -d '{"question":"Explain my GCP RAG architecture","session_id":"vector-smoke-test"}'
```

Evaluation:

```bash
cd backend-GCP
python3 scripts/evaluate_rag.py \
  --base-url https://gcp-rag-backend-189047029621.asia-east1.run.app \
  --questions evals/golden_questions.json \
  --output evals/reports/rag_eval_firestore_vector.md \
  --json-output evals/reports/rag_eval_firestore_vector.json \
  --timeout 45 \
  --soft-fail
```

Runtime evidence:

- `/` should report `vector_search_backend` as `firestore_vector`.
- RAG analytics should record `retrieval_backend` as `firestore_vector`.
- If vector search fails and fallback is enabled, analytics records
  `firestore_vector_fallback`.

Phase 3B live evaluation result:

| Metric | Local full-scan baseline | Firestore vector mode | Delta |
| --- | ---: | ---: | ---: |
| Passed cases | 30 / 50 | 29 / 50 | -1 |
| Overall pass rate | 0.60 | 0.58 | -0.02 |
| Source match rate | 1.00 | 1.00 | 0.00 |
| Doc type match rate | 0.98 | 0.98 | 0.00 |
| Required terms rate | 0.64 | 0.64 | 0.00 |
| Citation grounding rate | 0.90 | 0.92 | +0.02 |
| No-answer accuracy | 0.86 | 0.86 | 0.00 |

Decision:

- Firestore Vector Search is validated as a working live retrieval path.
- Production was reverted to `RAG_VECTOR_SEARCH_BACKEND=local` because vector mode scored one case below the local full-scan baseline.
- Final production revision after rollback: `gcp-rag-backend-00022-7jr`.
- Reports:
  - `backend-GCP/evals/reports/rag_eval_firestore_vector_20260625.md`
  - `backend-GCP/evals/reports/rag_eval_firestore_vector_20260625.json`

## Common Failure Modes

- Missing vector index: Firestore raises a failed-precondition style error;
  the backend falls back to local scan when fallback is enabled.
- Old array embeddings: vector search cannot use array-valued embeddings;
  reingestion is required.
- Wrong dimension: the index dimension must match the query and stored vectors.
- Too-small candidate limit: increase `RAG_VECTOR_SEARCH_LIMIT` if recall drops.
- Text metadata filters: substring filters are applied after vector candidate
  retrieval, so very narrow substring filters may need a larger candidate limit.

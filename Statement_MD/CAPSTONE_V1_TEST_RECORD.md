# Capstone V1 Test Record

## Test Snapshot

- Version label: `V1`
- Tested on: `2026-06-02`
- Frontend: React + Vite portfolio
- AWS path: API Gateway -> Lambda -> DynamoDB visitor counter
- GCP path: Cloud Run FastAPI -> Gemini -> Firestore RAG backend

## V1 Repository Record

V1 should be preserved from the outer capstone Git repository.

Repository convention:

- Track `frontend-Vite/` as normal project files inside the capstone repository.
- Do not keep `frontend-Vite/` as a nested Git repository or submodule.
- Do not copy the whole project into a separate `capstone-v1` folder.
- Use the commit tagged `capstone-v1-working-state` to mark the working V1 snapshot.
- Existing tag `capstone-v1` was already present and points to an earlier documentation commit, so it was not moved.
- Keep this markdown file as the written V1 test and decision record.

## Verification Results

### Frontend

Passed:

```bash
cd frontend-Vite
npm run lint
npm run build
npm run dev -- --host 127.0.0.1
```

Observed local development URL:

```text
http://127.0.0.1:5174/
```

Port `5173` was already in use, so Vite selected port `5174`.

HTTP smoke checks:

- `GET http://localhost:5174/` returned `200`.
- `GET http://localhost:5174/src/main.jsx` returned `200`.

Local development convention after this test:

- Use the developer-managed Vite server at `http://localhost:5173`.
- Do not start a second Vite server or use an automatic fallback port such as `5174`.
- Before testing, check whether `http://localhost:5173` is already available and reuse it.

### AWS Visitor Counter

Endpoint:

```text
https://9u8ml80foj.execute-api.ap-northeast-1.amazonaws.com/views
```

Result:

```json
{"views": 82}
```

The AWS visitor counter path is live.

### GCP RAG Backend

Health endpoint:

```text
GET https://gcp-rag-backend-189047029621.asia-east1.run.app/
```

Result:

```json
{"status":"ok","service":"gcp-rag-backend","phase":"rag-with-cors-mvp"}
```

RAG endpoint:

```text
POST https://gcp-rag-backend-189047029621.asia-east1.run.app/ask-rag
```

Passed:

- Valid requests returned `200`.
- Responses included retrieved Firestore chunk sources.
- Missing `question` input returned FastAPI `422`.

### CORS

Passed:

```text
Origin: http://localhost:5174
```

Rejected:

```text
Origin: http://127.0.0.1:5174
```

This matches the current backend CORS configuration.

## V1 Known Issues

1. RAG content is stale or incomplete. When asked which cloud providers the portfolio currently demonstrates, the deployed assistant answered only `AWS`. The documented current architecture is hybrid AWS and GCP.
2. One architecture response ended mid-sentence. Response generation should be checked for output truncation.
3. The deployed backend CORS configuration allows local Vite origins only. Add the production frontend origin before a public frontend release.
4. Local backend startup was not tested because the current machine does not have the Python backend dependencies installed.
5. Visual browser interaction testing was not completed because the in-app browser was unavailable in this session.

## Recommended Next Task

Refresh the GCS RAG source documents and re-ingest them safely after making ingestion idempotent and protecting `/ingest-docs` from public use.

## Post-V1 RAG Maturity Update

Recorded on: `2026-06-04`

Current RAG classification:

```text
Intermediate RAG with several advanced RAG features implemented.
```

The V1 known issue about stale RAG content has been addressed for the current Cloud Run deployment:

- GCS source was updated to:
  - `CAPSTONE_PROJECT_STATE.md`
- Stale Firestore chunks were cleared from:
  - `document_chunks`
- The RAG index was rebuilt through:
  - `POST /ingest-docs`
- Latest ingestion result:
  - `chunks_created: 24`
  - `chunks_pruned: 0`
- Latest `/ask-rag` responses now include:
  - citation labels such as `[S1]`
  - `source_id`
  - `heading`
  - `content_hash`
  - `vector_score`
  - `keyword_score`

Why current RAG is beyond naive:

- Controlled error handling.
- Structured logging.
- Idempotent ingestion.
- Markdown-aware chunking.
- Token-aware chunking with configurable overlap for oversized paragraph splits.
- Metadata and content hashes.
- Optional metadata filtering by source file name and heading.
- Score thresholds and larger candidate pool.
- Optional hybrid keyword + vector scoring.
- Optional reranking.
- Grounded source-ID citations.
- Runtime citation validation and safe no-answer handling.

Remaining advanced RAG gaps:

- Firestore is still scanned in memory for retrieval.
- No dedicated vector index yet.
- CI/CD now runs the existing RAG evaluation script after backend deployment and uploads the report artifact.

Evaluation script added:

```text
backend-GCP/scripts/evaluate_rag.py
```

Example Cloud Run evaluation command:

```bash
cd backend-GCP
python3 scripts/evaluate_rag.py \
  --base-url https://gcp-rag-backend-189047029621.asia-east1.run.app \
  --output rag_eval_report.md
```

Current CI/CD behavior:

- `.github/workflows/deploy-backend-gcp.yml` runs backend unit tests and compile checks before Cloud Run deployment.
- After deployment, the workflow runs `backend-GCP/scripts/evaluate_rag.py` against the configured backend URL.
- The generated `rag_eval_report.md` is uploaded as the `rag-evaluation-report` artifact.

Runtime citation validation update:

- `/ask-rag` and `/ask-rag-stream` now validate generated answers against returned source IDs.
- If no chunks are retrieved, or if an answer lacks valid source citations, the backend returns `I do not know based on the indexed project documents.`
- This keeps unsupported generated text out of saved Firestore assistant messages and frontend-visible streamed responses.

Token-aware chunking update:

- `backend-GCP/app/services/vector_service.py` now uses token-count budgets for chunk construction.
- Oversized paragraph splits can overlap by `DEFAULT_CHUNK_OVERLAP_TOKENS`.
- Chunking config is included in backend public runtime summaries and startup warnings.

Metadata filtering update recorded on `2026-06-15`:

- `POST /ask-rag` and `POST /ask-rag-stream` accept optional `metadata_filter`.
- Current filters support exact `file_name` matching and case-insensitive heading matching.
- Filtering runs before scoring and falls back to the safe no-answer behavior when no chunks match.

Multi-query retrieval update recorded on `2026-06-15`:

- `backend-GCP/app/config/settings.py` exposes `RAG_MULTI_QUERY_ENABLED`, `RAG_MULTI_QUERY_COUNT`, and `RAG_MULTI_QUERY_MODEL`.
- `backend-GCP/app/services/rag_service.py` can generate retrieval variants, embed the original query plus variants, score chunks across the query set, and dedupe by `file_name` and `chunk_index`.
- `.github/workflows/deploy-backend-gcp.yml` passes the multi-query settings to Cloud Run with the feature disabled by default.
- Added tests for query parsing, query deduplication, multi-query embedding/deduplication, failure fallback, settings summary, and invalid-count startup warning.

RAG analytics update recorded on `2026-06-15`:

- `backend-GCP/app/config/settings.py` exposes the `rag_analytics` Firestore collection in the public runtime summary.
- `backend-GCP/app/services/firestore_service.py` can write metadata-only RAG analytics records.
- `backend-GCP/app/services/rag_service.py` writes analytics records after successful `/ask-rag` and `/ask-rag-stream` responses.
- Analytics records track latency, source count, source file names, max score, no-answer status, citation-validation block status, query rewrite usage, multi-query usage, and metadata-filter usage.
- Analytics records intentionally do not store prompt text, question text, retrieved document text, embeddings, or generated answer text.
- Added tests for metadata-only analytics payloads, analytics write failure fallback, no-answer analytics, citation-validation block analytics, streaming analytics, and settings summary coverage.

RAG analytics summary update recorded on `2026-06-15`:

- `backend-GCP/app/security.py` now exposes a reusable `require_admin_token` helper.
- `backend-GCP/app/routes/rag.py` exposes admin-only `GET /rag-analytics/summary`.
- `backend-GCP/app/services/firestore_service.py` can load recent RAG analytics records.
- `backend-GCP/app/services/rag_service.py` aggregates request count, average latency, average source count, no-answer rate, citation-validation block rate, query rewrite rate, multi-query rate, metadata-filter rate, streaming rate, and top source file usage.
- Added tests for summary aggregation, empty analytics handling, missing-token rejection, and matching-token access.

Previous backend improvements recorded on `2026-06-15`:

- CI/CD RAG evaluation gate.
- Runtime citation validation and safe no-answer handling.
- Token-aware chunking with configurable overlap.
- Phase 2A metadata filtering.
- Phase 2B multi-query retrieval.
- Phase 3A metadata-only RAG analytics records.
- Phase 3B admin-only RAG analytics summary endpoint.

Phase 1 Immediate hardening validation recorded on `2026-06-25`:

- Query rewriting remains opt-in through `RAG_QUERY_REWRITE_ENABLED`, falls back to the original question on failure, uses rewritten text only for retrieval, and keeps the original user question as the final answer prompt target.
- Multi-query retrieval remains opt-in through `RAG_MULTI_QUERY_ENABLED`, supports generated query variants, dedupes candidates by `file_name` and `chunk_index`, and falls back to single-query retrieval on generation failure.
- New ingestion metadata fields are covered by unit tests: `project`, `doc_type`, `section_path`, `source_uri`, `version_id`, `file_name`, `heading`, `chunk_index`, `content_hash`, and `char_count`.
- Expanded metadata filters are covered for exact structured fields and case-insensitive text path fields.
- Public `/ask-rag` rate limiting is covered for allowed and blocked requests; blocked requests return HTTP `429`.
- `backend-GCP/scripts/evaluate_rag.py` now contains 30 golden questions instead of the original 5-case smoke dataset.

Validation commands run:

```bash
cd backend-GCP
python3 -m unittest discover -s tests
python3 -m py_compile main.py app/config/settings.py app/services/rag_service.py app/services/ingestion_service.py app/services/vector_service.py app/services/rate_limit_service.py app/routes/rag.py scripts/evaluate_rag.py
```

Validation result:

- Unit tests passed: 74 tests.
- Compile check passed.

Phase 2 RAG evaluation framework validation recorded on `2026-06-25`:

- Added `backend-GCP/evals/golden_questions.json` with 50 golden questions.
- Updated `backend-GCP/scripts/evaluate_rag.py` to report source match, required terms, forbidden terms, citation grounding, no-answer correctness, latency, threshold pass/fail status, and failure categories.
- Added Markdown and JSON report generation.
- Added threshold controls for overall pass rate, source match rate, citation grounding rate, and average latency.
- Updated backend deployment CI to run the evaluator with the golden dataset, upload Markdown and JSON artifacts, and use soft-fail while the dataset is calibrated.
- Added `backend-GCP/tests/test_rag_eval.py` for evaluator helper logic.

Validation commands run:

```bash
cd backend-GCP
python3 -m unittest discover -s tests
python3 -m py_compile main.py app/config/settings.py scripts/evaluate_rag.py
```

Validation result:

- Unit tests passed: 83 tests.
- Compile check passed.

Phase 2.5 live RAG evaluation calibration recorded on `2026-06-25`:

- Backend URL used: `https://gcp-rag-backend-189047029621.asia-east1.run.app`.
- Health check note: `GET /healthz` returned HTTP `404`; `GET /` returned HTTP `200`, so the documented Cloud Run root URL was used.
- Dataset: `backend-GCP/evals/golden_questions.json` with 50 cases.
- Reports saved:
  - `backend-GCP/evals/reports/rag_eval_live_20260625.md`
  - `backend-GCP/evals/reports/rag_eval_live_20260625.json`

Live evaluation command:

```bash
cd backend-GCP
python3 scripts/evaluate_rag.py \
  --base-url https://gcp-rag-backend-189047029621.asia-east1.run.app \
  --questions evals/golden_questions.json \
  --output evals/reports/rag_eval_live_20260625.md \
  --json-output evals/reports/rag_eval_live_20260625.json \
  --timeout 45 \
  --soft-fail
```

Baseline result:

- Passed cases: 4 / 50.
- Overall pass rate: `0.08`.
- Source match rate: `1.0`.
- Required terms rate: `0.28`.
- Forbidden terms rate: `0.98`.
- Citation grounding rate: `0.6`.
- No-answer accuracy: `0.46`.
- Average latency: `3268.07 ms`.
- P95 latency: `5823.98 ms`.
- Failed thresholds: `overall_pass_rate`, `citation_grounding_rate`.

Calibration decision:

- No dataset records were removed or weakened.
- No thresholds were lowered.
- CI remains soft-fail.
- Main causes: live chunks did not return `doc_type` metadata, several answers reflected stale indexed docs, and no-answer/citation behavior needs another pass after reingestion.

Phase 2.6 KM source audit and reingestion validation recorded on `2026-06-25`:

- Root cause: live Cloud Run was serving older backend image commit `8c3a43e`, GCS held a stale June 3 source file, and Firestore chunks were missing Phase 1 metadata.
- Firestore before: 24 chunks, all from `CAPSTONE_PROJECT_STATE.md`, with 0 / 24 coverage for `project`, `doc_type`, `section_path`, `source_uri`, and `version_id`.
- GCS before: `CAPSTONE_PROJECT_STATE.md`, 9,135 bytes, updated `2026-06-03T18:06:29Z`.
- GCS after: committed `HEAD:Statement_MD/CAPSTONE_PROJECT_STATE.md`, 64,428 bytes, uploaded to `gs://cloud-resume-ai-rag-docs/CAPSTONE_PROJECT_STATE.md`.
- Backup paths:
  - `gs://cloud-resume-ai-rag-docs/firestore-backups/phase26-pre-reingest-20260625/`
  - `gs://cloud-resume-ai-rag-docs/source-backups/CAPSTONE_PROJECT_STATE_pre_phase26_20260625.md`
- Reingestion result: `chunks_created=23`, `chunks_pruned=1`.
- Firestore after: 23 chunks; `project`, `doc_type`, `source_uri`, and `version_id` coverage is 23 / 23; `section_path` coverage is 18 / 23.
- Evaluator fix: doc-type mismatches are now reported as `doc_type_mismatch`, and reports include `doc_type_match_rate`.
- Live evaluation after audit: 30 / 50 cases passed, pass rate `0.60`, citation grounding `0.90`, no-answer accuracy `0.86`.
- CI remains soft-fail because overall pass rate is still below the `0.80` threshold.

Phase 3A Firestore Vector Search migration recorded on `2026-06-25`:

- Added config-gated Firestore Vector Search retrieval with local full-scan fallback.
- Default backend remains `local`.
- `firestore_vector` mode requires Firestore vector index creation and reingestion before live verification.
- New env vars: `RAG_VECTOR_SEARCH_BACKEND`, `RAG_VECTOR_SEARCH_DISTANCE_MEASURE`, `RAG_VECTOR_SEARCH_LIMIT`, `RAG_VECTOR_SEARCH_FALLBACK_ENABLED`, and `RAG_FIRESTORE_VECTOR_FIELD`.
- Required SDK: `google-cloud-firestore>=2.27.0`.
- Current embedding dimension: 768.
- Index setup guide: `backend-GCP/docs/firestore_vector_search.md`.
- Validation result: backend unit tests passed with 91 tests, and compile check passed.
- Live vector-search evaluation was not run because the vector index is not created yet.

## Post-V1 Frontend Portfolio Update

Recorded on: `2026-06-04`

The frontend Portfolio section has been updated after the V1 snapshot:

- Visible section title changed from `Projects` to `Portfolio`.
- Added a Notion-gallery-style portfolio layout, then evolved it into vertically stacked case-study cards.
- Added `frontend-Vite/src/components/PortfolioCaseStudies.jsx`.
- Featured card is now `AWS Cloud Resume + GCP RAG`.
- Featured card and supporting cards use the same wide horizontal case-study structure and open the existing project modal.
- Supporting cards are stacked vertically with neutral borders.
- All cards now use the same shape, ratio, layout, preview size, title size, spacing, and typography.
- Capstone card differs only through an AWS-orange `#FF9900` frame/border.
- The previous `Featured Capstone` badge was removed.
- Capstone type label now renders as `CAPSTONE PROJECT`.
- Each card includes a non-interactive `View more →` affordance inside the card button.
- Featured card supports a Draw.io architecture image exported to:

```text
frontend-Vite/public/architecture/aws-gcp-rag-architecture.png
```

- The featured image uses `object-fit: contain`.
- If the image file is missing, the UI falls back to the architecture-style preview.
- A subtle AWS-orange accent border is used for the capstone card.

Preserved behavior:

- `/ask-rag` frontend behavior was not modified.
- AWS visitor counter behavior was not modified.
- Project modal behavior was preserved.
- No new UI dependencies were added.

Frontend verification:

```bash
cd frontend-Vite
npm run lint
npm run build
```

Result:

- `npm run lint` passed.
- `npm run build` passed.

## Post-V1 Persistent Chat and Streaming Update

Recorded on: `2026-06-05`

Persistent backend conversation memory has been added after the V1 snapshot:

- Frontend sends `session_id` with assistant requests.
- Active browser session ID is stored in:

```text
portfolioAssistantSessionId
```

- Firestore now stores conversation messages at:

```text
conversations/{session_id}/messages/{message_id}
```

- Message records store:
  - `role`
  - `content`
  - `created_at`
  - `request_id`
- Backend loads recent Firestore conversation messages before prompt construction.
- Backend saves both user and assistant messages.
- Retrieved RAG documents remain the only factual grounding source.

Frontend streaming response support has also been added:

- Frontend now calls:

```text
POST /ask-rag-stream
```

- Stream events consumed:
  - `metadata`
  - `token`
  - `done`
  - `error`
- Answer tokens are rendered progressively in the AI assistant panel.
- Source rendering from metadata is preserved.
- `/ask-rag` remains as fallback if streaming fails.
- New Chat behavior is preserved.

Browser verification:

- Tested local frontend at:

```text
http://localhost:5173
```

- Test question:

```text
Explain my RAG architecture
```

- Playwright network inspection confirmed:
  - frontend called `POST /ask-rag-stream`
  - request payload included `session_id`
  - response was `text/event-stream`
  - `/ask-rag` fallback was not called during the successful streaming path
- Playwright UI inspection confirmed:
  - answer text visibly grew before the request completed
  - sources rendered
  - final answer remained after `done`
  - `portfolioAssistantSessionId` remained in `localStorage`

Verification:

```bash
cd frontend-Vite
npm run lint
npm run build
```

Result:

- `npm run lint` passed.
- `npm run build` passed.
- Existing local frontend server on `http://localhost:5173` returned `200`.
- No second Vite server was started.

## Post-V1 Production AI Assistant Connection Test

Recorded on: `2026-06-05`

Live production site:

```text
https://dvzu3s2gq6iw.cloudfront.net
```

Backend:

```text
https://gcp-rag-backend-189047029621.asia-east1.run.app
```

Test objective:

- Determine why the AI assistant worked locally but failed on the deployed CloudFront site with:

```text
Could not connect to the AI backend. Please try again.
```

Repository inspection:

- Inspected:
  - `frontend-AWS/src/api/chat.js`
  - `frontend-AWS/src/hooks/useAssistantChat.js`
  - `frontend-AWS/src/components/ChatPanel.jsx`
  - `frontend-AWS/vite.config.js`
  - `.github/workflows/deploy-frontend.yml`
  - `.github/workflows/deploy-backend-gcp.yml`
  - `backend-GCP/main.py`
  - `backend-GCP/app/config/settings.py`
- Verified frontend request flow:
  - streaming path: `POST /ask-rag-stream`
  - fallback path: `POST /ask-rag`
  - request payload includes `session_id`

Production browser observations before fix:

- Initial site load succeeded.
- Visitor counter worked.
- AI assistant opened successfully.
- Production JavaScript bundle contained:
  - `gcp-rag-backend-189047029621.asia-east1.run.app`
  - `/ask-rag-stream`
  - `/ask-rag`
- AI assistant test question:

```text
Explain my RAG architecture
```

- Browser result:
  - assistant displayed the connection error.
  - console showed streaming request failure:
    - `TypeError: Failed to fetch`
  - console showed fallback request failure:
    - `TypeError: Failed to fetch`

CORS preflight before fix:

```bash
curl -i -X OPTIONS https://gcp-rag-backend-189047029621.asia-east1.run.app/ask-rag-stream \
  -H "Origin: https://dvzu3s2gq6iw.cloudfront.net" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"
```

Result:

```text
HTTP/2 400
Disallowed CORS origin
```

Root cause:

- Cloud Run backend CORS allowed local frontend origins but did not allow the deployed CloudFront frontend origin.

Fix verified:

- Added CloudFront production origin:

```text
https://dvzu3s2gq6iw.cloudfront.net
```

- Updated backend deployment env var:

```text
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,https://dvzu3s2gq6iw.cloudfront.net
```

- Fixed gcloud comma parsing with custom delimiter syntax:

```text
--set-env-vars "^|^CORS_ALLOWED_ORIGINS=$CORS_ALLOWED_ORIGINS"
```

Deployment verification:

- Frontend deployment workflow completed successfully.
- Backend deployment workflow initially failed once due comma parsing.
- Backend deployment workflow succeeded after delimiter fix.
- Cloud Run revision:

```text
gcp-rag-backend-00012-pbg
```

- Revision served 100% of traffic.

CORS preflight after fix:

```text
HTTP/2 200
access-control-allow-origin: https://dvzu3s2gq6iw.cloudfront.net
```

Live browser verification after fix:

- Opened fresh CloudFront page.
- Confirmed production frontend served new asset:
  - `assets/index-DR3zkVht.js`
- Opened AI assistant.
- Submitted:

```text
Explain my RAG architecture
```

- Result:
  - assistant successfully sent request to backend.
  - assistant returned a grounded RAG answer.
  - citations and sources rendered.
  - previous connection error did not recur.

Verification commands:

```bash
npm --prefix frontend-AWS run lint
npm --prefix frontend-AWS run build
cd backend-GCP
python3 -m py_compile main.py app/config/settings.py
python3 -m unittest tests/test_settings.py
```

Result:

- Frontend lint passed.
- Frontend build passed.
- Backend compile check passed.
- Backend settings tests passed.

Commits:

- `47e1aa9` — backend CORS fix and regression test.
- `c0b52f8` — Cloud Run deployment env-var delimiter fix.

Screenshot evidence captured:

```text
/private/tmp/cloudfront-initial.png
/private/tmp/cloudfront-chat-after.png
/private/tmp/cloudfront-after-fix-response.png
```

## Post-V1 Project Modal Tab Update

Recorded on: `2026-06-04`

The project modal content structure was refined after the Portfolio case-study card update:

- Replaced the older modal tab structure with:
  - `Overview`
  - `Architecture`
  - `Challenges`
  - `Documentation`
- Removed/replaced old modal tabs:
  - `Tech Stack`
  - `Lessons Learned`
- Kept project title and technology tags visible in the modal header.
- Added capstone-specific modal content for:
  - project summary, goal, primary technologies, and current status
  - architecture diagram placeholder/image area, service flow, explanation, and system layers
  - engineering challenges with challenge/solution/outcome structure
  - documentation hub cards for diagrams, development log, test records, deployment notes, and roadmap
- Preserved project modal open/close behavior.
- Preserved Project AI workspace behavior.
- Preserved language switching and dark/light theme behavior.
- Preserved `/ask-rag`, AWS visitor counter, backend files, navbar, hero, contact, AI assistant, and Portfolio case-study card behavior.

Frontend verification:

```bash
cd frontend-Vite
npm run lint
npm run build
```

Result:

- `npm run lint` passed.
- `npm run build` passed.

## Post-V1 Project Modal Stability Update

Recorded on: `2026-06-10`

The Project Modal layout was refined after the tab structure update:

- Fixed modal dimensions across Overview, Architecture, Challenges, and Documentation.
- Kept the modal header and tab row fixed.
- Preserved independent scrolling in the tab content panel only.
- Removed technology, service, and skill badges from the modal header.
- Reduced excess internal spacing while preserving readability.
- Added scroll-to-top behavior when switching tabs.
- Preserved project title, close button, language switch, theme toggle, and tab navigation.
- Preserved Portfolio card open behavior, global AI assistant behavior, backend files, and AWS visitor counter behavior.

Screenshot evidence:

```text
frontend-AWS/screenshots/modal-before/modal-overview-before.png
frontend-AWS/screenshots/modal-before/modal-architecture-before.png
frontend-AWS/screenshots/modal-before/modal-challenges-before.png
frontend-AWS/screenshots/modal-before/modal-documentation-before.png
frontend-AWS/screenshots/modal-after/modal-overview-after.png
frontend-AWS/screenshots/modal-after/modal-architecture-after.png
frontend-AWS/screenshots/modal-after/modal-challenges-after.png
frontend-AWS/screenshots/modal-after/modal-documentation-after.png
frontend-AWS/screenshots/modal-after/modal-scrollable-content.png
frontend-AWS/screenshots/modal-after/modal-fixed-header.png
frontend-AWS/screenshots/modal-after/modal-fixed-tabs.png
```

Browser verification:

- Production before check at `https://dvzu3s2gq6iw.cloudfront.net/` reproduced the modal jump:
  - Overview: `1280px x 558px`
  - Architecture: `1280px x 880px`
  - Challenges: `1280px x 880px`
  - Documentation: `1280px x 880px`
- Local after check at `http://127.0.0.1:5173/` confirmed fixed desktop dimensions:
  - Overview: `1280px x 880px`
  - Architecture: `1280px x 880px`
  - Challenges: `1280px x 880px`
  - Documentation: `1280px x 880px`
- Local mobile check confirmed fixed mobile dimensions:
  - Overview: `370px x 824px`
  - Architecture: `370px x 824px`
  - Challenges: `370px x 824px`
  - Documentation: `370px x 824px`

## Post-V1 Project Modal Documentation Portal Update

Recorded on: `2026-06-16`

The Project Modal was refactored after the stability update:

- Removed the old top navigation tab row.
- Added a Docusaurus/GitBook-style left sidebar.
- Added three markdown-style document contexts:
  - Overview
  - Architecture
- Implementation
- Sidebar categories expand or collapse without changing the active document.
- Section links scroll to anchors inside `Overview.md`, `Architecture.md`, or `Implementation.md`.
- Added markdown-style content rendering for headings, lists, tables, code blocks, blockquotes, links, and image/diagram figures.
- Preserved fixed modal dimensions and content-only scrolling.
- Preserved language switch, theme switch, close behavior, project card behavior, global AI assistant behavior, backend behavior, and AWS visitor counter behavior.

Verification:

- `npm run lint` passed in `frontend-AWS`.
- `npm run build` passed in `frontend-AWS`.
- Local browser verification confirmed a two-column desktop docs layout, a stacked narrow layout, user-controlled collapsible sidebar groups, section-anchor navigation, and no old tab roles in the modal.
- Modal shell remained `overflow: hidden`.
- Tab panel remained `overflow-y: auto`.
- Modal header and tabs remained fixed while content scrolled.
- Technology tag count in the modal header was `0`.
- Switching tabs after scrolling reset the content panel from `420px` to `0px`.

Frontend verification:

```bash
cd frontend-AWS
npm run lint
npm run build
```

Result:

- `npm run lint` passed.
- `npm run build` passed.

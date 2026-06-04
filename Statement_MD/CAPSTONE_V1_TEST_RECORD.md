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
- Metadata and content hashes.
- Score thresholds and larger candidate pool.
- Optional hybrid keyword + vector scoring.
- Optional reranking.
- Grounded source-ID citations.

Remaining advanced RAG gaps:

- Firestore is still scanned in memory for retrieval.
- No dedicated vector index yet.
- No persistent chat history yet.
- No streaming responses yet.
- No CI-based RAG evaluation yet.

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
- Existing local frontend server on `http://localhost:5173` returned `200`.
- No second Vite server was started.

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

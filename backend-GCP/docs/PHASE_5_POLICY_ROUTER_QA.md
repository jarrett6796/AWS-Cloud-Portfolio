# Phase 5 Policy / Router QA

This checklist validates the local Phase 5 policy/router behavior for both RAG
endpoints:

- `POST /ask-rag`
- `POST /ask-rag-stream`

It is for local/manual QA only. Do not deploy before these checks pass.

## Start the Local Backend

From `backend-GCP/`, start the FastAPI app with the same local command used for
backend development. A typical local command is:

```bash
uvicorn main:app --host 0.0.0.0 --port 8080
```

Use the matching URL when running the QA script if your local port differs.

## Run the QA Script

From `backend-GCP/`:

```bash
python3 scripts/qa_policy_router.py --base-url http://localhost:8080
```

For non-streaming checks only:

```bash
python3 scripts/qa_policy_router.py --base-url http://localhost:8080 --skip-streaming
```

## What It Checks

The script sends policy/router QA cases for:

- Prompt injection
- Secret or credential requests
- Greeting
- Capability question
- Vague query
- Normal RAG question
- Strict source question
- Missing-source question

For `/ask-rag`, it verifies the existing response keys are still present:

- `question`
- `answer`
- `session_id`
- `sources`
- `retrieval_query`
- `query_rewritten`

For `/ask-rag-stream`, it verifies SSE event names remain within the existing
contract:

- `metadata`
- `token`
- `done`
- `error`

Short-circuit policy/router responses must emit only:

- `metadata`
- one or more `token`
- `done`

The script fails if new policy-specific SSE events appear, including:

- `policy`
- `route`
- `guardrail`
- `refusal`
- `clarification`

## Pass / Fail

- `PASS`: Required endpoint and contract checks passed.
- `WARNING`: A non-contract content expectation was not observed, often because
  local documents may not be ingested.
- `FAIL`: A critical contract, safety, request, or sensitive-content check
  failed.

The script exits non-zero if any critical `FAIL` result is found.

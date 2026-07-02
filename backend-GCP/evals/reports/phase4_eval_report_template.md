# Phase 4 RAG Evaluation Report Template

Stub filename convention:

- Markdown: `YYYY-MM-DD_phase4_local.md`
- JSON: `YYYY-MM-DD_phase4_local.json`

Use this template only after a real 50-question evaluation run has completed. Do not fill result fields without raw evaluator output.

## Run Metadata

- Date of run: `YYYY-MM-DD`
- Base URL: `TBD`
- Questions file: `evals/golden_questions.json`
- vector_search_backend: `local`
- semantic_rerank: `enabled`
- parent_child: `enabled`
- query_rewrite: `disabled`
- multi_query: `disabled`
- rate_limit: `enabled, 100 requests / 60 seconds`
- Evaluator command: `python3 scripts/evaluate_rag.py --base-url <url> --questions evals/golden_questions.json --output evals/reports/YYYY-MM-DD_phase4_local.md --json-output evals/reports/YYYY-MM-DD_phase4_local.json --timeout 45 --soft-fail`

## Summary

- Total cases: `TBD`
- Passed cases: `TBD`
- Failed cases: `TBD`
- Overall pass rate: `TBD`
- Source match rate: `TBD`
- Citation grounding rate: `TBD`
- No-answer accuracy: `TBD`
- Average latency ms: `TBD`
- P95 latency ms: `TBD`

## Baseline Comparison

- Historical local baseline: `30/50` on 2026-06-24 with `vector_search_backend=local`, before current Phase 4 semantic rerank plus parent-child runtime.
- Historical Firestore Vector Search baseline: `29/50` on 2026-06-25 with `vector_search_backend=firestore_vector`.
- New run comparison: `TBD - improved / regressed / stayed flat versus 30/50 local and 29/50 firestore_vector baselines.`

## Failure Categories

- `TBD`

## Notes

- This report should state whether Phase 4 improved, regressed, or stayed flat against both historical baselines.
- If thresholds fail, keep the failure visible; do not lower thresholds to make the report pass.

# GCP RAG Backend Import Notes

Known production references:

- GCP project: `cloud-resume-ai-rag`
- Cloud Run service: `gcp-rag-backend`
- Cloud Run region: `asia-east1`
- Cloud Run URL: `https://gcp-rag-backend-189047029621.asia-east1.run.app`
- Vertex AI location used by backend: `us-central1`
- Docs bucket: `cloud-resume-ai-rag-docs`

Current production CORS runtime allowlist should include:

- `http://localhost:5173`
- `http://localhost:5174`
- `http://127.0.0.1:5173`
- `http://127.0.0.1:5174`
- `https://aws-cloudresume-gcprag-jarrett.cc`
- `https://www.aws-cloudresume-gcprag-jarrett.cc`
- `https://d338amzpyv3o5b.cloudfront.net`

Do not update Cloud Run runtime configuration from Terraform until the live service configuration has been exported, reviewed, and imported.

## Prepared Import Commands

Prepared but not executed:

This command may require a temporary reviewed var-file for `container_image`. Do not use a guessed image.

```sh
terraform import google_cloud_run_v2_service.rag_backend projects/cloud-resume-ai-rag/locations/asia-east1/services/gcp-rag-backend
```

IAM import guidance, not yet executable until live bindings are confirmed:

```sh
# TODO_IMPORT_REQUIRED: replace MEMBER with the confirmed existing invoker member.
terraform import google_cloud_run_v2_service_iam_member.public_invoker "projects/cloud-resume-ai-rag/locations/asia-east1/services/gcp-rag-backend roles/run.invoker MEMBER"
```

## TODO_IMPORT_REQUIRED

- Export current Cloud Run container image.
- Export current Cloud Run service account, CPU/memory/concurrency/min-max instance settings, timeout, ingress, VPC, traffic split, and annotations.
- Export current IAM policy before declaring any Cloud Run IAM resource.
- Confirm whether live `INGEST_DOCUMENTS` and `DIRECT_CONTEXT_DOCUMENTS` are `CAPSTONE_PROJECT_STATE.md` as documented in repo reports.
- Keep `var.container_image` unset until the live value is known, so an accidental plan cannot invent an image.

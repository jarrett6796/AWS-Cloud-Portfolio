# GCP RAG Backend Import Notes

Known production references:

- GCP project: `cloud-resume-ai-rag`
- Cloud Run service: `gcp-rag-backend`
- Cloud Run region: `asia-east1`
- Cloud Run URL: `https://gcp-rag-backend-189047029621.asia-east1.run.app`
- Cloud Run status URL also reported by live service: `https://gcp-rag-backend-j5kuoum37a-de.a.run.app`
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

## Verified Live Inventory

| Area | Verified value |
| --- | --- |
| Latest ready revision | `gcp-rag-backend-00029-x6s` |
| Container image | `asia-east1-docker.pkg.dev/cloud-resume-ai-rag/cloud-run-source-deploy/gcp-rag-backend@sha256:3695901c3e67894b5a7a43c129e7f93f33216eb933d699f783c1963268822243` |
| Runtime service account | `189047029621-compute@developer.gserviceaccount.com` |
| Ingress | All traffic |
| Traffic split | 100% latest revision |
| Container port | `8080` |
| Timeout | `300s` |
| Concurrency | `80` |
| Max scale | `3` |
| CPU/memory | `1000m` / `512Mi` |
| Public invoker IAM | `roles/run.invoker` for `allUsers` |
| Docs bucket location | `ASIA-EAST1` |
| Vector search backend | `local` |

## Prepared Import Commands

Prepared but not executed:

This command may require a temporary reviewed var-file for `container_image`. Do not use a guessed image.

```sh
terraform import google_cloud_run_v2_service.rag_backend projects/cloud-resume-ai-rag/locations/asia-east1/services/gcp-rag-backend
terraform import google_cloud_run_v2_service_iam_member.public_invoker "projects/cloud-resume-ai-rag/locations/asia-east1/services/gcp-rag-backend roles/run.invoker allUsers"
```

## TODO_IMPORT_REQUIRED

- Decide whether Terraform should eventually own Artifact Registry, the source-deploy bucket, and the docs bucket, or leave them referenced-only.
- Review Cloud Run annotations before any plan; this module intentionally keeps `ignore_changes = all` during import reconciliation.

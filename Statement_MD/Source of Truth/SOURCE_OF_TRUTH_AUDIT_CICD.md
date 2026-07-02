# Source of Truth Audit - CI/CD

## Audit Date

2026-06-27

## Purpose

This report records the GitHub Actions workflows, trigger modes, secret dependencies, production mutation risk, and future monitoring workflow options.

## Workflow Inventory

| Workflow | Type | Trigger mode | Production mutation risk |
| --- | --- | --- | --- |
| `.github/workflows/frontend-check.yml` | Check | `push`, `pull_request`, `workflow_dispatch` | No deploy commands |
| `.github/workflows/backend-aws-check.yml` | Check | `push`, `pull_request`, `workflow_dispatch` | No deploy commands |
| `.github/workflows/backend-gcp-check.yml` | Check | `push`, `pull_request`, `workflow_dispatch` | No deploy commands |
| `.github/workflows/terraform-check.yml` | Check | `push`, `pull_request`, `workflow_dispatch` | No apply/import/destroy commands |
| `.github/workflows/deploy-frontend.yml` | Deploy | `workflow_dispatch` only | Deploys frontend to S3 and invalidates CloudFront when manually run |
| `.github/workflows/deploy-backend-gcp.yml` | Deploy | `workflow_dispatch` only | Builds, pushes, and deploys Cloud Run when manually run |

## Check Workflows

| Workflow | Validation |
| --- | --- |
| Frontend Check | `npm ci`, `npm run build` in `frontend-React/` |
| AWS Backend Check | Python compile check; optional Node install/tests if package metadata exists |
| GCP Backend Check | Python dependency install, compile, unit tests |
| Terraform Check | `terraform fmt -check -recursive terraform`, `terraform init -backend=false`, `terraform validate` per module |

Check workflows are allowed to run automatically because they do not deploy or mutate production.

## Deploy Workflows

| Workflow | Manual-only action |
| --- | --- |
| Deploy Frontend to AWS | Builds `frontend-React`, syncs `dist/` to S3, invalidates CloudFront |
| Deploy Backend to GCP Cloud Run | Builds Docker image, pushes to Artifact Registry, deploys Cloud Run, uploads RAG eval artifacts |

Deploy workflows remain manual-only through:

```yaml
workflow_dispatch:
```

## Secrets Dependency

Frontend deploy secrets:

- `VITE_GCP_RAG_API_URL`
- `VITE_AWS_VISITOR_API_URL`
- `VITE_AWS_PROJECTS_API_BASE_URL`
- `VITE_AWS_CONTACT_API_URL`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `S3_BUCKET`
- `CLOUDFRONT_DISTRIBUTION_ID`

GCP backend deploy secrets and variables:

- `GCP_PROJECT_ID`
- `GCP_REGION`
- `GCP_SERVICE_NAME`
- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_SERVICE_ACCOUNT`
- `INGESTION_ADMIN_TOKEN`
- `RAG_EVAL_BASE_URL`
- RAG evaluation threshold variables

## Production Mutation Risk

Automatic production mutation risk is currently controlled because deploy workflows are not triggered on `push` or `pull_request`.

Manual production mutation remains possible if a user intentionally runs:

- `.github/workflows/deploy-frontend.yml`
- `.github/workflows/deploy-backend-gcp.yml`

No check workflow should contain:

- `aws s3 sync`
- `aws cloudfront create-invalidation`
- `gcloud run deploy`
- `docker push`
- `terraform apply`
- `terraform destroy`
- `terraform import`

## Test Expectations

Current expected production origins:

```text
https://aws-cloudresume-gcprag-jarrett.cc
https://www.aws-cloudresume-gcprag-jarrett.cc
https://d338amzpyv3o5b.cloudfront.net
```

Current GCP test source:

- `backend-GCP/tests/test_settings.py`

Current runtime CORS source:

- `backend-GCP/app/config/settings.py`
- `.github/workflows/deploy-backend-gcp.yml`

## Stale Values

| Stale value | Status |
| --- | --- |
| `dvzu3s2gq6iw.cloudfront.net` | Should not appear in active workflow env or tests |
| `dify-vertex-ai-499302` | Should not appear in active GCP project config |

Older historical reports may still contain stale values. CI/CD workflows should use current runtime values only.

## Future Monitoring Workflow

A future monitoring workflow can be added, but it should be check-only unless production mutation is explicitly approved.

Safe candidates:

- Validate CloudWatch alarm Terraform syntax after Terraform ownership is finalized.
- Run read-only health checks against public endpoints.
- Run RAG evaluation as a non-deploy scheduled or manual workflow.
- Upload monitoring reports as artifacts.

Unsafe until approved:

- Creating CloudWatch alarms automatically.
- Updating Cloud Run runtime env vars automatically.
- Running Terraform import, plan with mutation intent, apply, or destroy.
- Triggering production deploy from ordinary `push`.

## CI/CD Safety Decision

Status: Automatic checks are safe; deployment remains manual-only.

CI/CD can validate the project automatically, but production mutation must remain explicit and manual until Terraform ownership, monitoring, and deployment approval gates are finalized.

# CI/CD and Terraform Readiness Audit

## 1. Executive Summary

This audit found two GitHub Actions workflow files. Both were dangerous because they deployed production automatically on `push` to `main`. The frontend workflow deploys to S3 and invalidates CloudFront; the backend workflow builds, pushes, and deploys the GCP Cloud Run backend while setting runtime environment variables.

Safe changes were applied:

- Changed both workflows to `workflow_dispatch` only.
- Updated the GCP workflow hardcoded `CORS_ALLOWED_ORIGINS` value to the current production allowlist.
- Confirmed `backend-GCP/app/config/settings.py` already contains the current production CORS defaults.
- Added a Terraform-first skeleton focused on inventory/import/plan, not apply.

No deployment commands were run. No Terraform apply or destroy commands were run. No production resources were modified.

## 2. Current Production Resource References

| Resource | Current value |
| --- | --- |
| Production domain | `https://aws-cloudresume-gcprag-jarrett.cc` |
| AWS S3 frontend bucket | `nkc-201-02-cloudresume-frontend` |
| AWS CloudFront distribution ID | `E2N94TMVG2LDE7` |
| AWS CloudFront domain | `d338amzpyv3o5b.cloudfront.net` |
| GCP project | `cloud-resume-ai-rag` |
| GCP Cloud Run service | `gcp-rag-backend` |
| GCP Cloud Run region | `asia-east1` |
| GCP Cloud Run URL | `https://gcp-rag-backend-189047029621.asia-east1.run.app` |
| Vertex AI backend location | `us-central1` |

Known stale or risky values from the task brief:

| Value | Status |
| --- | --- |
| `dvzu3s2gq6iw.cloudfront.net` | Stale CloudFront domain |
| `dify-vertex-ai-499302` | Wrong GCP project |

## 3. YAML/YML Files Found

| File | Classification | Reason |
| --- | --- | --- |
| `.github/workflows/deploy-frontend.yml` | Dangerous before change; manual-gated after change | Previously deployed frontend to S3 and invalidated CloudFront automatically on `push` to `main`. It still contains production deployment commands, but now requires manual dispatch. |
| `.github/workflows/deploy-backend-gcp.yml` | Dangerous and stale before change; manual-gated after change | Previously deployed Cloud Run automatically on `push` to `main`, used `--set-env-vars`, and had a stale CORS allowlist containing `dvzu3s2gq6iw.cloudfront.net`. It now requires manual dispatch and has the current CORS allowlist. |

No YAML/YML files were found under `frontend-AWS/`, `backend-AWS/`, or `backend-GCP/` after excluding `.git/`, `node_modules/`, virtual environments, `dist/`, and `build/`.

## 4. GitHub Actions Workflow Review

| Check | `.github/workflows/deploy-frontend.yml` | `.github/workflows/deploy-backend-gcp.yml` |
| --- | --- | --- |
| Automatic production deployment on push | Found and disabled | Found and disabled |
| Manual trigger | Added with `workflow_dispatch` | Added with `workflow_dispatch` |
| AWS deployment commands | `aws s3 sync`, `aws cloudfront create-invalidation` | Not present |
| GCP deployment commands | Not present | `gcloud run deploy`, `--set-env-vars` |
| Terraform apply/destroy | Not present | Not present |
| Hardcoded stale CloudFront domain | Not present | Found before change and removed |
| Wrong GCP project `dify-vertex-ai-499302` | Not present | Not present |

## 5. Stale Values Found

| Value | File | Action |
| --- | --- | --- |
| `https://dvzu3s2gq6iw.cloudfront.net` | `.github/workflows/deploy-backend-gcp.yml` | Replaced with the current production CORS allowlist. |

No YAML/YML reference to `dify-vertex-ai-499302` was found.

## 6. Dangerous Automation Found

| File | Dangerous behavior | Mitigation |
| --- | --- | --- |
| `.github/workflows/deploy-frontend.yml` | Production frontend deploy on `push` to `main`; S3 sync with `--delete`; CloudFront invalidation | Changed trigger to `workflow_dispatch` only. |
| `.github/workflows/deploy-backend-gcp.yml` | Production Cloud Run deploy on `push` to `main`; Docker image push; runtime env var overwrite with `--set-env-vars` | Changed trigger to `workflow_dispatch` only and refreshed CORS value. |

Manual dispatch still allows deployment if a user intentionally runs the workflow. The deployment commands remain present and should be reviewed again after Terraform inventory/import is complete.

## 7. CORS Code Default Review

`backend-GCP/app/config/settings.py` already contains the requested `DEFAULT_CORS_ALLOWED_ORIGINS` values:

- `http://localhost:5173`
- `http://localhost:5174`
- `http://127.0.0.1:5173`
- `http://127.0.0.1:5174`
- `https://aws-cloudresume-gcprag-jarrett.cc`
- `https://www.aws-cloudresume-gcprag-jarrett.cc`
- `https://d338amzpyv3o5b.cloudfront.net`

The stale `https://dvzu3s2gq6iw.cloudfront.net` value was not present in the code default.

## 8. Terraform Readiness Assessment

No existing Terraform tree was found. A safe Terraform skeleton was created under `terraform/` with placeholder modules for:

- `terraform/aws/frontend`
- `terraform/aws/backend`
- `terraform/gcp/rag-backend`

The skeleton intentionally avoids aggressive resource definitions. It contains provider/version stubs, variables, outputs, and import notes. Resource files are placeholders until live production settings are inventoried and import commands are prepared.

## 9. Recommended Next Steps

1. Inventory live AWS resources:
   - S3 bucket policy, website configuration, ownership controls, public access block, encryption, logging.
   - CloudFront origins, aliases, certificate, behaviors, cache policies, response headers, error pages.
   - API Gateway, Lambda functions, DynamoDB tables, SQS queues, SES identities/templates/rules, IAM roles and policies.
2. Inventory live GCP resources:
   - Cloud Run service settings, env vars, service account, IAM bindings, Artifact Registry, Firestore indexes, bucket references.
3. Add exact Terraform resource blocks only after inventory is complete.
4. Import existing resources into Terraform state.
5. Run `terraform plan` and confirm no unintended replacement, deletion, or env var rollback.
6. Keep GitHub Actions deployment manual-only until Terraform ownership is reviewed.

## 10. Files Changed

| File | Change |
| --- | --- |
| `.github/workflows/deploy-frontend.yml` | Changed trigger from `push` on `main` to `workflow_dispatch`. |
| `.github/workflows/deploy-backend-gcp.yml` | Changed trigger from `push` on `main` to `workflow_dispatch`; updated hardcoded CORS allowlist. |
| `terraform/README.md` | Added Terraform-first safety guidance and known production IDs. |
| `terraform/aws/frontend/*` | Added placeholder-first AWS frontend module files and import notes. |
| `terraform/aws/backend/*` | Added placeholder-first AWS backend module files and import notes. |
| `terraform/gcp/rag-backend/*` | Added placeholder-first GCP RAG backend module files and import notes. |
| `Statement_MD/CI_CD_AND_TERRAFORM_READINESS_AUDIT.md` | Added this audit report. |

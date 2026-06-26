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

| Resource                       | Current value                                             |
| ------------------------------ | --------------------------------------------------------- |
| Production domain              | `https://aws-cloudresume-gcprag-jarrett.cc`               |
| AWS S3 frontend bucket         | `nkc-201-02-cloudresume-frontend`                         |
| AWS CloudFront distribution ID | `E2N94TMVG2LDE7`                                          |
| AWS CloudFront domain          | `d338amzpyv3o5b.cloudfront.net`                           |
| GCP project                    | `cloud-resume-ai-rag`                                     |
| GCP Cloud Run service          | `gcp-rag-backend`                                         |
| GCP Cloud Run region           | `asia-east1`                                              |
| GCP Cloud Run URL              | `https://gcp-rag-backend-189047029621.asia-east1.run.app` |
| Vertex AI backend location     | `us-central1`                                             |

Known stale or risky values from the task brief:

| Value                         | Status                  |
| ----------------------------- | ----------------------- |
| `dvzu3s2gq6iw.cloudfront.net` | Stale CloudFront domain |
| `dify-vertex-ai-499302`       | Wrong GCP project       |

## 3. YAML/YML Files Found

| File                                       | Classification                                               | Reason                                                                                                                                                                                                                               |
| ------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.github/workflows/deploy-frontend.yml`    | Dangerous before change; manual-gated after change           | Previously deployed frontend to S3 and invalidated CloudFront automatically on `push` to `main`. It still contains production deployment commands, but now requires manual dispatch.                                                 |
| `.github/workflows/deploy-backend-gcp.yml` | Dangerous and stale before change; manual-gated after change | Previously deployed Cloud Run automatically on `push` to `main`, used `--set-env-vars`, and had a stale CORS allowlist containing `dvzu3s2gq6iw.cloudfront.net`. It now requires manual dispatch and has the current CORS allowlist. |

No YAML/YML files were found under `frontend-AWS/`, `backend-AWS/`, or `backend-GCP/` after excluding `.git/`, `node_modules/`, virtual environments, `dist/`, and `build/`.

## 4. GitHub Actions Workflow Review

| Check                                     | `.github/workflows/deploy-frontend.yml`             | `.github/workflows/deploy-backend-gcp.yml` |
| ----------------------------------------- | --------------------------------------------------- | ------------------------------------------ |
| Automatic production deployment on push   | Found and disabled                                  | Found and disabled                         |
| Manual trigger                            | Added with `workflow_dispatch`                      | Added with `workflow_dispatch`             |
| AWS deployment commands                   | `aws s3 sync`, `aws cloudfront create-invalidation` | Not present                                |
| GCP deployment commands                   | Not present                                         | `gcloud run deploy`, `--set-env-vars`      |
| Terraform apply/destroy                   | Not present                                         | Not present                                |
| Hardcoded stale CloudFront domain         | Not present                                         | Found before change and removed            |
| Wrong GCP project `dify-vertex-ai-499302` | Not present                                         | Not present                                |

## 5. Stale Values Found

| Value                                 | File                                       | Action                                               |
| ------------------------------------- | ------------------------------------------ | ---------------------------------------------------- |
| `https://dvzu3s2gq6iw.cloudfront.net` | `.github/workflows/deploy-backend-gcp.yml` | Replaced with the current production CORS allowlist. |

No YAML/YML reference to `dify-vertex-ai-499302` was found.

## 6. Dangerous Automation Found

| File                                       | Dangerous behavior                                                                                                  | Mitigation                                                            |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `.github/workflows/deploy-frontend.yml`    | Production frontend deploy on `push` to `main`; S3 sync with `--delete`; CloudFront invalidation                    | Changed trigger to `workflow_dispatch` only.                          |
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

| File                                                  | Change                                                                                          |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `.github/workflows/deploy-frontend.yml`               | Changed trigger from `push` on `main` to `workflow_dispatch`.                                   |
| `.github/workflows/deploy-backend-gcp.yml`            | Changed trigger from `push` on `main` to `workflow_dispatch`; updated hardcoded CORS allowlist. |
| `terraform/README.md`                                 | Added Terraform-first safety guidance and known production IDs.                                 |
| `terraform/aws/frontend/*`                            | Added placeholder-first AWS frontend module files and import notes.                             |
| `terraform/aws/backend/*`                             | Added placeholder-first AWS backend module files and import notes.                              |
| `terraform/gcp/rag-backend/*`                         | Added placeholder-first GCP RAG backend module files and import notes.                          |
| `Statement_MD/CI_CD_AND_TERRAFORM_READINESS_AUDIT.md` | Added this audit report.                                                                        |

## 11. Terraform Import Implementation Update

Follow-up Terraform work added import-ready definitions for the resources that could be mapped from repo exports without live mutation:

- AWS frontend S3 bucket shell.
- AWS backend API Gateway HTTP APIs, stages, integrations, routes.
- AWS backend Lambda function shells with exported names, roles, runtime, handlers, memory, timeout, and environment values.
- AWS backend IAM roles, managed policy attachments, and inline policies from exported IAM JSON.
- AWS backend DynamoDB, SQS, and SES import shells where exact names were discovered but full attributes still require live inventory.
- GCP Cloud Run v2 service shell with known project, region, service name, docs bucket, CORS value, and document env values.
- `Statement_MD/GCP_RAG_PROJECT_STATE.md` current CORS reference was updated from the stale CloudFront origin to the current production allowlist.

Import commands were documented in:

- `terraform/aws/frontend/import-notes.md`
- `terraform/aws/backend/import-notes.md`
- `terraform/gcp/rag-backend/import-notes.md`
- `Statement_MD/TERRAFORM_IMPORT_MAPPING_REPORT.md`

No `terraform import`, `terraform apply`, or production deployment command was run.

Local validation update:

- `terraform fmt -recursive terraform` passed.
- `terraform fmt -check -recursive terraform` passed.
- `terraform init -backend=false` passed for each module.
- `terraform validate` passed for each module.

## 12. Live Inventory Reconciliation Update

Read-only AWS and GCP inventory was captured into ignored local folders:

- `terraform/aws/frontend/inventory/`
- `terraform/aws/backend/inventory/`
- `terraform/gcp/rag-backend/inventory/`

`.gitignore` now excludes `terraform/**/inventory/`, in addition to `.terraform/` and Terraform state files. The raw inventory JSON and stderr files are local evidence only and must not be committed.

Terraform mappings were updated from live inventory:

- AWS frontend now includes S3 versioning, public access block, ownership controls, encryption, bucket policy, CloudFront OAC, and CloudFront distribution import-ready resources.
- AWS backend now includes verified DynamoDB on-demand billing default, SQS queue attributes, Lambda SQS event source mapping, and Lambda API Gateway invoke permissions.
- GCP RAG backend now includes verified Cloud Run image digest, runtime service account, env vars, ingress, traffic, timeout, concurrency, max scale, resource limits, startup probe, and public invoker IAM binding.

Confirmed live inventory highlights:

- CloudFront distribution `E2N94TMVG2LDE7` uses OAC `E1IJNX3IJT2ZYV`, S3 regional origin `nkc-201-02-cloudresume-frontend.s3.ap-northeast-1.amazonaws.com`, alias `aws-cloudresume-gcprag-jarrett.cc`, and SPA `403`/`404` rewrites to `/index.html`.
- DynamoDB tables `Cloud-Resume-Contact-Submissions` and `portfolio-views` use `PAY_PER_REQUEST`; TTL and PITR are disabled.
- SQS queue `CloudResume-Contact-Email-Queue` has SQS-managed SSE enabled.
- Lambda event source mapping `83d00468-0bb4-4e42-bcc9-6b851a177710` connects SQS to `CloudResumeEmailHandler`.
- SES identity `jarrett6796@gmail.com` is verified.
- Cloud Run latest ready revision is `gcp-rag-backend-00029-x6s`; the stable URL remains listed in service annotations as `https://gcp-rag-backend-189047029621.asia-east1.run.app`, while service status also reports `https://gcp-rag-backend-j5kuoum37a-de.a.run.app`.
- Cloud Run runtime confirms `RAG_VECTOR_SEARCH_BACKEND=local` and the current production CORS allowlist.

No Terraform import, plan, apply, or destroy command was run. No deployment workflow was run. No production resource was mutated.

## Final Status — 2026-06-27

CI/CD check workflows are now implemented and passing:

- Frontend Check
- AWS Backend Check
- GCP Backend Check
- Terraform Check

Production deployment workflows remain manual-only through `workflow_dispatch`.

Terraform has been reconciled against live AWS/GCP inventory and validated. Terraform import, plan, apply, and destroy were not executed.

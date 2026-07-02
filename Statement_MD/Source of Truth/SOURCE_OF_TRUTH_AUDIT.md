# Source of Truth Audit

## Audit Date

2026-06-27

## Scope

This audit indexes the current source-of-truth evidence for the portfolio platform across:

- `frontend-React/`
- `backend-AWS/`
- `backend-GCP/`
- `terraform/`
- `.github/workflows/`
- `Statement_MD/`

## Safety Constraints

This documentation pass did not deploy, import, plan, apply, destroy, or mutate production infrastructure.

Forbidden during this audit:

- No AWS deployment workflow run.
- No GCP deployment workflow run.
- No `terraform import`.
- No `terraform plan`.
- No `terraform apply`.
- No `terraform destroy`.
- No production configuration mutation.

## Executive Summary

The project now has enough evidence to separate the source-of-truth audit into one master index and five detailed evidence reports.

Current state:

- AWS frontend hosting is current on S3 + CloudFront.
- AWS backend resources exist in exported source-of-truth files and Terraform mappings, but Terraform does not own production yet.
- GCP RAG backend is current on Cloud Run with Gemini, Firestore, and GCS document sources.
- Frontend runtime configuration is controlled through Vite env variables and API client files.
- CI/CD validation workflows are automatic checks; production deployment workflows are manual-only.
- Terraform is import-ready only and must not be treated as production owner.

## Source-of-Truth Map

| Area | Detailed report | Primary repo evidence |
| --- | --- | --- |
| AWS resources | `Statement_MD/SOURCE_OF_TRUTH_AUDIT_AWS.md` | `backend-AWS/`, `terraform/aws/`, `Statement_MD/TERRAFORM_IMPORT_MAPPING_REPORT.md` |
| GCP RAG runtime | `Statement_MD/SOURCE_OF_TRUTH_AUDIT_GCP.md` | `backend-GCP/`, `terraform/gcp/rag-backend/`, GCP eval reports |
| Frontend runtime | `Statement_MD/SOURCE_OF_TRUTH_AUDIT_FRONTEND.md` | `frontend-React/`, `.github/workflows/deploy-frontend.yml` |
| Terraform readiness | `Statement_MD/SOURCE_OF_TRUTH_AUDIT_TERRAFORM.md` | `terraform/`, `Statement_MD/TERRAFORM_IMPORT_MAPPING_REPORT.md` |
| CI/CD safety | `Statement_MD/SOURCE_OF_TRUTH_AUDIT_CICD.md` | `.github/workflows/`, `Statement_MD/CI_CD_AND_TERRAFORM_READINESS_AUDIT.md` |

## Current Known Production Values

| Resource | Current value |
| --- | --- |
| Production domain | `https://aws-cloudresume-gcprag-jarrett.cc` |
| AWS account ID | `001920499658` |
| AWS region | `ap-northeast-1` |
| AWS S3 frontend bucket | `nkc-201-02-cloudresume-frontend` |
| AWS CloudFront distribution ID | `E2N94TMVG2LDE7` |
| AWS CloudFront domain | `d338amzpyv3o5b.cloudfront.net` |
| AWS CloudFront OAC ID | `E1IJNX3IJT2ZYV` |
| GCP project | `cloud-resume-ai-rag` |
| GCP Cloud Run service | `gcp-rag-backend` |
| GCP Cloud Run region | `asia-east1` |
| GCP Cloud Run stable URL | `https://gcp-rag-backend-189047029621.asia-east1.run.app` |
| GCP Cloud Run status URL | `https://gcp-rag-backend-j5kuoum37a-de.a.run.app` |
| Vertex AI location | `us-central1` |
| GCS docs bucket | `cloud-resume-ai-rag-docs` |

## Stale Value Summary

Known stale values:

| Stale value | Current replacement | Notes |
| --- | --- | --- |
| `dvzu3s2gq6iw.cloudfront.net` | `d338amzpyv3o5b.cloudfront.net` | Old CloudFront domain. Should not be used in active CORS or deploy config. |
| `dify-vertex-ai-499302` | `cloud-resume-ai-rag` | Wrong GCP project for this portfolio backend. |

Current runtime source files and workflows use the current production CloudFront/GCP values. Some older generated or historical reports still mention stale values and should be treated as history unless refreshed.

## CloudWatch Readiness Decision

Status: Partially ready.

CloudWatch design and runbook work can begin because AWS resources and future monitoring targets are now identified. Terraform implementation of CloudWatch alarms or dashboards should wait until the Terraform ownership boundary is decided.

Recommended decision rule:

- Documentation-only runbook: ready.
- Manual AWS console or CLI monitoring setup: possible after final target list review.
- Terraform-managed CloudWatch: not ready until remote state, imports, and ownership are finalized.

GCP monitoring is separate. Cloud Run, Vertex AI, Firestore, and GCS observability should use Google Cloud Logging and Google Cloud Monitoring unless a cross-cloud monitoring design is intentionally added.

## Next Actions

1. Review the five detailed reports for missing resource IDs or stale assumptions.
2. Decide the CloudWatch implementation layer: documentation-only, manual AWS configuration, or Terraform module.
3. If Terraform is selected, finish remote state and import production resources before adding CloudWatch resources.
4. Keep deploy workflows manual-only until monitoring and Terraform ownership are stable.
5. Refresh older historical reports only if they are still used as active portfolio evidence.

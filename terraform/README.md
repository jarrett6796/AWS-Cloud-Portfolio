# Terraform Readiness

Terraform is being introduced after production stabilization. The current AWS and GCP resources were created mostly manually, so Terraform must begin with inventory, import planning, and non-destructive review.

## Safety Rules

- Do not recreate production resources.
- Do not run `terraform apply` until imports, plans, and ownership boundaries have been reviewed.
- Do not run `terraform destroy`.
- Do not use `terraform apply -auto-approve`.
- Treat every `.tf` file in this tree as a placeholder until the matching production resource has been inventoried and imported.

## First Acceptable Commands

Run these only from the specific Terraform module directory being reviewed:

```sh
terraform init
terraform fmt
terraform validate
terraform plan
```

## Forbidden Until Reviewed

```sh
terraform apply
terraform destroy
terraform apply -auto-approve
```

## Current Known Production IDs

| Area | Value |
| --- | --- |
| AWS S3 bucket | `nkc-201-02-cloudresume-frontend` |
| AWS CloudFront distribution ID | `E2N94TMVG2LDE7` |
| AWS CloudFront domain | `d338amzpyv3o5b.cloudfront.net` |
| GCP project | `cloud-resume-ai-rag` |
| GCP Cloud Run service | `gcp-rag-backend` |
| GCP Cloud Run region | `asia-east1` |
| Production domain | `aws-cloudresume-gcprag-jarrett.cc` |

## Phase 1 Plan

1. Inventory every live AWS and GCP resource and export current settings.
2. Decide module ownership boundaries before writing resource blocks.
3. Add resource definitions with `lifecycle` safeguards where appropriate.
4. Import existing resources into Terraform state.
5. Run `terraform plan` until it shows no unintended replacement or deletion.
6. Only after review, consider controlled apply operations.

## Recommended Import Order

1. AWS frontend S3 bucket
2. AWS frontend S3 supporting configs after live export
3. AWS CloudFront distribution after live export
4. AWS DynamoDB tables
5. AWS SQS queues
6. AWS Lambda IAM roles and policies
7. AWS Lambda functions
8. AWS API Gateway APIs, stages, integrations, and routes
9. AWS SES identities
10. GCP Cloud Run service
11. GCP Cloud Run IAM after live policy export

## Import Safety Notes

- Import commands in module notes are prepared for later and have not been executed.
- Variables marked `TODO_IMPORT_REQUIRED` are intentionally unset or incomplete to force manual verification before planning changes.
- Some imported resources use `ignore_changes = all` until live drift can be reviewed after import. Remove that guard only after exported settings have been reconciled into Terraform.

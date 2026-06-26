# AWS Frontend Import Notes

Known production references:

- S3 bucket: `nkc-201-02-cloudresume-frontend`
- CloudFront distribution ID: `E2N94TMVG2LDE7`
- CloudFront domain: `d338amzpyv3o5b.cloudfront.net`
- Production domain: `aws-cloudresume-gcprag-jarrett.cc`
- Origin Access Control ID: `E1IJNX3IJT2ZYV`

Do not create replacement S3 or CloudFront resources. Live inventory has been captured locally under ignored `terraform/aws/frontend/inventory/` files. Import before any plan.

## Verified Live Inventory

| Area | Verified value |
| --- | --- |
| S3 bucket region | `ap-northeast-1` |
| S3 versioning | `Enabled` |
| S3 public access block | All four block/restrict settings are `true` |
| S3 bucket policy | CloudFront service principal only, scoped to distribution `E2N94TMVG2LDE7` |
| S3 website hosting | Not configured (`NoSuchWebsiteConfiguration`) |
| S3 ownership controls | `BucketOwnerEnforced` |
| S3 default encryption | `AES256`, bucket key enabled |
| S3 access logging | Not configured |
| CloudFront origin | `nkc-201-02-cloudresume-frontend.s3.ap-northeast-1.amazonaws.com` |
| CloudFront OAC | `E1IJNX3IJT2ZYV`, SigV4, always sign, S3 origin |
| CloudFront alias | `aws-cloudresume-gcprag-jarrett.cc` |
| CloudFront certificate | ACM `arn:aws:acm:us-east-1:001920499658:certificate/9fbaafc9-43be-40ae-b73a-a08a2aa1f059` |
| CloudFront cache policy | Managed CachingOptimized policy `658327ea-f89d-4fab-a63d-7e88639e58f6` |
| CloudFront custom errors | `403` and `404` both rewrite to `/index.html` with response `200` |
| CloudFront WAF | `arn:aws:wafv2:us-east-1:001920499658:global/webacl/CreatedByCloudFront-2fcc7732/4e3b7a39-d4d4-4520-afa8-0663e375d928` |

## Prepared Import Commands

Prepared but not executed:

```sh
terraform import aws_s3_bucket.frontend nkc-201-02-cloudresume-frontend
terraform import aws_s3_bucket_versioning.frontend nkc-201-02-cloudresume-frontend
terraform import aws_s3_bucket_public_access_block.frontend nkc-201-02-cloudresume-frontend
terraform import aws_s3_bucket_ownership_controls.frontend nkc-201-02-cloudresume-frontend
terraform import aws_s3_bucket_server_side_encryption_configuration.frontend nkc-201-02-cloudresume-frontend
terraform import aws_s3_bucket_policy.frontend nkc-201-02-cloudresume-frontend
terraform import aws_cloudfront_origin_access_control.frontend E1IJNX3IJT2ZYV
terraform import aws_cloudfront_distribution.frontend E2N94TMVG2LDE7
```

## Still Required Before Planning

- Import into a reviewed local state before running any plan.
- Review whether Terraform should eventually own CloudFront WAF, ACM certificate, DNS alias records, and invalidation workflows. They are referenced but not declared in this module.
- Run `terraform plan` only after import and review; do not apply.

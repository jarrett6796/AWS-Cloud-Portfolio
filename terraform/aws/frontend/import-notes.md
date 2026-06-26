# AWS Frontend Import Notes

Known production references:

- S3 bucket: `nkc-201-02-cloudresume-frontend`
- CloudFront distribution ID: `E2N94TMVG2LDE7`
- CloudFront domain: `d338amzpyv3o5b.cloudfront.net`
- Production domain: `aws-cloudresume-gcprag-jarrett.cc`

Do not create replacement S3 or CloudFront resources. First inventory the live bucket policy, website configuration, ownership controls, public access settings, CloudFront origins, aliases, certificate, behaviors, cache policies, and invalidation expectations.

## Prepared Import Commands

Prepared but not executed:

```sh
terraform import aws_s3_bucket.frontend nkc-201-02-cloudresume-frontend
```

CloudFront import command prepared for later, after the resource block is written from exported live settings:

```sh
terraform import aws_cloudfront_distribution.frontend E2N94TMVG2LDE7
```

## Still Required Before CloudFront Resource Definition

- Export live distribution config with origins, aliases, certificate, cache behaviors, cache policies, response headers policies, OAC/OAI, custom errors, price class, logging, and enabled status.
- Add `aws_cloudfront_distribution.frontend` only after the HCL can preserve those values.
- Run `terraform plan` only after import and review; do not apply.

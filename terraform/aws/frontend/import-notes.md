# AWS Frontend Import Notes

Known production references:

- S3 bucket: `nkc-201-02-cloudresume-frontend`
- CloudFront distribution ID: `E2N94TMVG2LDE7`
- CloudFront domain: `d338amzpyv3o5b.cloudfront.net`
- Production domain: `aws-cloudresume-gcprag-jarrett.cc`

Do not create replacement S3 or CloudFront resources. First inventory the live bucket policy, website configuration, ownership controls, public access settings, CloudFront origins, aliases, certificate, behaviors, cache policies, and invalidation expectations.

Import commands should be added only after resource blocks exactly match the live resources.

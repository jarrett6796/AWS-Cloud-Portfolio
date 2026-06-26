# Import-ready shell for the existing production frontend bucket.
#
# Supporting S3 resources are intentionally not declared yet because the repo
# does not contain exported bucket policy, website hosting, encryption,
# ownership controls, or public-access-block settings.
resource "aws_s3_bucket" "frontend" {
  bucket = var.frontend_bucket_name

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

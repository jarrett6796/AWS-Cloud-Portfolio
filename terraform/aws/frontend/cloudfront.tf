resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "oac-nkc-201-02-cloudresume-frontend.s3.ap-northeast--mqs07kz67a1"
  description                       = "Created by CloudFront"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  comment             = "NKC201-02-Cloud Resume"
  aliases             = [var.production_domain_name]
  default_root_object = "index.html"
  price_class         = "PriceClass_All"
  http_version        = "http2and3"
  is_ipv6_enabled     = true
  retain_on_delete    = true
  wait_for_deployment = false
  web_acl_id          = "arn:aws:wafv2:us-east-1:001920499658:global/webacl/CreatedByCloudFront-2fcc7732/4e3b7a39-d4d4-4520-afa8-0663e375d928"

  origin {
    domain_name              = "${var.frontend_bucket_name}.s3.ap-northeast-1.amazonaws.com"
    origin_id                = "nkc-201-02-cloudresume-frontend.s3.ap-northeast-1.amazonaws.com-mqs051bx7km"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
    connection_attempts      = 3
    connection_timeout       = 10

    s3_origin_config {
      origin_access_identity = ""
    }
  }

  default_cache_behavior {
    target_origin_id       = "nkc-201-02-cloudresume-frontend.s3.ap-northeast-1.amazonaws.com-mqs051bx7km"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = "arn:aws:acm:us-east-1:001920499658:certificate/9fbaafc9-43be-40ae-b73a-a08a2aa1f059"
    minimum_protocol_version = "TLSv1.2_2021"
    ssl_support_method       = "sni-only"
  }

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "access-identity-${var.app_domain_name}.s3.amazonaws.com"
}

locals {
  s3_origin_id = "anythingCanGoHere"
}

resource "aws_cloudfront_distribution" "app_distribution" {
  depends_on = [
    aws_s3_bucket.app
  ]

  origin {
    domain_name = aws_s3_bucket.app.bucket_regional_domain_name
    origin_id   = var.app_domain_name

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  comment             = "${var.app_domain_name} CDN"

  aliases = [var.root_domain_name, var.app_domain_name]

  default_cache_behavior {
    allowed_methods = [
      "GET",
      "HEAD",
      "POST",
      "OPTIONS",
      "PUT",
      "PATCH",
      "DELETE"
    ]

    cached_methods = [
      "GET",
      "HEAD",
    ]


    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    target_origin_id = var.app_domain_name
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
      acm_certificate_arn      = aws_acm_certificate.cert.arn
      ssl_support_method       = "sni-only"
      minimum_protocol_version = "TLSv1"
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    error_caching_min_ttl = 0
    response_page_path    = "/"
  }

  wait_for_deployment = false
}
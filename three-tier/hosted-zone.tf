resource "aws_route53_zone" "main" {
  name = var.root_domain_name

  force_destroy = true
}

resource "aws_route53_record" "root" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.root_domain_name
  type    = "A"

  alias {
    name    = aws_cloudfront_distribution.app_distribution.domain_name
    zone_id    = aws_cloudfront_distribution.app_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "app" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.app_domain_name
  type    = "A"

  alias {
    name    = aws_cloudfront_distribution.app_distribution.domain_name
    zone_id    = aws_cloudfront_distribution.app_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.app_domain_name
  type    = "A"

  alias {
    name    = aws.app_distribution.domain_name
    zone_id    = aws_cloudfront_distribution.app_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

// Use the AWS Certificate Manager to create an SSL cert for our domain.
// This resource won't be created until you receive the email verifying you
// own the domain and you click on the confirmation link.
resource "aws_acm_certificate" "cert" {
  depends_on = [aws_route53_zone.main]
  domain_name       = "${var.root_domain_name}"
  validation_method = "EMAIL"
  
  subject_alternative_names = ["${var.app_domain_name}", "*.${var.root_domain_name}"]

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "app" {
  certificate_arn         = aws_acm_certificate.cert.arn
}
################ Route53

resource "aws_route53_zone" "main" {
  name = "cloudocto.com"
}

resource "aws_route53_record" "main-a-record" {
  zone_id = aws_route53_zone.main.zone_id
  name = "cloudocto.com"
  type = "A"

  alias {
    name = "${aws_s3_bucket.bucket.website_domain}"
    zone_id = "${aws_s3_bucket.bucket.hosted_zone_id}"
    evaluate_target_health = false
  }
}

################ DNS & ACM

resource "aws_acm_certificate" "cert" {
  domain_name       = "*.cloudocto.com"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}


resource "aws_route53_record" "main-c-name" {
  zone_id = "${aws_route53_zone.main.zone_id}"
  name = "app"
  type = "CNAME"
  ttl = "300"
  records = ["cloudocto.com"]
}

resource "aws_acm_certificate" "cdn_cert" {
  domain_name       = "*.cloudocto.com"
  validation_method = "DNS"
  provider = aws.acm_provider

  lifecycle {
    create_before_destroy = true
  }
}

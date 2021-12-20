# resource "null_resource" "create_local_populate_bucket_script" {
#   triggers {
#     template = "${data.template_file.populate_bucket_script.rendered}"
#   }

#   provisioner "local-exec" {
#     command = "echo \"${data.template_file.populate_bucket_script.rendered}\" > populate_bucket.sh; chmod +x populate_bucket.sh"
#   }
# }

resource "aws_s3_bucket" "app" {
  // Our bucket's name is going to be the same as our site's domain name.
  bucket = var.app_domain_name
  acl    = "private"
  versioning {
    enabled = true
  }
  policy = <<EOF
{
  "Id": "bucket_policy_site",
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "bucket_policy_site_main",
      "Action": [
        "s3:GetObject"
      ],
      "Effect": "Allow",
      "Resource": "arn:aws:s3:::${var.app_domain_name}/*",
      "Principal": "*"
    }
  ]
}
EOF

  cors_rule {
    allowed_headers = ["Authorization", "Content-Length"]
    allowed_methods = ["GET", "POST"]
    allowed_origins = ["https://${var.app_domain_name}"]
    max_age_seconds = 3000
  }

  website {
    index_document = "index.html"
    error_document = "index.html"
  }

  force_destroy = true
  lifecycle {
    prevent_destroy = false
  }
}

resource "aws_s3_bucket_object" "object" {
  bucket       = aws_s3_bucket.app.bucket
  key          = "index.html"
  source       = "${path.module}/index.html"
  content_type = "text/html"
  etag         = filemd5("${path.module}/index.html")
}
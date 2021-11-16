################ S3

resource "aws_s3_bucket" "bucket" {
  bucket = "app.cloudocto"
  acl = "public-read"
  policy = templatefile("s3-policy.json", { bucket = "app.cloudocto" })

  cors_rule {
    allowed_headers = ["Authorization", "Content-Length"]
    allowed_methods = ["GET", "POST"]
    allowed_origins = ["https://app.cloudocto.com"]
    max_age_seconds = 3000
  }

  website {
    index_document = "index.html"
    error_document = "index.html"
  }
}
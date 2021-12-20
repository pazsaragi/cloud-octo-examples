
data "archive_file" "lambda_read" {
  type = "zip"

  source_dir  = "../lambdas/dax/read"
  output_path = "${path.module}/read.zip"
}

resource "random_pet" "lambda_bucket_name" {
  prefix = "learn-terraform-functions"
  length = 4
}

resource "aws_s3_bucket_object" "lambda_read" {
  bucket = aws_s3_bucket.lambda_bucket.id

  key    = "read.zip"
  source = data.archive_file.lambda_read.output_path

  etag = filemd5(data.archive_file.lambda_read.output_path)
}

resource "aws_s3_bucket_object" "lambda_read_asset" {
  bucket = aws_s3_bucket.lambda_bucket.id

  key    = "read.zip"
  source = data.archive_file.lambda_read.output_path

  etag = filemd5(data.archive_file.lambda_read.output_path)
}


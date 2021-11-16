
# USAGE:

# terraform {
#   backend "s3" {
#     encrypt        = true
#     bucket         = "cloud-octo-terraform-remote-state"
#     region         = "eu-west-2"
#     dynamodb_table = "terraform-state-lock-dynamo"
#     key            = "/state/"
#   }
# }

provider "aws" {
  region = "eu-west-2"
  default_tags {
    tags = {
        environment = "dev"
    }
  }
}

resource "aws_s3_bucket" "terraform-state-storage-s3" {
  bucket = "cloud-octo-terraform-remote-state"

  versioning {
    enabled = true
  }

  lifecycle {
    prevent_destroy = true
  }

}


resource "aws_dynamodb_table" "dynamodb-terraform-state-lock" {
  name           = "cloud-octo-terraform-state-lock-dynamo"
  hash_key       = "LockID"
  read_capacity  = 20
  write_capacity = 20

  attribute {
    name = "LockID"
    type = "S"
  }

}
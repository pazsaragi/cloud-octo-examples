variable "s3_tfstate_bucket" {
  description = "Name of the S3 bucket used for Terraform state storage"
}
variable "dynamo_db_table_name" {
  description = "Name of DynamoDB table used for Terraform locking"
}

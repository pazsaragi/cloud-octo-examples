variable "codebuild_project_terraform_plan_name" {
  description = "Name for CodeBuild Terraform Plan Project"
}
variable "codebuild_project_terraform_apply_name" {
  description = "Name for CodeBuild Terraform Apply Project"
}
variable "codebuild_terraform_security_name" {
  description = "Name for CodeBuild Terraform Security Project"
}
variable "s3_logging_bucket_id" {
  description = "ID of the S3 bucket for access logging"
}
variable "s3_logging_bucket" {
  description = "Name of the S3 bucket for access logging"
}
variable "codebuild_iam_role_arn" {
  description = "ARN of the CodeBuild IAM role"
}
variable "codebuild_iam_role_name" {
  description = "Name for IAM Role utilized by CodeBuild"
}
variable "codebuild_iam_role_policy_name" {
  description = "Name for IAM policy used by CodeBuild"
}
variable "terraform_codecommit_repo_arn" {
  description = "Terraform CodeCommit git repo ARN"
}
variable "tf_codepipeline_artifact_bucket_arn" {
  description = "Codepipeline artifact bucket ARN"
}

variable "s3_logging_bucket_name" {
  description = "Name of S3 bucket to use for access logging"
}
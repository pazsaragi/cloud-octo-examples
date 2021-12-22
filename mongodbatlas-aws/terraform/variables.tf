variable "mongodbatlas_public_key" {
  description = "The public API key for MongoDB Atlas"
}

variable "mongodbatlas_private_key" {
  description = "The private API key for MongoDB Atlas"
}

variable "atlas_region" {
  default     = "EU_WEST_1"
  description = "Atlas Region"
}

variable "aws_region" {
  default     = "eu-west-1"
  description = "AWS Region"
}

variable "atlasprojectid" {
  description = "Atlas project ID"
}
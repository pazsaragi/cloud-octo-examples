variable "source_path" {
  description = "source path for project"
  default     = "../services/backend"
}

variable "tag" {
  description = "tag to use for our new docker image"
  default     = "latest"
}

variable "account_id" {
  description = "account id"
}

variable "access_key" {
  description = "AWS Access Key"
}

variable "secret_key" {
  description = "AWS Secret Key"
}
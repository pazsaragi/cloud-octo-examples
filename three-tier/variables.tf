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

variable "app_domain_name" {
  default = "app.cloudocto.com"
  description = "domain name (or application name if no domain name available)"
}

variable "root_domain_name" {
  default = "cloudocto.com"
}
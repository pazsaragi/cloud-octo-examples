variable "region" {
  default = "eu-west-2"
}

variable "public_subnet_1_cidr" {
  description = "CIDR Block for Public Subnet 1"
  default     = "10.0.1.0/24"
}
variable "public_subnet_2_cidr" {
  description = "CIDR Block for Public Subnet 2"
  default     = "10.0.2.0/24"
}
variable "private_subnet_1_cidr" {
  description = "CIDR Block for Private Subnet 1"
  default     = "10.0.3.0/24"
}
variable "private_subnet_2_cidr" {
  description = "CIDR Block for Private Subnet 2"
  default     = "10.0.4.0/24"
}
variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["eu-west-2a", "eu-west-2b"]
}

variable "health_check_path" {
  description = "Health check path for the default target group"
  default     = "/"
}

variable "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  default     = "production"
}

variable "log_retention_in_days" {
  default = 30
}

variable "docker_image_url_django" {
  description = "Docker image to run in the ECS cluster"
  default     = "django-app"
}

variable "app_count" {
  default = 1
}

variable "account_id" {
}

# variable "ssh_pubkey_file" {
#   description = "Path to an SSH public key"
#   default     = "~/.ssh/id_rsa.pub"
# }
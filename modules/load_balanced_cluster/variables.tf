variable "vpc_id" {
}

variable "ecs_cluster_name" {
  description = "Name of the ecs cluster"
}

variable "region" {
  default = "eu-west-2"
}

variable "container_name" {
  description = "Friendly name of container e.g. django-app"
}

variable "cpu" {
  default = 256
}

variable "memory" {
  default = 512
}

variable "desired_count" {
  default     = 1
  description = "Default desired task def count"
}

variable "container_port" {
  default = 80
}

variable "asg_max" {
  default = 1
}

variable "asg_min" {
  default = 1
}

# variable "containers" {
#   description = "container config .. list of container definitions"
#   //  type = list(object({
#   //    name = string
#   //    image = string
#   //    cpu = optional(number)
#   //    memoryReservation = optional(number)
#   //    essential = optional(bool)
#   //    expose = optional(bool)
#   //    port = optional(number)
#   //    protocol = optional(string)
#   //    target_group_arns = optional(list(string))
#   //    environment = optional(list(object({name=string, value=string})))
#   //    secrets = optional(list(object({name=string, valueFrom=string})))
#   //    volumesFrom = optional(list(object({sourceContainer=string, readOnly=bool})))
#   //    command = optional(list(string))
#   //    entryPoint = optional(list(string))
#   //  }))
#   type = list(any)
# }

variable "public_subnet_ids" {
  description = "list of public subnet ids"
  type        = list(string)
  default     = null
}

variable "private_subnet_ids" {
  description = "list of private subnet ids"
  type        = list(string)
  default     = null
}

variable "health_check_path" {
  default = "/health"
}

variable "template_file" {}

variable "capacity_provider" {
  default = "FARGATE"
}
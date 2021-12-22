variable "min_capacity" {
  default = 1
}

variable "max_capacity" {
  default = 5
}

variable "ecs_cluster_name" {}
variable "ecs_service_name" {}

variable "target_memory_utilization" {
    default = 80
}

variable "target_cpu_utilization" {
    default = 80
}
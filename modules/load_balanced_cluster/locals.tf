# locals {
#   containers = [
#     for container in var.containers :
#     merge(local.ecs_container_defaults, container)
#   ]

#   exposed_containers = [for container in local.containers : container if container.expose]
# }

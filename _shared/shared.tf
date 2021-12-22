locals {
  ecs_container_defaults = {
    command           = null
    entryPoint        = null
    port              = -1
    hostPort          = null
    cpu               = 0
    memory            = null
    essential         = true
    expose            = false
    target_group_arns = []
    portMappings      = []
    mountPoints       = []
    volumesFrom       = []
    environment       = []
    secrets           = []
    healthCheck       = null
  }
}

resource "aws_ecs_cluster" "cluster" {
  name               = var.ecs_cluster_name
  capacity_providers = ["FARGATE_SPOT", "FARGATE"]
  default_capacity_provider_strategy {
    capacity_provider = var.capacity_provider
  }
}

resource "aws_ecs_task_definition" "app" {
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  family                   = var.container_name
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  container_definitions    = var.template_file
  # container_definitions = jsonencode(
  #   [
  #     for container in local.containers :
  #     {
  #       command          = container.command
  #       entryPoint       = container.entryPoint
  #       healthCheck      = container.healthCheck
  #       cpu              = container.cpu
  #       memory           = container.memory
  #       essential        = container.essential
  #       image            = container.image
  #       name             = container.name
  #       logConfiguration = local.logConfig[container.name]
  #       portMappings = (
  #         length(container.portMappings) > 0 ? container.portMappings :
  #         (
  #           container.expose ? [
  #             {
  #               protocol      = "tcp"
  #               hostPort      = coalesce(container.hostPort, container.port)
  #               containerPort = container.port
  #             }
  #           ] : []
  #         )
  #       )
  #       mountPoints = container.mountPoints
  #       volumesFrom = container.volumesFrom
  #       environment = container.environment
  #       secrets     = container.secrets
  #     }
  #   ]
  # )
}

resource "aws_ecs_service" "service" {
  name                               = "${var.ecs_cluster_name}-service"
  cluster                            = aws_ecs_cluster.cluster.id
  task_definition                    = aws_ecs_task_definition.app.arn
  desired_count                      = var.desired_count
  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200
  launch_type                        = "FARGATE"
  scheduling_strategy                = "REPLICA"

  network_configuration {
    security_groups = [aws_security_group.ecs.id]
    subnets         = var.private_subnet_ids
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.default.arn
    container_name   = var.container_name
    container_port   = var.container_port
  }

  # dynamic "load_balancer" {
  #   for_each = flatten([
  #     for container in local.exposed_containers : [
  #       for arn in container.target_group_arns : {
  #         name = container.name
  #         port = container.port
  #         arn  = arn
  #       }
  #     ]
  #   ])
  #   content {
  #     target_group_arn = load_balancer.value["arn"]
  #     container_name   = load_balancer.value["name"]
  #     container_port   = load_balancer.value["port"]
  #   }
  # }

  depends_on = [
    aws_alb_listener.ecs-alb-http-listener, aws_iam_role_policy_attachment.ecs_task_execution_role
  ]
}

resource "aws_appautoscaling_target" "ecs_target" {
  max_capacity       = var.asg_max
  min_capacity       = var.asg_min
  resource_id        = "service/${aws_ecs_cluster.cluster.name}/${aws_ecs_service.service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

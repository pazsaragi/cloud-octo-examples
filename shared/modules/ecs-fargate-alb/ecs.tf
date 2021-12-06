resource "aws_ecs_cluster" "production" {
  name = "${var.ecs_cluster_name}-cluster"
}

# resource "aws_launch_configuration" "ecs" {
#   name                        = "${var.ecs_cluster_name}-cluster"
#   image_id                    = lookup(var.amis, var.region)
#   instance_type               = var.instance_type
#   security_groups             = [aws_security_group.ecs.id]
#   iam_instance_profile        = aws_iam_instance_profile.ecs.name
#   key_name                    = aws_key_pair.production.key_name
#   associate_public_ip_address = true
#   user_data                   = "#!/bin/bash\necho ECS_CLUSTER='${var.ecs_cluster_name}-cluster' > /etc/ecs/ecs.config"
# }

data "template_file" "app" {
  template = file("templates/django_app.json.tpl")

  vars = {
    docker_image_url_django = aws_ecr_repository.production.repository_url
    region                  = var.region
    tag = "latest"
  }
}

resource "aws_ecs_task_definition" "app" {
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  family = "django-app"
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  container_definitions    = data.template_file.app.rendered
}

resource "aws_ecs_service" "production" {
  name                               = "${var.ecs_cluster_name}-service"
  cluster                            = aws_ecs_cluster.production.id
  task_definition                    = aws_ecs_task_definition.app.arn
  # iam_role                           = aws_iam_role.ecs-service-role.arn
  desired_count                      = var.app_count
  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200
  launch_type                        = "FARGATE"
  scheduling_strategy                = "REPLICA"

  network_configuration {
    security_groups = [aws_security_group.ecs.id]
    subnets = [
      aws_subnet.private-subnet-1.id, aws_subnet.private-subnet-2.id
    ]
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.default-target-group.arn
    container_name   = "django-app"
    container_port   = 80
  }

  # ignore changes to task definition
  # lifecycle {
  #   ignore_changes = [task_definition, desired_count]
  # }

  depends_on = [
    aws_alb_listener.ecs-alb-http-listener, aws_iam_role_policy_attachment.ecs_task_execution_role
  ]
}

resource "aws_appautoscaling_target" "ecs_target" {
  max_capacity       = 4
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.production.name}/${aws_ecs_service.production.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

# autoscaling based on memory
# resource "aws_appautoscaling_policy" "ecs_policy_memory" {
#   name               = "memory-autoscaling"
#   policy_type        = "TargetTrackingScaling"
#   resource_id        = aws_appautoscaling_target.ecs_target.resource_id
#   scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
#   service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace

#   target_tracking_scaling_policy_configuration {
#    predefined_metric_specification {
#      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
#    }

#    target_value       = 80
#   }
# }

# resource "aws_appautoscaling_policy" "ecs_policy_cpu" {
#   name               = "cpu-autoscaling"
#   policy_type        = "TargetTrackingScaling"
#   resource_id        = aws_appautoscaling_target.ecs_target.resource_id
#   scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
#   service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace

#   target_tracking_scaling_policy_configuration {
#    predefined_metric_specification {
#      predefined_metric_type = "ECSServiceAverageCPUUtilization"
#    }

#    target_value       = 60
#   }
# }
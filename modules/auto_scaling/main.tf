resource "aws_appautoscaling_target" "target" {
  service_namespace = "ecs"
  resource_id = "service/${var.ecs_cluster_name}/${var.ecs_service_name}"
  scalable_dimension = "ecs:service:DesiredCount"

  min_capacity = var.min_capacity
  max_capacity = var.max_capacity
}

resource "aws_appautoscaling_policy" "memory" {
    name = "fargate-memory-policy"
    policy_type = "TargetTrackingScaling"
    resource_id = aws_appautoscaling_target.target.id
    scalable_dimension = aws_appautoscaling_target.target.scalable_dimension
    service_namespace = aws_appautoscaling_target.target.service_namespace

    target_tracking_scaling_policy_configuration {
        predefined_metric_specification {
            metric_name = "ECSServiceAverageMemoryUtilization"
        }

        target_value = var.target_memory_utilization
    }
}

resource "aws_appautoscaling_policy" "cpu" {
    name = "fargate-cpu-policy"
    policy_type = "TargetTrackingScaling"
    resource_id = aws_appautoscaling_target.target.id
    scalable_dimension = aws_appautoscaling_target.target.scalable_dimension
    service_namespace = aws_appautoscaling_target.target.service_namespace

    target_tracking_scaling_policy_configuration {
        predefined_metric_specification {
            metric_name = "ECSServiceCPUUtilization"
        }

        target_value = var.target_cpu_utilization
    }
}
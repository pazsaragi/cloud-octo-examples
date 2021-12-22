
resource "aws_lb" "lb" {
  name               = "${var.ecs_cluster_name}-alb"
  load_balancer_type = "application"
  security_groups    = [aws_security_group.load-balancer.id]
  subnets            = var.public_subnet_ids
}

resource "aws_alb_target_group" "default" {
  name        = "${var.ecs_cluster_name}-tg"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = var.health_check_path
    port                = "traffic-port"
    healthy_threshold   = 5
    unhealthy_threshold = 2
    timeout             = 20
    interval            = 150
    matcher             = "200-299"
  }
}

# Listener (redirects traffic from the load balancer to the target group)
resource "aws_alb_listener" "ecs-alb-http-listener" {
  load_balancer_arn = aws_lb.lb.id
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.default.arn
  }
}

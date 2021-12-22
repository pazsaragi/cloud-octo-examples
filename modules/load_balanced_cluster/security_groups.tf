# ALB SG (Internet -> ALB)
resource "aws_security_group" "load-balancer" {
  name        = "internet-to-alb"
  description = "Controls access to ALB"
  vpc_id      = var.vpc_id

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    description = "Internet traffic to ALB"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    description = "Internet traffic to ALB"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
  }

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    description = "ALB traffic to Internet"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
  }
}

# ECS SG (ALB -> ECS, ssh -> ECS)
resource "aws_security_group" "ecs" {
  name        = "alb-to-ecs"
  description = "Allows inbound access from ALB only"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.load-balancer.id]
  }

  # {
  #   from_port   = 22
  #   to_port     = 22
  #   protocol    = 22
  #   cidr_blocks = ["0.0.0.0/0"]
  #   description = "SSH access into ec2"
  # }

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
  }
}

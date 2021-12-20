data "aws_availability_zones" "available_zones" {
  state = "available"
  provider = aws.london
}

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  provider = aws.london
}

resource "aws_subnet" "public" {
  count                   = 2
  cidr_block              = cidrsubnet(aws_vpc.main.cidr_block, 8, 2 + count.index)
  availability_zone       = data.aws_availability_zones.available_zones.names[count.index]
  vpc_id                  = aws_vpc.main.id
  map_public_ip_on_launch = true
  provider = aws.london
}

resource "aws_subnet" "private" {
  count             = 2
  cidr_block        = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index)
  availability_zone = data.aws_availability_zones.available_zones.names[count.index]
  vpc_id            = aws_vpc.main.id
  provider = aws.london
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id
  provider = aws.london
}

resource "aws_route" "internet_access" {
  route_table_id         = aws_vpc.main.main_route_table_id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.gw.id
  provider = aws.london
}


resource "aws_eip" "gateway" {
  count      = 2
  vpc        = true
  depends_on = [aws_internet_gateway.gw]
  provider = aws.london
}

resource "aws_nat_gateway" "gateway" {
  count         = 2
  subnet_id     = element(aws_subnet.public.*.id, count.index)
  allocation_id = element(aws_eip.gateway.*.id, count.index)
  provider = aws.london
}

resource "aws_route_table" "private" {
  count  = 2
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = element(aws_nat_gateway.gateway.*.id, count.index)
  }
  provider = aws.london
}

resource "aws_route_table_association" "private" {
  count          = 2
  subnet_id      = element(aws_subnet.private.*.id, count.index)
  route_table_id = element(aws_route_table.private.*.id, count.index)
  provider = aws.london
}

resource "aws_security_group" "alb" {
  name        = "lb-sg"
  description = "controls access to the Application Load Balancer (ALB)"
  vpc_id      = aws_vpc.main.id
  provider = aws.london

  ingress {
    protocol    = "tcp"
    from_port   = 80
    to_port     = 80
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "ecs_tasks" {
  name        = "ecs-tasks-sg"
  description = "allow inbound access from the ALB only"
  vpc_id      = aws_vpc.main.id
  provider = aws.london

  ingress {
    protocol        = "tcp"
    from_port       = 4000
    to_port         = 4000
    cidr_blocks     = ["0.0.0.0/0"]
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lb" "alb" {
  name               = "alb"
  subnets            = aws_subnet.public.*.id
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  provider = aws.london
}

resource "aws_lb_target_group" "tg" {
  name        = "alb-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"
  provider = aws.london

  health_check {
    healthy_threshold   = "3"
    interval            = "150"
    protocol            = "HTTP"
    matcher             = "200-299"
    timeout             = "20"
    path                = "/health"
    unhealthy_threshold = "2"
  }
}

resource "aws_lb_listener" "https_forward" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg.arn
  }
  provider = aws.london
}

resource "aws_ecr_repository" "repo" {
  name = "threetier"
  provider = aws.london
}

resource "aws_ecr_lifecycle_policy" "repo-policy" {
  repository = aws_ecr_repository.repo.name
  provider = aws.london

  policy = <<EOF
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep image deployed with tag latest",
      "selection": {
        "tagStatus": "tagged",
        "tagPrefixList": ["latest"],
        "countType": "imageCountMoreThan",
        "countNumber": 1
      },
      "action": {
        "type": "expire"
      }
    },
    {
      "rulePriority": 2,
      "description": "Keep last 2 any images",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 2
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}
EOF
}

data "aws_iam_policy_document" "ecs_task_execution_role" {
  version = "2012-10-17"
  statement {
    sid     = ""
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_task_execution_role" {
  provider = aws.london
  name               = "ecs-staging-execution-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_execution_role.json
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role" {
  provider = aws.london
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

data "template_file" "app_template" {
  template = file("./task.json.tpl")
  vars = {
    aws_ecr_repository = aws_ecr_repository.repo.repository_url
    tag                = "latest"
    app_port           = 80
    access_key         = var.access_key
    secret_key         = var.secret_key
  }
}

resource "aws_ecs_task_definition" "service" {
  provider = aws.london
  family                   = "threetier"
  network_mode             = "awsvpc"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  cpu                      = 256
  memory                   = 512
  requires_compatibilities = ["FARGATE"]
  container_definitions    = data.template_file.app_template.rendered
}

resource "aws_ecs_cluster" "three_tier_cluster" {
  name = "three_tier_cluster"
  provider = aws.london
}

resource "aws_ecs_service" "threetier_service" {
  provider = aws.london
  name            = "threetier"
  cluster         = aws_ecs_cluster.three_tier_cluster.id
  task_definition = aws_ecs_task_definition.service.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    security_groups = [aws_security_group.ecs_tasks.id]
    subnets         = aws_subnet.private.*.id
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.tg.arn # id?
    container_name   = "threetier_api"
    container_port   = 4000
  }

  depends_on = [aws_lb_listener.https_forward, aws_iam_role_policy_attachment.ecs_task_execution_role]

}

resource "aws_dynamodb_table" "auth_table" {
  name         = "auth-table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"
  range_key    = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }
  provider = aws.london
}

resource "aws_cloudwatch_log_group" "threetier_logs" {
  name = "awslogs-threetier"
  provider = aws.london
}

resource "null_resource" "push" {
  provisioner "local-exec" {
    command     = "${coalesce("sh push.sh", "${path.module}/push.sh")} ${var.source_path} ${aws_ecr_repository.repo.repository_url} ${var.tag} ${var.account_id}"
    interpreter = ["bash", "-c"]
  }
}

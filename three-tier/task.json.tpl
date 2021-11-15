[
  {
    "name": "threetier_api",
    "image": "${aws_ecr_repository}:${tag}",
    "essential": true,
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-region": "eu-west-2",
        "awslogs-stream-prefix": "threetier-service",
        "awslogs-group": "awslogs-threetier"
      }
    },
    "portMappings": [
      {
        "containerPort": 4000,
        "hostPort": 4000,
        "protocol": "tcp"
      }
    ],
    "cpu": 1,
    "environment": [
      {
        "name": "NODE_ENV",
        "value": "DEV"
      },
      {
        "name": "PORT",
        "value": "4000"
      },
      {
        "name": "AWS_ACCESS_KEY_ID",
        "value": "${access_key}"
      },
      {
        "name": "AWS_SECRET_ACCESS_KEY",
        "value": "${secret_key}"
      }
    ],
    "ulimits": [
      {
        "name": "nofile",
        "softLimit": 65536,
        "hardLimit": 65536
      }
    ],
    "mountPoints": [],
    "memory": 512,
    "volumesFrom": []
  }
]


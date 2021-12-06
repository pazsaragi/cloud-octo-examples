[
  {
    "name": "django-app",
    "image": "${docker_image_url_django}:${tag}",
    "essential": true,
    "cpu": 1,
    "memory": 512,
    "mountPoints": [],
    "links": [],
    "portMappings": [
      {
        "containerPort": 80,
        "protocol": "tcp"
      }
    ],
    "command": ["gunicorn", "-w", "3", "-b", ":80", "hello_django.wsgi:application"],
    "environment": [],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/django-app",
        "awslogs-region": "${region}",
        "awslogs-stream-prefix": "django-app-log-stream"
      }
    },
    "volumesFrom": []
  }
]
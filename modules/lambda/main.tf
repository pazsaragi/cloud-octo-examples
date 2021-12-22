variable "name" {
}

variable "role_arn" {
}

resource "aws_lambda_function" "lambda" {
  function_name = var.name
  role          = var.role_arn
}
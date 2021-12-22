resource "aws_cloudwatch_log_group" "group" {
  name              = var.name
  retention_in_days = var.log_retention
}

resource "aws_cloudwatch_log_stream" "stream" {
  name           = "${var.name}-stream"
  log_group_name = aws_cloudwatch_log_group.group.name
}
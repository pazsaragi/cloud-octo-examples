output "log_stream_name" {
  value = aws_cloudwatch_log_stream.stream.name
}

output "log_group_name" {
  value = aws_cloudwatch_log_group.group.name
}
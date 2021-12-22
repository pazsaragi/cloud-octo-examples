output "rds_db_name" {
  value = aws_db_instance.db.name
}

output "rds_host" {
  value = aws_db_instance.db.address
}

output "rds_port" {
  value = aws_db_instance.db.port
}
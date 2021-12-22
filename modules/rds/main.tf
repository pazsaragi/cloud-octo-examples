resource "aws_db_subnet_group" "subnetgroup" {
  name       = "main"
  subnet_ids = var.subnet_ids
}

resource "aws_db_instance" "db" {
  identifier              = var.rds_db_name
  name                    = var.rds_db_name
  username                = var.rds_username
  password                = var.rds_password
  port                    = "5432"
  engine                  = "postgres"
  engine_version          = "12.3"
  instance_class          = var.rds_instance_class
  allocated_storage       = var.allocated_storage
  storage_encrypted       = false
  vpc_security_group_ids  = [var.security_group_id]
  db_subnet_group_name    = aws_db_subnet_group.subnetgroup.name
  multi_az                = false
  storage_type            = "gp2"
  publicly_accessible     = false
  backup_retention_period = var.retention
  skip_final_snapshot     = true
}

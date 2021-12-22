variable "rds_db_name" {
  description = "RDS database name"
  default     = "dev"
}
variable "rds_username" {
  description = "RDS database username"
  default     = "foo"
}
variable "rds_password" {
  description = "RDS database password"
}
variable "rds_instance_class" {
  description = "RDS instance type"
  default     = "db.t2.micro"
}
variable "vpc_id" {
  description = "VPC ID"
}
variable "allocated_storage" {
  description = "The size of the database (Gb)"
  default     = "20"
}
variable "subnet_ids" {
  description = "The list of subnet IDs in your VPC"
}
variable "security_group_id" {
  description = "The security group ID for the RDS security group"
}
variable "retention" {
  description = "The number of days to retain automated backups"
  default     = "7"
}
output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "The IDs of the subnets"
  value       = [aws_subnet.public-subnet-1.id, aws_subnet.public-subnet-2.id]
}

output "private_subnet_ids" {
  description = "The IDs of the subnets"
  value       = [aws_subnet.private-subnet-1.id, aws_subnet.private-subnet-2.id]
}
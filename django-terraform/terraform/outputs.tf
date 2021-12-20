output "load_balancer_ip" {
  value = aws_lb.production.dns_name
}
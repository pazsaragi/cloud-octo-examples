terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.27"
    }
  }

  backend "s3" {
    bucket = "cloud-octo-terraform-remote-state"
    key    = "state/dyanmodb-dax/state.json"
    region = "eu-west-2"

    dynamodb_table = "cloud-octo-terraform-state-lock-dynamo"
    encrypt        = true
  }

  required_version = ">= 0.14.9"
}

provider "aws" {
  profile = "default"
  region  = "eu-west-2"

  default_tags {
    tags = {
      Environment = "dev"
      Owner       = "cloud-octo"
      Project     = "dyanmodb-dax"
    }
  }
}

resource "aws_default_vpc" "default" {}

data "aws_subnet_ids" "default" {
  vpc_id = aws_default_vpc.default.vpc_id
}

# Create DyanmoDB Table
resource "aws_dynamodb_table" "main_table" {
  name = var.table_name
  billing_mode = "PAY_PER_REQUEST"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }
}

# Create DAX Subnet Group
resource "aws_dax_subnet_group" "subnet_group" {
  name       = var.cluster_name
  subnet_ids = var.subnet_ids ? var.subnet_ids : aws_subnet_ids.default.ids
}

# Create DAX Subnet Group
resource "aws_dax_parameter_group" "parameter_group" {
  name = var.cluster_name

  parameters {
    name  = "query-ttl-millis"
    value = var.query_ttl
  }

  parameters {
    name  = "record-ttl-millis"
    value = var.record_ttl
  }
}

# Create DAX Cluster
resource "aws_dax_cluster" "cluster" {
  cluster_name       = var.cluster_name
  iam_role_arn       = var.iam_role_arn
  node_type          = var.node_type
  replication_factor = var.node_count
  server_side_encryption {
    enabled = var.server_side_encryption
  }
  parameter_group_name = aws_dax_parameter_group.parameter_group.name
  subnet_group_name    = aws_dax_subnet_group.subnet_group.name
  maintenance_window   = var.maintenance_window
  security_group_ids   = var.security_group_ids
}

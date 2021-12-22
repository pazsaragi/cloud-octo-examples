resource "aws_dynamodb_table" "table" {
  name           = var.name
  billing_mode   = var.billing_mode
  read_capacity  = var.rcus
  write_capacity = var.wcus
  hash_key       = var.hash_key
  range_key      = var.range_key

  attribute {
    name = var.hash_key
    type = "S"
  }

  attribute {
    name = var.range_key
    type = "S"
  }

  global_secondary_index {
    name            = var.gsi.name
    hash_key        = var.gsi.hash_key
    range_key       = var.gsi.range_key
    write_capacity  = var.gsi.write_capacity
    read_capacity   = var.gsi.read_capacity
    projection_type = var.gsi.projection_type
  }

  ttl {
    attribute_name = "TimeToExist"
    enabled        = false
  }

}

variable "name" {
  description = "The name of the DynamoDB table"
  type        = string
}

variable "billing_mode" {
  description = "The billing mode of the DynamoDB table"
  type        = string
  default     = "PAY_PER_REQUEST"
}

variable "rcus" {
  description = "The read capacity units of the DynamoDB table"
  type        = number
  default     = 20
}

variable "wcus" {
  description = "The write capacity units of the DynamoDB table"
  type        = number
  default     = 20
}

variable "hash_key" {
  description = "The hash key of the DynamoDB table"
  type        = string
  default     = "pk"
}

variable "range_key" {
  description = "The range key of the DynamoDB table"
  type        = string
  default     = "sk"
}

variable "gsi" {
  description = "The global secondary index of the DynamoDB table"
}

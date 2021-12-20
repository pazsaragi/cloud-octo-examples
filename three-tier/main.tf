terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.27"
    }
  }

  backend "s3" {
    bucket = "cloud-octo-terraform-remote-state"
    key    = "state/threetier/state.json"
    region = "eu-west-2"

    dynamodb_table = "cloud-octo-terraform-state-lock-dynamo"
    encrypt        = true
  }

  required_version = ">= 0.14.9"
}

provider "aws" {
  profile = "default"
  region  = "us-east-1"

  default_tags {
    tags = {
      Environment = "dev"
      Owner       = "cloud-octo"
      Project     = "three-tier"
    }
  }
}

provider "aws" {
  alias  = "london"
  region = "eu-west-2"

  default_tags {
    tags = {
      Environment = "dev"
      Owner       = "cloud-octo"
      Project     = "three-tier"
    }
  }
}

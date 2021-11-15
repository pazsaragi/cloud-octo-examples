#!/bin/sh

set -e

docker pull hashicorp/terraform

docker run --rm -it --name terraform -v $(pwd):/workspace -w /workspace hashicorp/terraform:light apply digitalocean.tf
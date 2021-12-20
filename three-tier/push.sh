#!/bin/bash
# 
# Builds a Docker image and pushes to an AWS ECR repository

# name of the file - push.sh

set -e

source_path="$1" # 1st argument from command line
repository_url="$2" # 2nd argument from command line
tag="${3:-latest}" # Checks if 3rd argument exists, if not, use "latest"
account="$4"

# splits string using '.' and picks 4th item
region="$(echo "$repository_url" | cut -d. -f4)" 

# splits string using '/' and picks 2nd item
image_name="$(echo "$repository_url" | cut -d/ -f2)" 

# builds docker image
(cd "$source_path" && docker build -t "$image_name" .) 

# login to ecr
# $(aws ecr get-login-password --region eu-west-2)
echo $(aws ecr get-login-password --region "$region" | docker login --username AWS --password-stdin "$account_id".dkr.ecr."$region".amazonaws.com)

# tag image
docker tag "$image_name" "$repository_url":"$tag"

# push image
docker push "$repository_url":"$tag" 
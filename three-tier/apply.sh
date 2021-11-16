#!/bin/bash

terraform apply \
    -var="account_id="$ACCOUNT \
    -var="access_key="$AWS_ACCESS_KEY_ID \
    -var="secret_key="$AWS_SECRET_ACCESS_KEY \
    -auto-approve
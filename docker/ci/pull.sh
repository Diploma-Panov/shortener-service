#!/bin/bash

# shellcheck disable=SC2046
docker login -u AWS -p $(aws ecr get-login-password --region eu-central-1) 533267200006.dkr.ecr.eu-central-1.amazonaws.com

docker compose pull
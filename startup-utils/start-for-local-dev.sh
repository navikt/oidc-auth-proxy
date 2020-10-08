#!/usr/bin/env bash

bash ./create-env-file.sh ../.env localhost

docker-compose down
docker-compose pull

docker-compose up -d azure-mock
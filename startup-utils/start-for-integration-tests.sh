#!/usr/bin/env bash

bash ./create-env-file.sh .env azure-mock

docker-compose down
docker-compose pull -q

cd ..

rm -rf node_modules/
rm -rf dist/
npm install
npm run build
rm -rf node_modules/
npm install --only=production

cd startup-utils

docker-compose up --build "$@"
#!/usr/bin/env bash

bash ./create-env-file.sh .env azure-mock

docker-compose down

cd ..

npm install
npm run build
rm -rf node_modules/
npm install --only=production

cd  integration-tests

docker-compose up --build "$@"
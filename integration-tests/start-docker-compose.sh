#!/usr/bin/env bash

docker-compose down

cd ..

npm install
npm run build
rm -rf node_modules/
npm install --only=production

cd  integration-tests

docker-compose up "$@"
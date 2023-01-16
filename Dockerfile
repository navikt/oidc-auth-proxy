FROM navikt/common:0.1 AS navikt-common
FROM node:19-alpine
LABEL org.opencontainers.image.source=https://github.com/navikt/oidc-auth-proxy

COPY --from=navikt-common /init-scripts /init-scripts
COPY --from=navikt-common /entrypoint.sh /entrypoint.sh
COPY --from=navikt-common /dumb-init /dumb-init

COPY docker/start-node-server.sh /run-script.sh

RUN chmod +x /entrypoint.sh /run-script.sh
RUN apk add jq

COPY dist ./dist
COPY node_modules ./node_modules
COPY package.json .

WORKDIR /usr/src/app

ENTRYPOINT ["/dumb-init", "--", "/entrypoint.sh"]

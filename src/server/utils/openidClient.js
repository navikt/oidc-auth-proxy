import config from "./config";
import { httpProxy } from './httpProxy';
import { Issuer, custom } from 'openid-client';
import logger from './log';

const metadata = {
    client_id: config.clientId,
    token_endpoint_auth_method: 'private_key_jwt',
    token_endpoint_auth_signing_alg: 'RS256'
};

export function configureHttpProxy() {
    if (httpProxy) {
        logger.info("Registrerer http proxy for openid-client requests.")
        custom.setHttpOptionsDefaults({
            agent: httpProxy
        });
    } else {
        logger.info("openid-client requester går uten http proxy.")
    }
}

export async function buildIssuer() {
    return Issuer.discover(config.discoveryUrl);
}

export function buildClient(issuer) {
    return new issuer.Client(metadata, config.jwks);;
}

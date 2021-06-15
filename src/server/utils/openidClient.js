import { httpProxy } from './httpProxy';
import { Issuer, custom } from 'openid-client';
import logger from './log';

export function configureHttpProxy() {
    if (httpProxy) {
        logger.info('Registrerer http proxy for openid-client requests.');
        custom.setHttpOptionsDefaults({
            agent: httpProxy,
        });
    } else {
        logger.info('openid-client requester går uten http proxy.');
    }
}

export async function buildIssuer({discoveryUrl}) {
    return Issuer.discover(discoveryUrl);
}

export function buildClient({issuer, clientId, jwks}) {
    return new issuer.Client({
        client_id: clientId,
        token_endpoint_auth_method: 'private_key_jwt',
        token_endpoint_auth_signing_alg: 'RS256',
    }, jwks);
}

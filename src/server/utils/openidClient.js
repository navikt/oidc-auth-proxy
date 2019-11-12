import config from "./config";
import { httpProxy } from './httpProxy';
import { Issuer, custom } from 'openid-client';

const metadata = {
    client_id: config.clientId,
    token_endpoint_auth_method: 'private_key_jwt',
    token_endpoint_auth_signing_alg: 'RS256'
};

export async function buildIssuer() {
    if (httpProxy) {
        Issuer[custom.http_options] = function(options) {
            options.agent = httpProxy;
            return options;
        };
    }
    return Issuer.discover(config.discoveryUrl);
}

export function buildClient(issuer) {
    const client = new issuer.Client(metadata, config.jwks);
    if (httpProxy) {
        client[custom.http_options] = function(options) {
            options.agent = httpProxy;
            return options;
        };
    }
    return client;
}

import config from "./config";

const metadata = {
    client_id: config.clientId,
    token_endpoint_auth_method: 'private_key_jwt',
    token_endpoint_auth_signing_alg: 'RS256'
};

export function buildClient(issuer) {
    return new issuer.Client(metadata, config.jwks);
}

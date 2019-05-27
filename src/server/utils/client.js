import jwks from './jwks';

const metadata = {
    client_id: process.env.CLIENT_ID,
    token_endpoint_auth_method: 'private_key_jwt',
    token_endpoint_auth_signing_alg: 'RS256'
};

export function buildClient(issuer) {
    return new issuer.Client(metadata, jwks);
}

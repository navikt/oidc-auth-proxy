import { getClientId, getJwks } from "./config";

const metadata = {
    client_id: getClientId(),
    token_endpoint_auth_method: 'private_key_jwt',
    token_endpoint_auth_signing_alg: 'RS256'
};

export function buildClient(issuer) {
    return new issuer.Client(metadata, getJwks());
}

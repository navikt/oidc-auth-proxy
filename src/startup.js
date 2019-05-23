import dotenv from 'dotenv';
import { Issuer } from 'openid-client';
import startServer from './server';
import { createKeystore } from './server/utils/keystore';
import jose from 'node-jose';

dotenv.config();

const token_endpoint_auth_method = 'private_key_jwt';
const token_endpoint_auth_signing_alg = 'RS256';

async function startApp() {
    try {
        const issuer = await Issuer.discover(
            process.env.OPENID_CONFIGURATION_URL
        );
        const keyStore = await createKeystore();
        const jwk = await jose.JWK.asKey(process.env.PRIVATE_KEY).then(
            result => result
        );
        const jwks = {
            keys: [JSON.parse(process.env.PRIVATE_KEY)]
        };
        console.log(jwks);
        const client = new issuer.Client(
            {
                client_id: process.env.CLIENT_ID,
                token_endpoint_auth_method,
                token_endpoint_auth_signing_alg
            },
            jwks
        );
        startServer(client);
    } catch (error) {
        console.error('Error during start-up', error);
    }
}

startApp();

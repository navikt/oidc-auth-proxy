import dotenv from 'dotenv';
import { Issuer } from 'openid-client';
import startServer from './server';
import { buildClient } from './server/utils/client';

dotenv.config();

async function startApp() {
    try {
        const issuer = await Issuer.discover(
            process.env.OPENID_CONFIGURATION_URL
        );
        const client = buildClient(issuer);
        startServer(client);
    } catch (error) {
        console.error('Error during start-up', error);
    }
}

startApp();

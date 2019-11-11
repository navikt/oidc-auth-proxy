import { Issuer } from 'openid-client';
import startServer from './server';
import { buildClient } from './server/utils/client';
import { getDiscoveryUrl } from './server/utils/config';

async function startApp() {
    try {
        const issuer = await Issuer.discover(getDiscoveryUrl());
        const client = buildClient(issuer);
        startServer(client);
    } catch (error) {
        console.error('Error during start-up', error);
    }
}

startApp();

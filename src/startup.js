import { Issuer } from 'openid-client';
import startServer from './server';
import { buildClient } from './server/utils/client';
import config from './server/utils/config';
import "core-js/stable";
import "regenerator-runtime/runtime";
import logger from './server/utils/log';

async function startApp() {
    try {
        const issuer = await Issuer.discover(config.discoveryUrl);
        const client = buildClient(issuer);
        startServer(client);
    } catch (error) {
        logger.error("Feil ved oppstart", error);
    }
}

startApp();

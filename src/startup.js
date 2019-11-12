import startServer from './server';
import { buildIssuer, buildClient } from './server/utils/openidClient';
import logger from './server/utils/log';

import "core-js/stable";
import "regenerator-runtime/runtime";

async function startApp() {
    try {
        const issuer = await buildIssuer();
        const client = buildClient(issuer);
        startServer(client);
    } catch (error) {
        logger.error("Feil ved oppstart", error);
    }
}

startApp();

import startServer from './server';
import { buildIssuer, buildClient, configureHttpProxy } from './server/utils/openidClient';
import logger from './server/utils/log';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import config from "./server/utils/config";

async function startApp() {
    try {
        configureHttpProxy();
        const issuer = await buildIssuer(config.discoveryUrl);
        const client = buildClient(issuer, config.clientId, config.jwks);

        const tokenExchangeIssuer = await buildIssuer(config.tokenExchangeDiscoveryUrl);
        const tokenExchangeClient = buildClient(tokenExchangeIssuer, config.tokenExchangeClientId, config.tokenExchangeJwks);

        startServer(client, tokenExchangeClient);
    } catch (error) {
        logger.error('Feil ved oppstart', error);
        process.exit(1);
    }
}

startApp();

import startServer from './server';
import { buildIssuer, buildClient, configureHttpProxy } from './server/utils/openidClient';
import logger from './server/utils/log';
import config from './server/utils/config';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

async function startApp() {
    try {
        configureHttpProxy();
        
        const loginIssuer = await buildIssuer({
            discoveryUrl: config.discoveryUrl
        });
        const loginClient = buildClient({
            issuer: loginIssuer, 
            clientId: config.clientId, 
            jwks: config.jwks
        });

        const onBehalfOfIssuer = await buildIssuer({
            discoveryUrl: config.onBehalfOfDiscoveryUrl
        });

        const onBehalfOfClient = buildClient({
            issuer: onBehalfOfIssuer,
            clientId: config.onBehalfOfClientId,
            jwks: config.onBehalfOfJwks
        });

        startServer({loginClient, onBehalfOfClient});
    } catch (error) {
        logger.error('Feil ved oppstart', error);
        process.exit(1);
    }
}

startApp();

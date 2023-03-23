import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import session from 'express-session';
import proxy from 'express-http-proxy';
import cors from 'cors';
import callbackRoutes from './routes/callback';
import { getProxyOptions } from './utils/proxy';
import { WebSocketProxy } from './utils/wsProxy';
import config from './utils/config';
import k8sRoutes from './routes/k8s';
import logger from './utils/log';
import { getSessionStore } from './utils/sessionStore';
import { loginRoutes } from './routes/login';
import { logoutRoutes } from './routes/logout';
import { meRoutes } from './routes/me';

export default ({ loginClient, onBehalfOfClient }) => {
    const server = express();
    const sessionStore = getSessionStore();

    server.use(
        helmet({
            frameguard: false,
        })
    );
    server.use(
        cors({
            origin: config.applicationBaseUrl,
            credentials: true,
            allowedHeaders: config.getCorsAllowedHeaders(),
            exposedHeaders: config.getCorsExposedHeaders(),
        })
    );

    server.use(
        bodyParser.urlencoded({
            extended: true,
        })
    );
    server.set('trust proxy', 1);

    const sessionParser = session({
        store: sessionStore,
        name: config.sessionIdCookieName,
        secret: config.sessionIdCookieSecrets,
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 3599000,
            secure: config.sessionIdCookieProperties.secure,
            httpOnly: true,
            sameSite: config.sessionIdCookieProperties.sameSite,
        },
    });

    server.use(sessionParser);

    const webSocketProxy = new WebSocketProxy(onBehalfOfClient);

    config.proxyConfig.apis.forEach((api) => {
        server.use(`/api/${api.path}*`, proxy(api.url, getProxyOptions(api, onBehalfOfClient)));
        const webSocket = webSocketProxy.leggTil({ api });
        if (webSocket) {
            server.use(webSocket.path, webSocket.middleware);
        }
    });

    callbackRoutes(server, loginClient);
    loginRoutes(server, loginClient);
    logoutRoutes(server);
    meRoutes(server);
    k8sRoutes(server);

    const port = process.env.PORT || 8080;

    server
        .listen(port, () => {
            logger.info(`Lytter på port ${port}`);
        })
        .on('upgrade', async function (request, socket, head) {
            sessionParser(request, {}, async () => {
                webSocketProxy.handleUpgrade({ request, socket, head });
            });
        });
};

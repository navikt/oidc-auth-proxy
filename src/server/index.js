import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import session from 'express-session';
import proxy from 'express-http-proxy';
import cors from 'cors';
import callbackRoutes from './routes/callback';
import { getProxyOptions } from './utils/proxy';
import config from './utils/config';
import k8sRoutes from './routes/k8s';
import logger from './utils/log';
import { getSessionStore } from './utils/sessionStore';
import { loginRoutes } from './routes/login';
import { logoutRoutes } from './routes/logout';
import { meRoutes } from './routes/me';

export default authClient => {
    const server = express();
    const sessionStore = getSessionStore(session);

    server.use(helmet({
        frameguard: false
    }));
    server.use(cors({
        origin: config.applicationBaseUrl,
        credentials: true,
        allowedHeaders: ['Content-Type', 'Referer'],
        exposedHeaders: ['Location']
    }));
    
    server.use(bodyParser.urlencoded({
        extended: true
    }));
    server.set('trust proxy', 1);

    server.use(session({
        store: sessionStore,
        name: config.sessionIdCookieName,
        secret: config.sessionIdCookieSecrets,
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 3599000,
            secure: config.sessionIdCookieSecure,
            httpOnly: true
        }
    }));

    config.proxyConfig.apis.forEach(api =>
        server.use(`/api/${api.path}*`, proxy(api.url, getProxyOptions(api, authClient)))
    );
    
    callbackRoutes(server, authClient);
    loginRoutes(server, authClient);
    logoutRoutes(server);
    meRoutes(server);
    k8sRoutes(server);

    const port = process.env.PORT || 8080;
    server.listen(port, () => {
        logger.info(`Lytter på port ${port}`);
    });
};
import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import session from 'express-session';
import proxy from 'express-http-proxy';
import cors from './cors/cors';
import callbackRoutes from './routes/callback';
import { getProxyOptions } from './utils/proxy';
import { getProxyConfig, getSessionIdCookieSecrets, getSessionIdCookieSecure } from './utils/config';
import k8sRoutes from './routes/k8s';
import logger from './utils/log';

export default authClient => {
    const server = express();

    server.use(helmet());
    server.use(cors);
    server.use(bodyParser.urlencoded({
        extended: true
    }));
    server.use(session({ 
        secret: getSessionIdCookieSecrets,
        maxAge: 3599000,
        httpOnly: true,
        secure: getSessionIdCookieSecure(),
        resave: false,
        saveUninitialized: false
    }));

    getProxyConfig().apis.forEach(api =>
        server.use(`/api/${api.path}*`, proxy(api.url, getProxyOptions(api, authClient)))
    );
    
    callbackRoutes(server, authClient);
    k8sRoutes(server);

    const port = process.env.PORT || 8080;
    server.listen(port, () => {
        logger.info(`Lytter på port ${port}`);
    });
};

import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import session from 'express-session';
import proxy from 'express-http-proxy';
import cors from './cors/cors';
import configRoutes from './routes/routes';
import { getProxyApis, getProxyPrefix, getProxyOptions } from './utils/proxy';

export default authClient => {
    const server = express();

    server.use(helmet());
    server.use(cors);
    server.use(bodyParser.urlencoded());
    server.use(session({ secret: 'awesome secret' }));

    getProxyApis().forEach(api =>
        server.use(`${getProxyPrefix()}/${api.path}*`, proxy(api.url, getProxyOptions(api, authClient)))
    );
    configRoutes(server, authClient);

    const port = process.env.PORT || 8080;
    server.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });
};

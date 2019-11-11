import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import session from 'express-session';
import proxy from 'express-http-proxy';
import cors from './cors/cors';
import configRoutes from './routes/routes';
import { getProxyOptions } from './utils/proxy';
import { getProxyConfig } from './utils/config';

export default authClient => {
    const server = express();

    server.use(helmet());
    server.use(cors);
    server.use(bodyParser.urlencoded());
    server.use(session({ secret: 'awesome secret' }));

    getProxyConfig().apis.forEach(api =>
        server.use(`/api/${api.path}*`, proxy(api.url, getProxyOptions(api, authClient)))
    );

    configRoutes(server, authClient);


    server.get('/isready', function ({res}) {res.send('READY!')});
    server.get('/isalive', function ({res}) {res.send('ALIVE!')});

    const port = process.env.PORT || 8080;
    server.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });
};

import express from 'express';
import helmet from 'helmet';
import cors from './cors/cors';
import getRoutes from './routes/routes';

export default (client) => {
    const server = express();

    console.log('Auth url', client.authorizationUrl({}));

    server.use(helmet());
    server.use(cors);
    server.use((req, res, next) => getRoutes(req, res, next, client));

    const port = process.env.PORT || 1337;
    server.listen(port, () => {
        console.log(`Listening on port ${port}`)
    });
}

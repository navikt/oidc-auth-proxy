import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cors from './cors/cors';
import configRoutes from './routes/routes';

export default authClient => {
    const server = express();

    server.use(helmet());
    server.use(cors);
    server.use(bodyParser.urlencoded({}));
    configRoutes(server, authClient);

    const port = process.env.PORT || 1337;
    server.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });
};

import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import session from 'express-session';
import cors from './cors/cors';
import configRoutes from './routes/routes';

export default authClient => {
    const server = express();

    server.use(helmet());
    server.use(cors);
    server.use(bodyParser.urlencoded());
    server.use(session({ secret: 'awesome secret' }));
    configRoutes(server, authClient);

    const port = process.env.PORT || 1337;
    server.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });
};

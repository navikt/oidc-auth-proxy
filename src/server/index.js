import express from 'express';
import passport from 'passport';
import { Strategy } from 'openid-client';
import helmet from 'helmet';
import cors from './cors/cors';
import routes from './routes/routes';

export default (issuer) => {
    const server = express();

    passport.use('oidc', new Strategy({}))

    server.use(helmet());
    server.use(cors);
    server.use(routes);
    server.use(passport.initialize());

    const port = process.env.PORT || 1337;
    server.listen(port, () => {
        console.log(`Listening on port ${port}`)
    });
}

import express from 'express';
import helmet from 'helmet';
import cors from './cors/cors';
import routes from './routes/routes';

export default (issuer) => {
    const server = express();

    server.use(helmet());
    server.use(cors);
    server.use(routes);

    const port = process.env.PORT || 1337;
    server.listen(port, () => {
        console.log(`Listening on port ${port}`)
    });
}

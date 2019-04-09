import express from 'express';
import helmet from 'helmet';
import cors from './cors';
import router from './router';

const server = express();

server.use(helmet());
server.use(cors);
server.use(router);

const port = process.env.PORT || 1337;
server.listen(port, () => {
    console.log(`Listening on port ${port}`)
});

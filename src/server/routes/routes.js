import { Router } from 'express';
import {isAuthenticated} from '../utils/utils';

const routes = Router();

routes.get('/login', (req, res) => {
    res.send('Hello World!');
});

routes.get('/api/*', (req, res) => {
    if (isAuthenticated()) {
        res.redirect()
        console.log(req.headers);
        res.send('Hello World');
    }
});

routes.post('/callback', (req, res) => {
    res.redirect(process.env.REDIRECT_URL_ON_SUCCESS);
});

export default routes;

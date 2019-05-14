import { Router } from 'express';
import {isAuthenticated} from '../utils/utils';

const getRoutes = (req, res, next, { authorizationUrl }) => {
    const router = Router();

    router.get('/api/*', (req, res) => {
        if (!isAuthenticated()) {
            res.redirect(authorizationUrl({}))
        }
    });

    router.post('/callback', (req, res) => {
        res.redirect(process.env.REDIRECT_URL_ON_SUCCESS);
    });

    router.get('/whatever', () => {
        res.send('Hello')
    });

    next();
};

export default getRoutes;


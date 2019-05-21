import { isAuthenticated } from '../utils/utils';

const configRoutes = (app, authClient) => {
    app.get('/api/*', (req, res) => {
        if (!isAuthenticated()) {
            res.redirect(
                `${authClient.authorizationUrl({})}&client_id=${
                    process.env.CLIENT_ID
                }`
            );
        }
    });

    app.post('/callback', (req, res) => {
        res.send('Callback');
        // res.redirect(process.env.REDIRECT_URL_ON_SUCCESS);
    });

    app.get('/callback', (req, res) => {
        res.send('Callback');
        // res.redirect(process.env.REDIRECT_URL_ON_SUCCESS);
    });

    app.get('/hello', (req, res) => {
        res.send('Hello');
    });
};

export default configRoutes;

import { isAuthenticated } from '../utils/auth';

const configRoutes = (app, authClient) => {
    app.get('/login', (req, res) => {
        if (!isAuthenticated(req.session.tokenSets)) {
            const authorizationUrl = authClient.authorizationUrl({
                response_mode: 'form_post',
                scope: `openid ${process.env.CLIENT_ID}/.default`
            });
            res.redirect(authorizationUrl);
        } else {
            res.send('Hei på deg!');
        }
    });

    app.post('/callback', (req, res) => {
        const authorizationCode = req.query.code;
        const params = authClient.callbackParams(req);
        authClient
            .callback(process.env.REDIRECT_URL, params, {
                code_verifier: authorizationCode
            })
            .then(
                tokenSet => {
                    req.session.tokenSets = {
                        [process.env.CLIENT_ID]: tokenSet
                    };
                    res.redirect(req.session.referer);
                },
                error => {
                    console.error(error);
                }
            );
    });
};

export default configRoutes;

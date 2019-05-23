import { isAuthenticated } from '../utils/utils';

const configRoutes = (app, authClient) => {
    app.get('/api/*', (req, res) => {
        if (!isAuthenticated()) {
            res.redirect(
                `${authClient.authorizationUrl({
                    response_mode: 'form_post',
                    scope: 'openid offline_access'
                })}`
            );
        }
    });

    app.post('/callback', (req, res) => {
        const authorizationCode = req.query.code;
        const params = authClient.callbackParams(req);
        console.log(params);
        authClient
            .callback(
                'http://localhost:8080/callback',
                params,
                {
                    code_verifier: authorizationCode
                },
                {
                    clientAssertionPayload: {
                        iss: process.env.CLIENT_ID
                    }
                }
            )
            .then(
                tokenSet => {
                    console.log(tokenSet);
                    authClient
                        .refresh(tokenSet, {
                            exchangeBody: {
                                scope:
                                    '4bd971d8-2469-434f-9322-8cfe7a7a3379/.default'
                            }
                        })
                        .then(
                            tokenSet2 => console.log(tokenSet2),
                            error => console.error(error)
                        );
                },
                error => {
                    console.error(error);
                }
            );
    });

    app.get('/hello', (req, res) => {
        res.send('Hello');
    });
};

export default configRoutes;

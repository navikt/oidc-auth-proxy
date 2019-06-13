const configRoutes = (app, authClient) => {
    app.post('/callback', (req, res) => {
        const authorizationCode = req.query.code;
        const params = authClient.callbackParams(req);
        authClient
            .callback(process.env.REDIRECT_URL, params, {
                code_verifier: authorizationCode,
                state: req.body.state
            })
            .then(
                tokenSet => {
                    req.session.tokenSets = {
                        [process.env.CLIENT_ID]: tokenSet
                    };
                    res.redirect(req.body.state);
                },
                error => {
                    console.error(error);
                }
            );
    });
};

export default configRoutes;

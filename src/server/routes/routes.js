const configRoutes = (app, authClient) => {
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

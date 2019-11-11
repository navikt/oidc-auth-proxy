import { getRefererFromSession } from "../utils/referer";

const path = '/api/oidc/callback'

function callbackUrl() {
    return `http://localhost:8080${path}`
}

const callbackRoutes = (app, authClient) => {
    app.post(path, (req, res) => {
        const authorizationCode = req.query.code;
        const params = authClient.callbackParams(req);
        authClient
            .callback(callbackUrl(), params, {
                code_verifier: authorizationCode
            })
            .then(
                tokenSet => {
                    req.session.tokenSets = {
                        ["self"]: tokenSet
                    };
                    console.log(tokenSet);
                    res.redirect(getRefererFromSession({request: req}));
                },
                error => {
                    console.error(error);
                }
            );
    });
};

export default callbackRoutes;

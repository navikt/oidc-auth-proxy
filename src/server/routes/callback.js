import { getRefererFromSession } from "../utils/referer";
import { getOidcAuthProxyCallbackPath, getOidcAuthProxyBaseUrl } from "../utils/config";

const callbackPath = "/oidc/callback";
const callbackUrl = `${getOidcAuthProxyBaseUrl()}${callbackPath}`;
const self = "self"

const callbackRoutes = (app, authClient) => {
    app.post(callbackPath, (req, res) => {
        const authorizationCode = req.query.code;
        const params = authClient.callbackParams(req);
        authClient
            .callback(callbackUrl, params, {
                code_verifier: authorizationCode
            })
            .then(
                tokenSet => {
                    req.session.tokenSets = {
                        [self]: tokenSet
                    };
                    res.redirect(getRefererFromSession({request: req}));
                },
                error => {
                    console.error(error);
                }
            );
    });
};

export default callbackRoutes;
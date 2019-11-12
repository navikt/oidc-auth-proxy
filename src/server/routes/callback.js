import { getRefererFromSession } from "../utils/referer";
import config from "../utils/config";
import logger from '../utils/log';


const callbackPath = "/oidc/callback";
const callbackUrl = `${config.oidcAuthProxyBaseUrl}${callbackPath}`;
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
                    logger.error("Feil ved callback", error);
                }
            );
    });
};

export default callbackRoutes;
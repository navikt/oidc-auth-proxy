import { getRedirectUriFromSession } from '../utils/redirectUri';
import { clearNonceAndStateOnSession } from '../utils/auth';
import config from '../utils/config';
import logger from '../utils/log';

const self = 'self';

const callbackRoutes = (app, authClient) => {
    app.post(config.callbackPath, (req, res) => {
        const authorizationCode = req.query.code;
        const params = authClient.callbackParams(req);
        authClient
            .callback(config.callbackUrl, params, {
                code_verifier: authorizationCode,
                nonce: req.session.nonce,
                state: req.session.state,
            })
            .then(
                (tokenSet) => {
                    req.session.tokenSets = {
                        [self]: tokenSet,
                    };
                    clearNonceAndStateOnSession({ request: req });
                    res.redirect(getRedirectUriFromSession({ request: req }));
                },
                (error) => {
                    logger.error('Feil ved callback', error);
                }
            );
    });
};

export default callbackRoutes;

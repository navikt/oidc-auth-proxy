import { getRedirectUriFromSession } from '../utils/redirectUri';
import config from '../utils/config';
import logger from '../utils/log';

const self = 'self';

const callbackRoutes = (app, authClient) => {
    app.post(config.callbackPath, (req, res) => {
        const params = authClient.callbackParams(req);
        authClient
            .callback(config.callbackUrl, params, {
                code_verifier: req.session.login_variables.code_verifier,
                nonce: req.session.login_variables.nonce,
                state: req.session.login_variables.state,
            }, {clientAssertionPayload: {aud: authClient.issuer.metadata['token_endpoint']}})
            .then(
                (tokenSet) => {
                    req.session.tokenSets = {
                        [self]: tokenSet,
                    };
                    res.redirect(getRedirectUriFromSession({ request: req }));
                },
                (error) => {
                    logger.error('Feil ved callback', error);
                }
            );
    });
};

export default callbackRoutes;

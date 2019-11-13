import { getTokenOnBehalfOf, isAuthenticated } from './auth';
import { getRefererFromRequest } from './referer';
import { generators } from 'openid-client';
import config from './config';
import logger from './log';

export const getProxyOptions = (api, authClient) => ({
    filter: (request, response) => {
        logger.info(`Proxy URL ${api.url}.`);
        const authenticated = isAuthenticated({request});
        logger.info(`Authenticated = ${authenticated}`);
        if (!authenticated) {
            request.session.nonce = generators.nonce();
            request.session.state = generators.state();
            const authorizationUrl = authClient.authorizationUrl({
                response_mode: 'form_post',
                response_type: 'code',
                scope: config.loginScopes,
                redirect_uri: config.callbackUrl,
                nonce: request.session.nonce,
                state: request.session.state
            });
            request.session.referer = getRefererFromRequest({request});
            response.header('Location', authorizationUrl);
            response.sendStatus(401);
        }
        return authenticated;
    },
    proxyReqOptDecorator: (requestOptions, request) =>
        new Promise((resolve, reject) => {
            getTokenOnBehalfOf({authClient, api, request}).then(
                ({ token_type, access_token }) => {
                    logger.info("Legger på Authorization header.");
                    requestOptions.headers['Authorization'] = `${token_type} ${access_token}`;
                    if (config.allowProxyToSelfSignedCertificates) {
                        requestOptions.rejectUnauthorized = false;
                    }
                    resolve(requestOptions);
                },
                error => reject(error)
            );
        }),
    proxyReqPathResolver: function(request) {
        const path = request.params[0];
        const queryString = request.url.split('?')[1];
        const newPath = path + (queryString ? '?' + queryString : '');
        logger.info(`Proxy Path ${newPath}.`);
        return newPath;
    }
});

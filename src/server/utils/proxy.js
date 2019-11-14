import { getTokenOnBehalfOf, isAuthenticated, getAuthorizationUrl } from './auth';
import config from './config';
import logger from './log';
import url from 'url';

export const getProxyOptions = (api, authClient) => ({
    filter: (request, response) => {
        logger.info(`Proxy URL ${api.url}.`);
        const authenticated = isAuthenticated({request});
        logger.info(`Authenticated = ${authenticated}`);
        if (!authenticated) {
            const authorizationUrl = getAuthorizationUrl({requesdt, authClient});
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
        const pathFromApi = (url.parse(api.url).pathname === '/' ? '' : url.parse(api.url).pathname);
        const pathFromRequest = request.params[0];
        const queryString = request.url.split('?')[1];
        const newPath = (pathFromApi ? pathFromApi : '') + (pathFromRequest ? pathFromRequest : '') + (queryString ? '?' + queryString : '');
        logger.info(`Proxy Path ${newPath}.`);
        return newPath;
    }
});

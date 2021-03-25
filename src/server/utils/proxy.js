import { getTokenOnBehalfOf, isAuthenticated } from './auth';
import config from './config';
import logger from './log';
import url from 'url';
import { getRedirectUriFromHeader } from './redirectUri';

export const getProxyOptions = (api, authClient) => ({
    parseReqBody: false,
    filter: (request, response) => {
        logger.debug(`Proxy URL ${api.url}.`);
        const authenticated = isAuthenticated({ request });
        logger.debug(`Authenticated = ${authenticated}`);
        if (!authenticated) {
            logger.info("Ikke logget inn. Sender til innlogging.")
            const redirectUri = getRedirectUriFromHeader({ request });
            response.header('Location', `${config.oidcAuthProxyBaseUrl}/login?redirect_uri=${redirectUri}`);
            response.sendStatus(401);
        }
        return authenticated;
    },
    proxyReqOptDecorator: (requestOptions, request) =>
        new Promise((resolve, reject) => {
            getTokenOnBehalfOf({ authClient, api, request }).then(
                ({ token_type, access_token }) => {
                    logger.debug('Legger på Authorization header.');
                    requestOptions.headers['Authorization'] = `${token_type} ${access_token}`;
                    if (config.allowProxyToSelfSignedCertificates) {
                        requestOptions.rejectUnauthorized = false;
                    }
                    resolve(requestOptions);
                },
                (error) => reject(error)
            );
        }),
    proxyReqPathResolver: function (request) {
        const pathFromApi = url.parse(api.url).pathname === '/' ? '' : url.parse(api.url).pathname;
        const pathFromRequest = request.params[0];
        const queryString = request.url.split('?')[1];
        const newPath =
            (pathFromApi ? pathFromApi : '') +
            (pathFromRequest ? pathFromRequest : '') +
            (queryString ? '?' + queryString : '');
        logger.debug(`Proxy Path ${newPath}.`);
        return newPath;
    },
    userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
        const statusCode = proxyRes.statusCode;
        const melding = `${statusCode} ${proxyRes.statusMessage}: ${userReq.method} - ${userReq.originalUrl}`;
        if (statusCode >= 500) {
            logger.error(melding);
        } else {
            logger.info(melding);
        }
        return headers;
    },
});

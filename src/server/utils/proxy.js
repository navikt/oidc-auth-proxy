import { getTokenOnBehalfOf, isAuthenticated } from './auth';
import config from './config';
import { logger } from './log';
import url from 'url';
import { getRedirectUriFromHeader } from './redirectUri';
import { ulid } from 'ulid'

const CorrelationId = 'x-correlation-id';
const Timestamp = 'x-timestamp';

export const getProxyOptions = (api, authClient) => ({
    parseReqBody: false,
    filter: (request, response) => {
        logger.debug(`Proxy URL ${api.url}.`);
        const authenticated = isAuthenticated({ request });
        logger.debug(`Authenticated = ${authenticated}`);
        if (!authenticated) {
            logger.info("Ikke logget inn. Sender til innlogging. (proxy path)");
            const redirectUri = getRedirectUriFromHeader({ request });
            response.header('Location', `${config.oidcAuthProxyBaseUrl}/login?redirect_uri=${redirectUri}`);
            response.sendStatus(401);
        }
        return authenticated;
    },
    proxyReqOptDecorator: function(requestOptions, request) {
        if (request.headers[CorrelationId]) {
            requestOptions.headers[CorrelationId] = request.headers[CorrelationId];
        } else {
            requestOptions.headers[CorrelationId] = ulid();
        }
        requestOptions.headers[Timestamp] = Date.now();
        return new Promise((resolve, reject) => {
            getTokenOnBehalfOf({ authClient, api, request }).then(
                ({ token_type, access_token }) => {
                    logger.debug('Legger på Authorization header.');
                    requestOptions.headers['Authorization'] = `${token_type} ${access_token}`;
                    resolve(requestOptions);
                },
                (error) => reject(error)
            );
        })
    },
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
    userResHeaderDecorator: function(headers, userReq, userRes, proxyReq, proxyRes) {
        const statusCode = proxyRes.statusCode;
        const requestTime = Date.now() - proxyReq.getHeader(Timestamp);
        const melding = `${statusCode} ${proxyRes.statusMessage}: ${userReq.method} - ${userReq.originalUrl} (${requestTime}ms)`;
        const correlationId = proxyReq.getHeader(CorrelationId);
        if (statusCode >= 500) {
            logger.error(melding, {correlation_id: correlationId});
        } else {
            logger.info(melding, {correlation_id: correlationId});
        }
        return headers;
    },
});

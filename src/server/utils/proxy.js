import { getTokenOnBehalfOf, isAuthenticated } from './auth';

const getProxyConfig = () => {
    try {
        return JSON.parse(process.env.PROXYCONFIG);
    } catch (error) {
        console.error('process.env.PROXYCONFIG is not a valid JSON');
        process.exit(1);
    }
};

export const getProxyPrefix = () => getProxyConfig().prefix;
export const getProxyApis = () => getProxyConfig().apis;

export const getProxyOptions = (api, authClient) => ({
    filter: (request, response) => {
        const authenticated = isAuthenticated(request.session.tokenSets, process.env.CLIENT_ID);
        if (!authenticated) {
            const authorizationUrl = authClient.authorizationUrl({
                response_mode: 'form_post',
                scope: `openid ${process.env.CLIENT_ID}/.default`
            });
            request.session.referer = request.headers.referer;
            response.header('Location', authorizationUrl);
            response.sendStatus(401);
        }
        return authenticated;
    },
    proxyReqOptDecorator: (requestOptions, request) =>
        new Promise((resolve, reject) => {
            getTokenOnBehalfOf(authClient, api.clientId, request).then(
                ({ access_token }) => {
                    requestOptions.headers.Authorization = `Bearer ${access_token}`;
                    resolve(requestOptions);
                },
                error => reject(error)
            );
        }),
    proxyReqPathResolver: function(req) {
        return '/isready';
    }
});

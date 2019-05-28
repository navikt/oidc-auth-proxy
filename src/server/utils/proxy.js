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
            request.session.requestedPath = request.originalUrl;
            console.log('test', request.session.requestedPath);
            response.redirect('/login');
        }
        return authenticated;
    },
    proxyReqOptDecorator: (requestOptions, request) =>
        new Promise((resolve, reject) => {
            getTokenOnBehalfOf(authClient, api.clientId, request).then(
                ({ access_token }) => {
                    requestOptions.headers.Authorization = access_token;
                    resolve(requestOptions);
                },
                error => reject(error)
            );
        })
});

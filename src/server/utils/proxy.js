import { getTokenOnBehalfOf, isAuthenticated } from './auth';
import { getRefererFromRequest } from './referer';
import { getLoginScopes } from './config';

const loginScopes = getLoginScopes();

export const getProxyOptions = (api, authClient) => ({
    filter: (request, response) => {
        const authenticated = isAuthenticated({request});
        if (!authenticated) {
            const authorizationUrl = authClient.authorizationUrl({
                response_mode: 'form_post',
                scope: loginScopes
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
                    requestOptions.headers['Authorization'] = `${token_type} ${access_token}`;
                    resolve(requestOptions);
                },
                error => reject(error)
            );
        }),
    proxyReqPathResolver: function(request) {
        const path = request.params[0];
        const queryString = request.url.split('?')[1];
        return path + (queryString ? '?' + queryString : '');
    }
});

import { TokenSet } from 'openid-client';
import config from "./config";
import { generators } from 'openid-client';
import { getRefererFromRequest } from './referer';

const self = "self"

const getTokenSetsFromSession = ({request}) => {
    if (request && request.session) {
        return request.session.tokenSets;
    } else {
        return null;
    }
};

export const isAuthenticated = ({request = null, tokenSets = null, id = self}) => {
    if (!tokenSets) {
        tokenSets = getTokenSetsFromSession({request})
    }
    if (!tokenSets) {
        return false;
    }

    const tokenSet = tokenSets[id];
    if (!tokenSet) {
        return false;
    }

    return new TokenSet(tokenSet).expired() === false;
};

export async function getTokenOnBehalfOf({authClient, api, request}) {
    const tokenSets = getTokenSetsFromSession({request});
    if (!isAuthenticated({tokenSets, id: api.id})) {
        const onBehalfTokenSet = await authClient.grant({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
            requested_token_use: 'on_behalf_of',
            scope: api.scopes,
            assertion: tokenSets[self].access_token
        });
        request.session.tokenSets[api.id] = onBehalfTokenSet;
        return onBehalfTokenSet;
    } else {
        return tokenSets[api.id];
    }
}

export function getAuthorizationUrl({request, authClient}) {
    request.session.nonce = generators.nonce();
    request.session.state = generators.state();
    request.session.referer = getRefererFromRequest({request});
    return authClient.authorizationUrl({
        response_mode: 'form_post',
        response_type: 'code',
        scope: config.loginScopes,
        redirect_uri: config.callbackUrl,
        nonce: request.session.nonce,
        state: request.session.state
    });
}
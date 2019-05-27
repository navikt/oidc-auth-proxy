import { TokenSet } from 'openid-client';

const getTokenSetsFromRequest = request => {
    if (request.session) {
        return request.session.tokenSets;
    }
};

export const isAuthenticated = (
    tokenSets,
    clientId = process.env.CLIENT_ID
) => {
    if (tokenSets === undefined) {
        return false;
    }

    const tokenSet = tokenSets[clientId];
    if (tokenSet === undefined) {
        return false;
    }

    return new TokenSet(tokenSet).expired() === false;
};

export async function getTokenOnBehalfOf(authClient, clientId, request) {
    const tokenSets = getTokenSetsFromRequest(request);
    if (!isAuthenticated(tokenSets, clientId)) {
        try {
            const onBehalfTokenSet = await authClient.grant({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                client_assertion_type:
                    'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
                requested_token_use: 'on_behalf_of',
                scope: `${clientId}/.default`,
                assertion: tokenSets[process.env.CLIENT_ID].access_token
            });
            request.session.tokenSets[clientId] = onBehalfTokenSet;
            return onBehalfTokenSet;
        } catch (error) {
            console.error(error);
        }
    }
    return tokenSets[clientId];
}

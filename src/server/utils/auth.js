import { TokenSet } from 'openid-client';
import config from './config';
import { generators } from 'openid-client';
import { setRedirectUriOnSession } from './redirectUri';
import logger from './log';
import { getAuthorizationParameters} from './authUtils';

const self = 'self';
const tenSecondsInMilliseconds = 10000;

export const getTokenSetsFromSession = ({ request }) => {
    if (request && request.session) {
        return request.session.tokenSets;
    } else {
        return null;
    }
};

export const isAuthenticated = ({ request = null, tokenSets = null, id = self }) => {
    if (!tokenSets) {
        tokenSets = getTokenSetsFromSession({ request });
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

export async function getTokenOnBehalfOf({ tokenExchangeClient, api, request }) {
    const tokenSets = getTokenSetsFromSession({ request });
    if (!isAuthenticated({ tokenSets, id: api.id })) {
        const onBehalfTokenSet = await tokenExchangeClient.grant({
            grant_type: config.tokenExchangeGrantType,
            client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
            // Required for azureAd
            requested_token_use: 'on_behalf_of',
            scope: api.scopes,
            assertion: tokenSets[self].access_token,
            // Reuired for TokenX
            subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
            subject_token: tokenSets[self].access_token,
            audience: api.scopes,
        }, {
            clientAssertionPayload:
                {
                    aud: tokenExchangeClient.issuer.metadata['token_endpoint'],
                    nbf: Math.floor(Date.now() / 1000),
                }
        });
        request.session.tokenSets[api.id] = onBehalfTokenSet;
        return onBehalfTokenSet;
    } else {
        return tokenSets[api.id];
    }
}

export function prepareAndGetAuthorizationUrl({ request, authClient, redirectUri }) {
    handleNonceAndStateOnSession({ request });
    setRedirectUriOnSession({ request, redirectUri });
    const authorizationParameters = getAuthorizationParameters(
        config.additionalAuthorizationParameters,
        config.loginScopes,
        config.callbackUrl,
        request.session.nonce,
        request.session.state,
    );
    return authClient.authorizationUrl(authorizationParameters);
}

function handleNonceAndStateOnSession({ request }) {
    const currentNonce = request.session.nonce;
    const currentState = request.session.state;
    const nonceAndStateSetAt = request.session.nonceAndStateSetAt;

    if (!currentNonce || !currentState || !nonceAndStateSetAt) {
        setNonceAndStateOnSession({ request });
    }

    const currentTimestamp = Date.now();

    if ((currentTimestamp - nonceAndStateSetAt) < tenSecondsInMilliseconds) {
        logger.info(`nonce & state satt for ${currentTimestamp - nonceAndStateSetAt}ms siden. Setter ikke nye.`);
    } else {
        setNonceAndStateOnSession({ request });
    }
}

function setNonceAndStateOnSession({ request }) {
    request.session.nonce = generators.nonce();
    request.session.state = generators.state();
    request.session.nonceAndStateSetAt = Date.now();
}

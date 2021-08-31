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

export async function getTokenOnBehalfOf({ authClient, api, request }) {
    const tokenSets = getTokenSetsFromSession({ request });
    if (!isAuthenticated({ tokenSets, id: api.id })) {
        const onBehalfTokenSet = await authClient.grant({
            grant_type: config.onBehalfOfGrantType,
            client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
            requested_token_use: 'on_behalf_of',
            scope: api.scopes,
            assertion: tokenSets[self].access_token,
            subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
            subject_token: tokenSets[self].access_token,
            audience: api.scopes,
        }, {clientAssertionPayload: {
            aud: authClient.issuer.metadata['token_endpoint'],
            nbf: Math.floor(Date.now() / 1000),
        }});
        request.session.tokenSets[api.id] = onBehalfTokenSet;
        return onBehalfTokenSet;
    } else {
        return tokenSets[api.id];
    }
}

export function prepareAndGetAuthorizationUrl({ request, authClient, redirectUri }) {
    handleLoginVariablesOnSession({ request });
    setRedirectUriOnSession({ request, redirectUri });
    const authorizationParameters = getAuthorizationParameters(
        config.additionalAuthorizationParameters,
        config.loginScopes,
        config.callbackUrl,
        request.session.login_variables.nonce,
        request.session.login_variables.state,
        request.session.login_variables.code_verifier
    );
    return authClient.authorizationUrl(authorizationParameters);
}

function handleLoginVariablesOnSession({ request }) {
    const currentLoginVariables = request.session.login_variables;

    if (!currentLoginVariables) {
        setLoginVariablesOnSession({ request });
    }

    const currentTimestamp = Date.now();
    const loginVariablesSetAt = request.session.login_variables.set_at;

    if ((currentTimestamp - loginVariablesSetAt) < tenSecondsInMilliseconds) {
        logger.info(`Login variables satt for ${currentTimestamp - loginVariablesSetAt}ms siden. Setter ikke nye.`);
    } else {
        setLoginVariablesOnSession({ request });
    }
}

function setLoginVariablesOnSession({ request }) {
    request.session.login_variables = {
        set_at: Date.now(),
        nonce: generators.nonce(),
        state: generators.state(),
        code_verifier: generators.codeVerifier()
    };
}

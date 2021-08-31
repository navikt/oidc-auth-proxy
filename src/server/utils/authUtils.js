import { generators } from 'openid-client';

export const getAuthorizationParameters = (additionalAuthorizationParameters, scope, redirectUri, nonce, state, code_verifier) => {
    const originalAuthorizationParameters = {
        response_mode: 'form_post',
        response_type: 'code',
        scope: scope,
        redirect_uri: redirectUri,
        nonce: nonce,
        state: state,
        code_challenge: generators.codeChallenge(code_verifier),
        code_challenge_method: 'S256'
    }

    // If additionalParameters should override originalParameters then this should be reordered: {...originalAuthorizationParameters, ...config.additionalAuthorizationParameters};
    return {...additionalAuthorizationParameters, ...originalAuthorizationParameters};
};

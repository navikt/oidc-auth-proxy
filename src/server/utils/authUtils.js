export const getAuthorizationParameters = (additionalAuthorizationParameters, scope, redirectUri, nonce, state) => {
    const originalAuthorizationParameters = {
        response_mode: 'form_post',
        response_type: 'code',
        scope: scope,
        redirect_uri: redirectUri,
        nonce: nonce,
        state: state
    }

    // If additionalParameters should override originalParameters then this should be reordered: {...originalAuthorizationParameters, ...config.additionalAuthorizationParameters};
    return {...additionalAuthorizationParameters, ...originalAuthorizationParameters};
};

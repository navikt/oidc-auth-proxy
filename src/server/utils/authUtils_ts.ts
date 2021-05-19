import {AuthorizationParameters} from "openid-client";

export function getAuthorizationParameters(additionalAuthorizationParameters?: AuthorizationParameters, scope?: string, redirectUri?: string, nonce?: string, state?: string) {
    const originalAuthorizationParameters : AuthorizationParameters= {
        response_mode: 'form_post',
        response_type: 'code',
        scope: scope,
        redirect_uri: redirectUri,
        nonce: nonce,
        state: state
    }

    // If additionalParameters should override originalParameters then this should be reordered: {...originalAuthorizationParameters, ...config.additionalAuthorizationParameters};
    return {...additionalAuthorizationParameters, ...originalAuthorizationParameters};
}

export function convertJsonToAuthorizationParameters(additionalAuthorizationParametersJson?: string): AuthorizationParameters {
    if (!additionalAuthorizationParametersJson) return {}

    return JSON.parse(additionalAuthorizationParametersJson);
}

module.exports = {
    getAuthorizationParameters,
    convertJsonToAuthorizationParameters,
};
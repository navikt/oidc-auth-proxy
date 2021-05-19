import {convertJsonToAuthorizationParameters} from "./authUtils";

const {getAuthorizationParameters} = require("./authUtils");

describe("getAuthorizationParameters", () => {
    const originalScope = "original scopes"
    const originalRedirectUri = "redirectUri"
    const originalNonce = "nonce123"
    const originalState = "state1234"

    it("should append new parameters", () => {
        const additionalParameters = {
            resource: "nav.no",
            additionalPropertyThatDontExist: "tull001"
        }

        const allParameters = getAuthorizationParameters(additionalParameters, originalScope, originalRedirectUri, originalNonce, originalState);

        expect(allParameters.resource).toBe("nav.no");
        expect(allParameters.additionalPropertyThatDontExist).toBe("tull001"); // Possible since AuthorizationParameters accepts other properties: [key: string]: unknown;
    });

    it("should contain original parameters", () => {
        const additionalParameters = {}

        const allParameters = getAuthorizationParameters(additionalParameters, originalScope, originalRedirectUri, originalNonce, originalState);

        expect(allParameters.response_mode).toBe("form_post");
        expect(allParameters.response_type).toBe("code");
    });

    it("should handle undefined", () => {
        const allParameters = getAuthorizationParameters(undefined, originalScope, originalRedirectUri, originalNonce, originalState);

        expect(allParameters.response_mode).toBe("form_post");
        expect(allParameters.response_type).toBe("code");
        expect(allParameters.scope).toBe(originalScope);
        expect(allParameters.redirect_uri).toBe(originalRedirectUri);
        expect(allParameters.state).toBe(originalState);
        expect(allParameters.nonce).toBe(originalNonce);
    });

    it("should not override existing properties", () => {
        const additionalParameters = {
            response_mode: 'new responseMode',
            response_type: 'new responseType',
            scope: 'new scopes',
            redirect_uri: "new redirectUri",
            nonce: "new nonce",
            state: "new state",
        }

        const allParameters = getAuthorizationParameters(additionalParameters, originalScope, originalRedirectUri, originalNonce, originalState);

        expect(allParameters.response_mode).toBe("form_post");
        expect(allParameters.response_type).toBe("code");
        expect(allParameters.scope).toBe(originalScope);
        expect(allParameters.redirect_uri).toBe(originalRedirectUri);
        expect(allParameters.state).toBe(originalState);
        expect(allParameters.nonce).toBe(originalNonce);
    });
});

describe("convertJsonToAuthorizationParameters", () => {
    it("should convert json to AuthorizationParameter with resource", () => {
        const json = `
        {
            "resource": "nav.no"
        }`

        let authorizationParameters = convertJsonToAuthorizationParameters(json);

        expect(authorizationParameters.resource).toBe("nav.no");
    });

    it("should convert undefined", () => {
        let authorizationParameters = convertJsonToAuthorizationParameters(undefined);

        expect(authorizationParameters.resource).toBe(undefined);
    });
});

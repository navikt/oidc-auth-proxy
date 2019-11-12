import logger from './log';

const environmentVariable = (name, secret = false) => {
    if (!process.env[name]) {
        logger.error(`Mangler environment variable '${name}'.`);
        process.exit(1);
    }
    if (!secret) {
        logger.info(`Env[${name}]=${process.env[name]}`);
    }
    return process.env[name]
};

const environmentVariableAsJson = (name, secret = false) => {
    try {
        return JSON.parse(environmentVariable(name, secret));
    } catch (error) {
        logger.error(`Environment variable '${name}' er ikke et gyldig JSON-objekt.`, error);
        process.exit(1);
    }
};

export const getJwks = () => {
    var jwk = environmentVariableAsJson("JWK", true);
    if (!jwk.kid) {
        logger.error(`Environment variable 'JWK' mangler 'kid' claim.`);
        process.exit(1);
    }
    return {
        keys: [jwk]
    };
};
export const getProxyConfig = () => {
    var config = environmentVariableAsJson("PROXY_CONFIG");
    if (!config.apis) {
        logger.error("Environment variable 'PROXY_CONFIG' mangler 'apis' entry.")
        exit(1);
    }
    config.apis.forEach((entry, index) => {
        if (!entry.path) {
            logger.error(`Api entry ${index} mangler 'path'`);
            process.exit(1);
        }
        if (!entry.url) {
            logger.error(`Api entry ${index} mangler 'url'`);
            process.exit(1);
        }
        if (!entry.scopes) {
            logger.error(`Api entry ${index} mangler 'scopes'`);
            process.exit(1);
        }
        entry.id =`api-${index}`;
    });
    return config;
};

export const getClientId = () => environmentVariable("CLIENT_ID");
export const getLoginScopes = () => environmentVariable("LOGIN_SCOPES");
export const getDiscoveryUrl = () => environmentVariable("DISCOVERY_URL");
export const getOidcAuthProxyBaseUrl = () => environmentVariable("OIDC_AUTH_PROXY_BASE_URL");
export const getApplicationBaseUrl = () => environmentVariable("APPLICATION_BASE_URL");
const getSessionIdCookieSignSecret = () => environmentVariable("SESSION_ID_COOKIE_SIGN_SECRET", true);
const getSessionIdCookieVerifySecret = () => environmentVariable("SESSION_ID_COOKIE_VERIFY_SECRET", true);
export const getSessionIdCookieSecrets = [
    getSessionIdCookieSignSecret(),
    getSessionIdCookieVerifySecret()
];
export const getSessionIdCookieSecure = () => {
    const applicationBaseUrl = getApplicationBaseUrl().toLocaleLowerCase();
    const oidcAuthProxyBaseUrl = getOidcAuthProxyBaseUrl().toLocaleLowerCase();
    return applicationBaseUrl.startsWith("https") && oidcAuthProxyBaseUrl.startsWith("https");
}
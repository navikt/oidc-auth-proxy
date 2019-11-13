import logger from './log';

const environmentVariable = (name, secret = false) => {
    if (!process.env[name]) {
        logger.error(`Mangler environment variable '${name}'.`);
        process.exit(1);
    }
    if (!secret) {
        logger.info(`Env[${name}]=${process.env[name]}`);
    } else {
        logger.info(`Env[${name}]=***`);
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

const getJwks = () => {
    var jwk = environmentVariableAsJson("JWK", true);
    if (!jwk.kid) {
        logger.error(`Environment variable 'JWK' mangler 'kid' claim.`);
        process.exit(1);
    }
    return {
        keys: [jwk]
    };
};
const getProxyConfig = () => {
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

const clientId = environmentVariable("CLIENT_ID");
const loginScopes = environmentVariable("LOGIN_SCOPES");
const discoveryUrl = environmentVariable("DISCOVERY_URL");
const oidcAuthProxyBaseUrl = environmentVariable("OIDC_AUTH_PROXY_BASE_URL");
const applicationBaseUrl = environmentVariable("APPLICATION_BASE_URL");
const allowProxyToSelfSignedCertificates = environmentVariable("ALLOW_PROXY_TO_SELF_SIGNED_CERTIFICATES").toLowerCase() === 'true';
const callbackPath = "/oidc/callback";
const callbackUrl = `${oidcAuthProxyBaseUrl}${callbackPath}`;
const sessionIdCookieName = environmentVariable("SESSION_ID_COOKIE_NAME");
const sessionIdCookieSignSecret = environmentVariable("SESSION_ID_COOKIE_SIGN_SECRET", true);
const sessionIdCookieVerifySecret =  environmentVariable("SESSION_ID_COOKIE_VERIFY_SECRET", true);
const sessionIdCookieSecrets = [
    sessionIdCookieSignSecret,
    sessionIdCookieVerifySecret
];
const getSessionIdCookieSecure = () => {
    return applicationBaseUrl.toLocaleLowerCase().startsWith("https") && oidcAuthProxyBaseUrl.toLocaleLowerCase().startsWith("https");
}

module.exports = {
    clientId,
    loginScopes,
    discoveryUrl,
    oidcAuthProxyBaseUrl,
    applicationBaseUrl,
    sessionIdCookieSecrets,
    sessionIdCookieSecure: getSessionIdCookieSecure(),
    sessionIdCookieName,
    jwks: getJwks(),
    proxyConfig: getProxyConfig(),
    callbackPath,
    callbackUrl,
    allowProxyToSelfSignedCertificates
};
import logger from './log';

const environmentVariable = ({ name, secret = false, required = true }) => {
    if (!process.env[name] && required) {
        logger.error(`Mangler environment variable '${name}'.`);
        process.exit(1);
    }
    if (!secret) {
        logger.info(`Env[${name}]=${process.env[name]}`);
    } else {
        logger.info(`Env[${name}]=***`);
    }
    return process.env[name];
};

const environmentVariableAsJson = ({ name, secret = false }) => {
    try {
        return JSON.parse(environmentVariable({ name, secret }));
    } catch (error) {
        logger.error(`Environment variable '${name}' er ikke et gyldig JSON-objekt.`, error);
        process.exit(1);
    }
};

const getJwks = () => {
    var jwk = environmentVariableAsJson({ name: 'JWK', secret: true });
    if (!jwk.kid) {
        logger.error(`Environment variable 'JWK' mangler 'kid' claim.`);
        process.exit(1);
    }
    // UnhandledPromiseRejectionWarning: JWKInvalid: `x5c` member at index 0 is not a valid base64-encoded DER PKIX certificate
    delete jwk.x5c;
    return {
        keys: [jwk],
    };
};

const getProxyConfig = () => {
    var config = environmentVariableAsJson({ name: 'PROXY_CONFIG' });
    if (!config.apis) {
        logger.error("Environment variable 'PROXY_CONFIG' mangler 'apis' entry.");
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
        entry.id = `api-${index}`;
    });
    return config;
};

const clientId = environmentVariable({ name: 'CLIENT_ID' });
const loginScopes = environmentVariable({ name: 'LOGIN_SCOPES' });
const discoveryUrl = environmentVariable({ name: 'DISCOVERY_URL' });
const oidcAuthProxyBaseUrl = environmentVariable({ name: 'OIDC_AUTH_PROXY_BASE_URL' });
const applicationBaseUrl = environmentVariable({ name: 'APPLICATION_BASE_URL' });
const allowProxyToSelfSignedCertificates =
    environmentVariable({ name: 'ALLOW_PROXY_TO_SELF_SIGNED_CERTIFICATES' }).toLowerCase() === 'true';
const callbackPath = '/oidc/callback';
const callbackUrl = `${oidcAuthProxyBaseUrl}${callbackPath}`;
const sessionIdCookieName = environmentVariable({ name: 'SESSION_ID_COOKIE_NAME' });
const sessionIdCookieSignSecret = environmentVariable({ name: 'SESSION_ID_COOKIE_SIGN_SECRET', secret: true });
const sessionIdCookieVerifySecret = environmentVariable({ name: 'SESSION_ID_COOKIE_VERIFY_SECRET', secret: true });
const sessionIdCookieSecrets = [sessionIdCookieSignSecret, sessionIdCookieVerifySecret];

const getSessionIdCookieSecure = () => {
    const secure =
        applicationBaseUrl.toLocaleLowerCase().startsWith('https') &&
        oidcAuthProxyBaseUrl.toLocaleLowerCase().startsWith('https');
    if (secure) {
        logger.info('SecureCookie=true');
    } else {
        logger.warning('SecureCookie=false');
    }
    return secure;
};

const useInMemorySessionStore = () => environmentVariable({ name: 'USE_IN_MEMORY_SESSION_STORE', secret: false, required: false }) === 'true';

const getRedisPassword = () => environmentVariable({ name: 'REDIS_PASSWORD', secret: true });
const getRedisPort = () => environmentVariable({ name: 'REDIS_PORT' });
const getRedisHost = () => environmentVariable({ name: 'REDIS_HOST' });

const getCorsAllowedHeaders = () => {
    const value = environmentVariable({ name: 'CORS_ALLOWED_HEADERS', required: false });
    if (!value) return [];
    else return value;
};
const getCorsExposedHeaders = () => {
    const value = environmentVariable({ name: 'CORS_EXPOSED_HEADERS', required: false });
    if (!value) return [];
    else return value;
};

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
    allowProxyToSelfSignedCertificates,
    getRedisHost,
    getRedisPort,
    getRedisPassword,
    getCorsAllowedHeaders,
    getCorsExposedHeaders,
    useInMemorySessionStore,
};

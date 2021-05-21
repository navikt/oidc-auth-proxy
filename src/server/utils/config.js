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

const environmentVariableAsJson = ({ name, secret = false, required = true }) => {

    let env = environmentVariable({ name, secret, required });
    if (!env && !required) {
        logger.info(`Valgfri environment variable '${name}' er ikke satt.`);
        return undefined
    }
    try {
        return JSON.parse(env);
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

const getAdditionalAuthorizationParameters = () => {
    return environmentVariableAsJson(
        {
            name: 'ADDITIONAL_AUTHORIZATION_PARAMETERS',
            secret: false,
            required: false
        });
};

const clientId = environmentVariable({ name: 'CLIENT_ID' });
const loginScopes = environmentVariable({ name: 'LOGIN_SCOPES' });
const discoveryUrl = environmentVariable({ name: 'DISCOVERY_URL' });
const oidcAuthProxyBaseUrl = environmentVariable({ name: 'OIDC_AUTH_PROXY_BASE_URL' });
const applicationBaseUrl = environmentVariable({ name: 'APPLICATION_BASE_URL' });
const allowProxyToSelfSignedCertificates = 
    environmentVariable({ name: 'ALLOW_PROXY_TO_SELF_SIGNED_CERTIFICATES', required: false }) === 'false'
const callbackPath = '/oidc/callback';
const callbackUrl = `${oidcAuthProxyBaseUrl}${callbackPath}`;
const sessionIdCookieName = environmentVariable({ name: 'SESSION_ID_COOKIE_NAME' });
const sessionIdCookieSignSecret = environmentVariable({ name: 'SESSION_ID_COOKIE_SIGN_SECRET', secret: true });
const sessionIdCookieVerifySecret = environmentVariable({ name: 'SESSION_ID_COOKIE_VERIFY_SECRET', secret: true });
const sessionIdCookieSecrets = [sessionIdCookieSignSecret, sessionIdCookieVerifySecret];

const getSessionIdCookieProperties = () => {
    const https =
        applicationBaseUrl.toLocaleLowerCase().startsWith('https') &&
        oidcAuthProxyBaseUrl.toLocaleLowerCase().startsWith('https');
    
    // Defualtverdier. Ved bruk av Strict/Lax mister vi cookie ved innloggingsflyt mot Azure.
    // sameSite=true fungerer kun om secure=true. Derfor bruker vi ved kjøring lokalt
    // secure=false & sameSite=strict
    
    var secure = true;
    var sameSite = 'none';

    if (!https) {
        secure = false;
        sameSite = 'strict';
    }

    logger.info(`SessionIdCookie[secure]=${secure}`);
    logger.info(`SessionIdCookie[sameSite]=${sameSite}`);

    return {
        secure: secure,
        sameSite: sameSite
    };
};

const useInMemorySessionStore = () => environmentVariable({ name: 'USE_IN_MEMORY_SESSION_STORE', required: false }) === 'true';

const getRedisPassword = () => environmentVariable({ name: 'REDIS_PASSWORD', secret: true });
const getRedisPort = () => environmentVariable({ name: 'REDIS_PORT' });
const getRedisHost = () => environmentVariable({ name: 'REDIS_HOST' });

const getCorsAllowedHeaders = () => {
    const value = environmentVariable({ name: 'CORS_ALLOWED_HEADERS', required: false });
    if (!value) return 'x-correlation-id';
    else return `${value},x-correlation-id`;
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
    sessionIdCookieProperties: getSessionIdCookieProperties(),
    sessionIdCookieName,
    jwks: getJwks(),
    proxyConfig: getProxyConfig(),
    additionalAuthorizationParameters: getAdditionalAuthorizationParameters(),
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

import logger from './log';
import fs from 'fs';

const ENV_PREFIX = "env:"
const PATH_PREFIX = "path:"
const VALUE_PREFIX = "value:"

const configValue = ({name, secret = false, required = true}) => {
    // Finner ut hvor vi skal lete etter config
    const pointer = process.env[name];
    if (!pointer && required) {
        logger.error(`Config: Mangler environment variable ${name}`);
        process.exit(1);
    } else if (!pointer) {
        logger.info(`Config: Optional ${name} ikke satt.`);
        return null;
    }

    // Setter configverdi
    let value = null;
    if (pointer.startsWith(ENV_PREFIX)) {
        value = process.env[pointer.slice(ENV_PREFIX.length)];
    } else if (pointer.startsWith(PATH_PREFIX)) {   
        value = fs.readFileSync(pointer.slice(PATH_PREFIX.length), 'utf-8');
    } else if (pointer.startsWith(VALUE_PREFIX)) {
        value = pointer.slice(VALUE_PREFIX.length);
    } else {
        logger.error(`Config: Environment variable ${name} må peke på en verdi som starter med ${ENV_PREFIX}, ${PATH_PREFIX}, ${VALUE_PREFIX}`);
        process.exit(1);    
    }

    // Validerer
    if (!value && required) {
        logger.error(`Config: Mangler verdi på ${pointer}`);
        process.exit(1);
    } else if (!value) {
        logger.info(`Config: Optional ${name} ikke satt.`);
        return null;
    }

    // Logger
    if (secret) {
        if (pointer.startsWith(VALUE_PREFIX)) {
            logger.info(`Config: ${name}=*** (hentet fra ${VALUE_PREFIX}***)`);
        } else {
            logger.info(`Config: ${name}=*** (hentet fra ${pointer})`);
        }
    } else {
        logger.info(`Config: ${name}=${value} (hentet fra ${pointer})`);
    }

    return value;
};

const configValueAsJson = ({ name, secret = false, required = true }) => {
    const value = configValue({ name, secret, required });
    if (!value) { return null; }
    try {
        return JSON.parse(value);
    } catch (error) {
        logger.error(`Config: '${name}' er ikke et gyldig JSON-objekt.`, error);
        process.exit(1);
    }
};

const getJwks = ({name, required}) => {
    const jwk = configValueAsJson({ name, secret: true, required });
    if (!jwk) { return null; }
    if (!jwk.kid) {
        logger.error(`Config: ${name} mangler 'kid' claim.`);
        process.exit(1);
    }
    // UnhandledPromiseRejectionWarning: JWKInvalid: `x5c` member at index 0 is not a valid base64-encoded DER PKIX certificate
    delete jwk.x5c;
    return { 
        keys: [jwk],
    };
};

const getProxyConfig = () => {
    var config = configValueAsJson({ name: 'PROXY_CONFIG' });
    if (!config.apis) {
        logger.error("Config: 'PROXY_CONFIG' mangler 'apis' entry.");
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

const clientId = configValue({ name: 'CLIENT_ID' });
const jwks = getJwks({ name: 'JWK', required: true });
const loginScopes = configValue({ name: 'LOGIN_SCOPES' });
const discoveryUrl = configValue({ name: 'DISCOVERY_URL' });
const additionalAuthorizationParameters = configValueAsJson({name: 'ADDITIONAL_AUTHORIZATION_PARAMETERS', secret: false, required: false});

const onBehalfOfClientId = configValue({ name: 'ON_BEHALF_OF_CLIENT_ID', required: false }) || clientId;
const onBehalfOfJwks = getJwks({ name: 'ON_BEHALF_OF_JWK', required: false}) || jwks;
const onBehalfOfDiscoveryUrl = configValue({ name: 'ON_BEHALF_OF_DISCOVERY_URL', required: false }) || discoveryUrl;
const onBehalfOfGrantType = configValue({ name: 'ON_BEHALF_OF_GRANT_TYPE', required: false }) || 'urn:ietf:params:oauth:grant-type:jwt-bearer';

const oidcAuthProxyBaseUrl = configValue({ name: 'OIDC_AUTH_PROXY_BASE_URL' });
const applicationBaseUrl = configValue({ name: 'APPLICATION_BASE_URL' });
const callbackPath = configValue({ name: 'CALLBACK_PATH', required: false}) || '/oidc/callback';
const callbackUrl = `${oidcAuthProxyBaseUrl}${callbackPath}`;
const sessionIdCookieName = configValue({ name: 'SESSION_ID_COOKIE_NAME' });
const sessionIdCookieSignSecret = configValue({ name: 'SESSION_ID_COOKIE_SIGN_SECRET', secret: true });
const sessionIdCookieVerifySecret = configValue({ name: 'SESSION_ID_COOKIE_VERIFY_SECRET', secret: true });
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

const useInMemorySessionStore = () => configValue({ name: 'USE_IN_MEMORY_SESSION_STORE', required: false }) === 'true';

const getRedisPassword = () => configValue({ name: 'REDIS_PASSWORD', secret: true });
const getRedisPort = () => configValue({ name: 'REDIS_PORT' });
const getRedisHost = () => configValue({ name: 'REDIS_HOST' });

const getCorsAllowedHeaders = () => {
    const value = configValue({ name: 'CORS_ALLOWED_HEADERS', required: false });
    if (!value) return 'x-correlation-id';
    else return `${value},x-correlation-id`;
};
const getCorsExposedHeaders = () => {
    const value = configValue({ name: 'CORS_EXPOSED_HEADERS', required: false });
    if (!value) return [];
    else return value;
};

module.exports = {
    clientId,
    jwks,
    loginScopes,
    discoveryUrl,
    additionalAuthorizationParameters,
    onBehalfOfClientId,
    onBehalfOfJwks,
    onBehalfOfDiscoveryUrl,
    onBehalfOfGrantType,
    oidcAuthProxyBaseUrl,
    applicationBaseUrl,
    sessionIdCookieSecrets,
    sessionIdCookieProperties: getSessionIdCookieProperties(),
    sessionIdCookieName,
    proxyConfig: getProxyConfig(),
    callbackPath,
    callbackUrl,
    getRedisHost,
    getRedisPort,
    getRedisPassword,
    getCorsAllowedHeaders,
    getCorsExposedHeaders,
    useInMemorySessionStore,
};

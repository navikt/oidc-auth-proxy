const environmentVariable = (name, secret = false) => {
    if (!process.env[name]) {
        console.error(`Mangler environment variable '${name}'.`);
        process.exit(1);
    }
    if (!secret) {
        console.log(`Env[${name}]=${process.env[name]}`);
    }
    return process.env[name]
};

const environmentVariableAsJson = (name, secret = false) => {
    try {
        return JSON.parse(environmentVariable(name, secret));
    } catch (error) {
        console.error(`Environment variable '${name}' er ikke et gyldig JSON-objekt.`, error);
        process.exit(1);
    }
};

export const getJwks = () => {
    var jwk = environmentVariableAsJson("JWK", true);
    if (!jwk.kid) {
        console.error(`Environment variable 'JWK' mangler 'kid' claim.`);
        process.exit(1);
    }
    return {
        keys: [jwk]
    };
};
export const getProxyConfig = () => {
    var config = environmentVariableAsJson("PROXY_CONFIG");
    if (!config.apis) {
        console.log("Environment variable 'PROXY_CONFIG' mangler 'apis' entry.")
        exit(1);
    }
    config.apis.forEach((entry, index) => {
        if (!entry.path) {
            console.error(`Api entry ${index} mangler 'path'`);
            process.exit(1);
        }
        if (!entry.url) {
            console.error(`Api entry ${index} mangler 'url'`);
            process.exit(1);
        }
        if (!entry.scopes) {
            console.error(`Api entry ${index} mangler 'scopes'`);
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

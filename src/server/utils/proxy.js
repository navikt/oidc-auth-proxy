import { getTokenOnBehalfOf } from './auth';

const getProxyConfig = () => {
    try {
        return JSON.parse(process.env.PROXYCONFIG);
    } catch (error) {
        console.error('process.env.PROXYCONFIG is not a valid JSON');
        process.exit(1);
    }
};

export const getProxyPrefix = () => getProxyConfig().prefix;
export const getProxyApis = () => getProxyConfig().apis;

export const getProxyOptions = (api, authClient) => ({
    proxyReqOptDecorator: (requestOptions, request) =>
        new Promise((resolve, reject) => {
            getTokenOnBehalfOf(authClient, api.clientId, request).then(
                ({ access_token }) => {
                    requestOptions.headers.Authorization = access_token;
                    resolve(requestOptions);
                },
                error => reject(error)
            );
        })
});

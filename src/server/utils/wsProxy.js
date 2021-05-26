import { logger } from './log';
import { getTokenOnBehalfOf, isAuthenticated } from './auth';
import { createProxyMiddleware } from 'http-proxy-middleware';

const getWsProxyOptions = (api, webSocketProxyPath) => {
    const webSocketUrl = new URL(api.webSocketUrl);

    const pathRewrites = {};
    pathRewrites[webSocketProxyPath] = webSocketUrl.pathname;
    
    logger.info(`WebSocket skrudd på for ${api.path}: ${webSocketProxyPath} -> ${webSocketUrl}`);

     return {
        target: webSocketUrl.origin,
        ws: true,
        secure: true,
        pathRewrite: pathRewrites,
        logLevel: 'debug',
        logProvider: () => logger,
        onProxyReqWs: (proxyReq, request) => {
            logger.info(`onProxyReqWs, authenticated=${isAuthenticated({request})}`);
        },
        onError: (error, request, response) => {
            logger.error(`onError, error=${error.message}`);
        }
    }
};

class WebSocketProxy {
    constructor(tokenExchangeClient) {
        this.tokenExchangeClient = tokenExchangeClient;
        this.proxies = {};
    }

    leggTil({api}) {
        if (api.webSocketUrl) {
            const path = `/ws/${api.path}`;
            const middleware = createProxyMiddleware(getWsProxyOptions(api, path));
            this.proxies[path] = {
                upgrade: middleware.upgrade,
                api: api
            };
            return {
                middleware: middleware,
                path: path
            };
         } else {
             logger.info(`WebSocket ikke skrudd på for ${api.path}`);
             return null;
         }
    }

    handleUpgrade({request, socket, head}) {
        const authenticated = isAuthenticated({request});
        const upgradeWebSocket = request.headers['upgrade'] === 'websocket';
        const proxy = this.proxies[request.url];

        return new Promise((resolve, reject) => {
            if (upgradeWebSocket && proxy) {
                if (authenticated) {
                    logger.info(`Authenticated WebSocket upgrade.`);
                    getTokenOnBehalfOf({ tokenExchangeClient: this.tokenExchangeClient, api: proxy.api, request }).then(
                        ({ token_type, access_token }) => {
                            request.headers['Authorization'] = `${token_type} ${access_token}`;
                            proxy.upgrade(request, socket, head)
                            resolve();
                        },
                        (error) => reject(error)
                    );
                } else {
                    logger.info(`Unauthorized WebSocket upgrade.`);
                    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                    socket.destroy();
                    resolve();
                }
            } else {
                resolve();
            }
        });
    }
};

module.exports = {
    WebSocketProxy
};

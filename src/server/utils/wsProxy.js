import { logger } from './log';
import { getTokenOnBehalfOf, isAuthenticated } from './auth';
import { createProxyMiddleware } from 'http-proxy-middleware';
//import config from './config';


const getWsProxyOptions = (api, webSocketPath) => {
    const pathRewrites = {};
    pathRewrites[webSocketPath] = '/ws';

    const target = new URL(api.url).origin;
    logger.info(`WebSocket skrudd på for ${api.path}: ${webSocketPath} -> ${target}/ws`);

     return {
        target: target,
        ws: true,
        //ssl: !config.allowProxyToSelfSignedCertificates, // TODO: Gir feil v/kjøring a tester..
        pathRewrite: pathRewrites,
        logProvider: () => logger,
        onProxyReqWs: (proxyReq, request) => {
            logger.debug("onProxyReqWs");
        }
    }
};

class WebSocketProxy {
    constructor(authClient) {
        this.authClient = authClient;
        this.proxies = {};
    }

    leggTil({api}) {
        if (api.enableWebSocket) {
            logger.info(`WebSocket skrudd på for ${api.path}`);
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
             logger.info(`WebSocket ikke skurdd på for ${api.path}`);
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
                    getTokenOnBehalfOf({ authClient: this.authClient, api: proxy.api, request }).then(
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

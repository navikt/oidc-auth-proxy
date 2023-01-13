import tunnel from 'tunnel';
import logger from './log';
import url from 'url';

const getHttpProxy = () => {
    const proxy = process.env['HTTP_PROXY'];
    if (!proxy) {
        logger.info('Bruker ingen HTTP Proxy');
        return null;
    } else {
        const proxyUrl = url.parse(proxy);
        if (proxyUrl.protocol === 'https:') {
            logger.info(`Bruker HTTP Proxy ${proxy} (httpsOverHttps)`);
            return {
                https: tunnel.httpsOverHttps({
                    proxy: {
                        host: proxyUrl.hostname,
                        port: proxyUrl.port,
                    },
                })
            };
        } else if (proxyUrl.protocol === 'http:') {
            logger.info(`Bruker HTTP Proxy ${proxy} (httpsOverHttp)`);
            return tunnel.httpsOverHttp({
                proxy: {
                    host: proxyUrl.hostname,
                    port: proxyUrl.port,
                },
            });
        } else {
            logger.warning(`HTTP Proxy med ${proxy} har ikke støttet protokoll ${proxyUrl.protocol}. Ingen proxy registrert.`);
            return null;
        }
    }
};

module.exports = {
    httpProxy: getHttpProxy()
};

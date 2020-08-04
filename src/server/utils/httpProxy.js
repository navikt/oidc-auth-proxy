import tunnel from 'tunnel';
import logger from './log';

const getHttpProxy = () => {
    const proxy = process.env['HTTP_PROXY'];
    if (!proxy) {
        logger.info('Bruker ingen HTTP Proxy');
        return null;
    } else {
        logger.info(`Bruker HTTP Proxy ${proxy}.`);
        const hostPort = proxy.replace('https://', '').replace('http://', '').split(':', 2);

        return tunnel.httpsOverHttp({
            proxy: {
                host: hostPort[0],
                port: hostPort[1],
            },
        });
    }
};

module.exports = {
    httpProxy: getHttpProxy(),
};

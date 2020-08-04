import config from "./config";
import logger from './log';
import url from 'url';
import redis from 'redis';
import { MemoryStore } from 'express-session';

export const getSessionStore = (session) => {
    const hostname = url.parse(config.oidcAuthProxyBaseUrl).hostname.toLocaleLowerCase();
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        logger.warning('Kjører applikasjonen med Session Store In Memory.');
        return new MemoryStore();
    } else {
        logger.info("Initialiserer Redis Session Store.")
        const RedisStore = require('connect-redis')(session);
        const redisClient = redis.createClient({
            host: config.getRedisHost(),
            password: config.getRedisPassword(),
            port: config.getRedisPort()
        });
        redisClient.on('connect', () => {
            logger.info('Redis client connected');
        });
        redisClient.on('error', err => {
            logger.error('Redis client feil', err);
        });
        return new RedisStore({ client: redisClient });
    }
} 

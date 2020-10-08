import config from './config';
import logger from './log';
import redis from 'redis';
import { MemoryStore } from 'express-session';

export const getSessionStore = (session) => {
    if (config.useInMemorySessionStore()) {
        logger.warning('Kjører applikasjonen med Session Store In Memory.');
        return new MemoryStore();
    } else {
        logger.info('Initialiserer Redis Session Store.');
        const RedisStore = require('connect-redis')(session);
        const redisClient = redis.createClient({
            host: config.getRedisHost(),
            password: config.getRedisPassword(),
            port: config.getRedisPort(),
        });
        redisClient.on('connect', () => {
            logger.info('Redis client connected');
        });
        redisClient.on('error', (err) => {
            logger.error('Redis client feil', err);
        });
        return new RedisStore({ client: redisClient });
    }
};

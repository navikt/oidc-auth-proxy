import config from './config';
import logger from './log';
import { createClient } from 'redis';
import RedisStore from 'connect-redis';
import { MemoryStore } from 'express-session';

export const getSessionStore = async () => {
    if (config.useInMemorySessionStore()) {
        logger.warning('Kjører applikasjonen med Session Store In Memory.');
        return new MemoryStore();
    } else {
        logger.info('Initialiserer Redis Session Store.');
        const redisClient = createClient({
            url: 'redis://localhost:6379',
            password: config.getRedisPassword(),
            port: config.getRedisPort(),
        });
        await redisClient.connect();
        redisClient.on('connect', async () => {
            await redisClient.ping();
            logger.info('Redis client connected');
        });
        redisClient.on('error', (err) => {
            logger.error('Redis client feil', err);
        });
        return new RedisStore({ client: redisClient });
    }
};

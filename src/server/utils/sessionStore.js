import config from "./config";
import logger from './log';
import url from 'url';
import { MemoryStore } from 'express-session';

export const getSessionStore = () => {
    if (url.parse(config.oidcAuthProxyBaseUrl).hostname.toLocaleLowerCase() === 'localhost') {
        logger.warning("Kjører applikasjonen med Session Store In Memory.");
        return new MemoryStore();
    } else {
        logger.info("Forsøker å initialisere Session Store mot REDIS.")
        return new MemoryStore();
    }
} 
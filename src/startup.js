import request from 'request-promise';
import dotenv from 'dotenv';
import { Issuer } from 'openid-client';
import startServer from './server';

dotenv.config();

async function startApp() {
    try {
        const openIdConfiguration = await request(process.env.OPENID_CONFIGURATION_URL);
        const issuer = new Issuer(openIdConfiguration);
        startServer(issuer);
    } catch(error) {
        console.error('Error during start-up', error)
    }
}

startApp();

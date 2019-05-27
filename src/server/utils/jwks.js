import dotenv from 'dotenv';
dotenv.config();

const jwks = {
    keys: [JSON.parse(process.env.PRIVATE_KEY)]
};

export default jwks;

import jose from 'node-jose';

export async function createKeystore() {
    const keyStore = jose.JWK.createKeyStore();
    const privateKey = await jose.JWK.asKey(process.env.PRIVATE_KEY).then((result) => result);
    keyStore.add(privateKey);
    return keyStore;
}

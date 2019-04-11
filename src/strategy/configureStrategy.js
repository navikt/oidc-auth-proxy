export default (issuer, clientId, clientSecret) => {
    const client = new issuer.Client({ clientId, clientSecret });

};

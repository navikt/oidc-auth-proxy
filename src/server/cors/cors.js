import config from "../utils/config";

export default (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', config.applicationBaseUrl);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Referer'
    );
    res.setHeader(
        'Access-Control-Expose-Headers',
        'Location'
    );
    return next();
};

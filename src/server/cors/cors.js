import { getApplicationBaseUrl } from "../utils/config";

const applicationBaseUrl = getApplicationBaseUrl();

export default (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', applicationBaseUrl);
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

import { getApplicationBaseUrl } from "./config";

const applicationBaseUrl = getApplicationBaseUrl();
const fallback = `${applicationBaseUrl}?login_redirect=stopped`;

export const getRefererFromRequest = ({request}) => {
    if (request.headers.referer && request.headers.referer.startsWith(applicationBaseUrl)) {
        return request.headers.referer;
    } else {
        return fallback;
    }
}

export const getRefererFromSession = ({request}) => {
    if (request.session.referer && request.session.referer.startsWith(applicationBaseUrl)) {
        return request.session.referer;
    } else {
        return fallback;
    }
}


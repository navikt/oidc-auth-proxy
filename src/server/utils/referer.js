import { getApplicationBaseUrl } from "./config";

const applicationBaseUrl = getApplicationBaseUrl();
const loginRedirectStopped = `${applicationBaseUrl}?error=login_redirect_stopped`;

const handleReferer = referer => {
    if (!referer) {
        return applicationBaseUrl;
    } else if (referer && referer.startsWith(applicationBaseUrl)) {
        return referer;
    } else {
        console.warn(`Ikke white listed referer '${referer}'. Redirecter til '${loginRedirectStopped}'`);
        return loginRedirectStopped;
    }
}

export const getRefererFromRequest = ({request}) => handleReferer(request.headers.referer);
export const getRefererFromSession = ({request}) => handleReferer(request.session.referer);


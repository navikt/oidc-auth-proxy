import { isAuthenticated, prepareAndGetAuthorizationUrl } from "../utils/auth";
import logger from '../utils/log';
import { getRefererFromRequest, getRedirectUriFromLoginUriQuery, getRedirectUriFromQuery } from "../utils/redirectUri";

export const loginRoutes = (app, authClient) => {
    app.get('/login', function(request, response) {
        const redirectUri = getRedirectUriFromQuery({request});
        const authenticated = isAuthenticated({request});
        if (authenticated) {
            logger.info("Allerede logget inn.")
            response.redirect(redirectUri);
        } else {
            const authorizationUrl = prepareAndGetAuthorizationUrl({request, authClient, redirectUri});
            response.redirect(authorizationUrl);
        }
    })
}
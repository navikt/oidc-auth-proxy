import { isAuthenticated, getAuthorizationUrl } from "../utils/auth";
import logger from '../utils/log';
import { getRefererFromRequest } from "../utils/referer";

export const loginRoutes = (app, authClient) => {
    app.get('/login', function(request, response) {
        const authenticated = isAuthenticated({request});
        if (authenticated) {
            logger.info("Allerede logget inn.")
            response.redirect(getRefererFromRequest({request}));
        } else {
            const authorizationUrl = getAuthorizationUrl({request, authClient});
            response.redirect(authorizationUrl);
        }
    })
}
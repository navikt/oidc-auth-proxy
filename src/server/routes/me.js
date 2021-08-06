import { isAuthenticated, getTokenSetsFromSession } from '../utils/auth';
import jwt_decode from 'jwt-decode';
import { getRedirectUriFromHeader } from '../utils/redirectUri';
import config from '../utils/config';
import { logger } from '../utils//log';


export const meRoutes = (app) => {
    app.get('/me', function (request, response) {
        const authenticated = isAuthenticated({ request });
        if (authenticated) {
            const tokenSet = getTokenSetsFromSession({ request })['self'];
            const decodedIdToken = jwt_decode(tokenSet.id_token);
            if (decodedIdToken.name) {
                response.json({
                    name: decodedIdToken.name,
                });
            } else {
                response.json({});
            }
        } else {
            logger.info("Ikke logget inn. Sender til innlogging. (/me path)");
            const redirectUri = getRedirectUriFromHeader({ request });
            response.header('Location', `${config.oidcAuthProxyBaseUrl}/login?redirect_uri=${redirectUri}`);
            response.sendStatus(401);
        }
    });
};

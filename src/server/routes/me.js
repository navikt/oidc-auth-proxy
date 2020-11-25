import { isAuthenticated, getTokenSetsFromSession } from '../utils/auth';
import jwt_decode from 'jwt-decode';

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
            response.sendStatus(401);
        }
    });
};

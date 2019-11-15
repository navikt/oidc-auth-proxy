import { isAuthenticated, getTokenSetsFromSession } from "../utils/auth";
import { JWT } from 'jose';

export const meRoutes = app => {
    app.get('/me', function(request, response) {
        const authenticated = isAuthenticated({request});
        if (authenticated) {
            const tokenSet = getTokenSetsFromSession({request})["self"];
            const decodedIdToken = JWT.decode(tokenSet.id_token);
            if (decodedIdToken.name) {
                response.json({
                    "name": decodedIdToken.name
                });
            } else {
                response.json({})
            }
        } else {
            response.sendStatus(401);
        }
    })
}
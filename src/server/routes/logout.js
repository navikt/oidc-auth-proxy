import logger from '../utils/log';

export const logoutRoutes = app => {
    app.get('/logout', function(request, response) {
        response.status(204).end();
        request.session.destroy(error => {
            if (error) {
                logger.error("Feil ved destroy av session", error);
            }
        });
    })
}
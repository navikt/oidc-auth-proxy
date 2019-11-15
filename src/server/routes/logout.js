import logger from '../utils/log';

export const logoutRoutes = app => {
    app.use('/logout', function(request, response) {
        response.sendStatus(204);
        request.session.destroy(error => {
            if (error) {
                logger.error("Feil ved destroy av session", error);
            }
        });
    })
}
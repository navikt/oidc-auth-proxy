const k8sRoutes = app => {
    app.get('/isready', function ({res}) {res.send('READY!')});
    app.get('/isalive', function ({res}) {res.send('ALIVE!')});
};

export default k8sRoutes;
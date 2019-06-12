import express from 'express';

const server = express();

server.get('*', (req, res) => {
    console.log(req.path, req.headers);
    res.send('ok');
});

server.listen(1337);

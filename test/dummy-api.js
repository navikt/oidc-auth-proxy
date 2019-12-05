import express from 'express';

const server = express();

server.get('*', (req, res) => {
    res.send('get ok');
});

server.post('*', (req, res) => {
    res.header("Location", "http://localhost:1337");
    res.sendStatus(201);
});

server.post('*', (req, res) => {
    res.send('put ok');
});

server.listen(8083);
import express from 'express';
import bodyParser from 'body-parser';

const server = express();

server.use(bodyParser.json());

server.get('*', (req, res) => {
    res.send('get ok');
});

server.post('*', (req, res) => {
    res.header('Location', 'http://localhost:1337');
    console.log(req.body);
    res.sendStatus(201);
});

server.post('*', (req, res) => {
    console.log(req.body);
    res.send('put ok');
});

server.listen(8083);

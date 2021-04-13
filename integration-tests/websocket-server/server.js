const http = require('http');
const jwt_decode = require('jwt-decode');
const WebSocket = require('ws');

const clientPort = 1337;
const serverPort = 1338;
const proxyPort = 8101;
const serverPath = '/ws';

const wss = new WebSocket.Server({
   port: serverPort,
   path: serverPath
 });

wss.on('connection', function connection(ws, req) {
    const authorizationHeader = req.headers['authorization'];
    var audience;
    if (!authorizationHeader) {
        audience = "authorization header ikke satt."
    } else {
        const jwt = authorizationHeader.replace("Bearer ", "");
        const decodedJwt = jwt_decode(jwt);
        audience = decodedJwt.aud;
    }
    ws.on('message', function incoming(data) {
        ws.send(audience);
    });
});

http.createServer(function (req, res) {
    var portAndPath;
    if (req.url.includes("direct")) {
        portAndPath = `${serverPort}${serverPath}`;
    } else {
        portAndPath = `${proxyPort}/ws/websocket-server`;
    }
    res.writeHead(200);
    res.end(`
    <div id="audience"></div>

    <script type="text/javascript">  
        var audience = document.getElementById('audience');
        var socket = new WebSocket('ws://localhost:${portAndPath}');
        socket.onopen = function () {
            socket.send('hello from the client');
        };

        socket.onmessage = function (message) {
            audience.innerHTML += message.data;
        };

        socket.onerror = function (error) {
            console.log('WebSocket error: ' + error);
        };
    </script>`
    );
}).listen(clientPort);
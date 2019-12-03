import express from 'express';
import http from 'http';
import url from 'url';
import querystring from 'querystring';
import jwt from 'jsonwebtoken';

const server = express();
var nonce = null;
var clientId = null;

server.get('/.well-known/openid-configuration', (req, res) => {
    res.json(wellKnown);
});

server.get('/keys', (req, res) => {
    res.json(keys);
});

function generateToken() {
    const headers = {
        "kid": "im-a-test-cert",
        "x5t": "im-a-test-cert",
        "typ": "JWT",
        "alg": "RS256"
    };
    const payload = {
        "sub": "1",
        "aud": clientId,
        "name": "Test Testesen",
        "iss": "http://localhost:8082/issuer",
        "nonce": nonce,
        "exp": 2574166425,
        "iat": 1574162825
    };

    var token = jwt.sign(payload, testPrivateKeyPem, { algorithm: 'RS256', keyid: "im-a-test-cert" });

    return token;
}

server.post('/token', (req, res) => {
    const token = generateToken();
    res.json({
        access_token: token,
        id_token: token,
        token_type: "Bearer",
        expires_in: 3600
    });
});

server.get('/authorize', (req, response) => {
    var postData = querystring.stringify({
        code: "123",
        state: req.query.state
    });

    nonce = req.query.nonce;
    clientId = req.query.client_id;

    const redirectUri = url.parse(req.query.redirect_uri);
    const options = {
        hostname: redirectUri.hostname,
        port: redirectUri.port,
        path: redirectUri.path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length,
            'Cookie': req.headers.cookie
          }
    };
    const httpRequest = http.request(options, function(res){
        response.redirect(res.headers.location);
    });

    httpRequest.write(postData);
    httpRequest.end();
});

server.listen(8082);

const wellKnown = {
    token_endpoint: `http://localhost:8082/token`,
    token_endpoint_auth_methods_supported: [
      "private_key_jwt",
    ],
    jwks_uri: "http://localhost:8082/keys",
    authorization_endpoint: "http://localhost:8082/authorize",
    response_modes_supported: [
      "form_post"
    ],
    response_types_supported: [
      "code"
    ],
    scopes_supported: [
      "openid",
      "profile"
    ],
    subject_types_supported: [
        "pairwise"
    ],
    issuer: "http://localhost:8082/issuer"
};

const keys = {
    keys : [{
        kty: "RSA",
        use: "sig",
        kid: "im-a-test-cert",
        x5t: "im-a-test-cert",
        e: "AQAB",
        x5c: [
            "MIIDrjCCApYCCQDuYRPfaleKHTANBgkqhkiG9w0BAQsFADCBmDELMAkGA1UEBhMCTk8xDTALBgNVBAgMBE9zbG8xDTALBgNVBAcMBE9zbG8xLzAtBgNVBAoMJk5BViAoQXJiZWlkcy0gb2cgdmVsZmVyZHNkaXJla3RvcmF0ZXQpMQ8wDQYDVQQLDAZOQVYgSVQxKTAnBgNVBAMMIG9pZGMtYXV0aC1wcm94eS10ZXN0LnRlc3QubmF2Lm5vMB4XDTE5MTExODE0NTczNloXDTIxMTExNzE0NTczNlowgZgxCzAJBgNVBAYTAk5PMQ0wCwYDVQQIDARPc2xvMQ0wCwYDVQQHDARPc2xvMS8wLQYDVQQKDCZOQVYgKEFyYmVpZHMtIG9nIHZlbGZlcmRzZGlyZWt0b3JhdGV0KTEPMA0GA1UECwwGTkFWIElUMSkwJwYDVQQDDCBvaWRjLWF1dGgtcHJveHktdGVzdC50ZXN0Lm5hdi5ubzCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBANoOVsy+ciREjOeUncvq\/7gOWiZMBfzz2t10skRCTLr\/dQZBpNVe6XX4urDfFxVcuq5T17h6f\/18UaK7agTsQVaSX0Rb\/WjZUHJg2du\/t\/bfvRXobx3yL6cMAoPqI0sUZGz8\/Q8NBJwP\/llFwKRteARzDVTRIPi0RZyDt8\/Anm4KHTOP8vXKZaobmL6zztcE7\/uvgQ\/4TbDHza\/fU+Unqu+THpLukI87bPG4K+fmf3PwznaidXJXAOKmI1w5HTRUHAHNTKoWLdyIirrx7HC7GE8f7jnklhkl3D2DScoEeyxnAy\/qFVe9ZvPzu13f8wWOFUDVKZdQBO9K7LShz9iOwiMCAwEAATANBgkqhkiG9w0BAQsFAAOCAQEAeFnP\/L99dkANB52MtLfZNA+2O01rRYntOq1ZotcIwHO5bcCugVnAxpQFFWbljzrcTKnZ\/3jznu56T+gS5LFPA\/J7i8tJT36v3MZmWj1Ny\/7qnrWL1HpLsNdHO5T+9aMS2SJowt+YnXXiIGdirJKzQ15Taxj1hlyZsbU4DFRI2FA1Bka1MHI6nCMd5nsk6o6aUj8qbg\/EQP4ADWTHHk6IvK1vB27gRPMOBAM5E2j+ycXIxN2y8z2gxlb2KzoVNaYs+wsUgPmbueQB7\/iERsURLcOKdSLbKiJf5BVYkPiH6J3ts7RgkyFgGdxJO1FhHiBvbLW5NxGQXBU1WZoOCazQkQ=="
        ],
        n: "2g5WzL5yJESM55Sdy-r_uA5aJkwF_PPa3XSyREJMuv91BkGk1V7pdfi6sN8XFVy6rlPXuHp__XxRortqBOxBVpJfRFv9aNlQcmDZ27-39t-9FehvHfIvpwwCg-ojSxRkbPz9Dw0EnA_-WUXApG14BHMNVNEg-LRFnIO3z8CebgodM4_y9cplqhuYvrPO1wTv-6-BD_hNsMfNr99T5Seq75Meku6Qjzts8bgr5-Z_c_DOdqJ1clcA4qYjXDkdNFQcAc1MqhYt3IiKuvHscLsYTx_uOeSWGSXcPYNJygR7LGcDL-oVV71m8_O7Xd_zBY4VQNUpl1AE70rstKHP2I7CIw"
    
    }]
};

const testPrivateKeyPem = `
-----BEGIN RSA PRIVATE KEY-----
MIIEpgIBAAKCAQEA2g5WzL5yJESM55Sdy+r/uA5aJkwF/PPa3XSyREJMuv91BkGk
1V7pdfi6sN8XFVy6rlPXuHp//XxRortqBOxBVpJfRFv9aNlQcmDZ27+39t+9Fehv
HfIvpwwCg+ojSxRkbPz9Dw0EnA/+WUXApG14BHMNVNEg+LRFnIO3z8CebgodM4/y
9cplqhuYvrPO1wTv+6+BD/hNsMfNr99T5Seq75Meku6Qjzts8bgr5+Z/c/DOdqJ1
clcA4qYjXDkdNFQcAc1MqhYt3IiKuvHscLsYTx/uOeSWGSXcPYNJygR7LGcDL+oV
V71m8/O7Xd/zBY4VQNUpl1AE70rstKHP2I7CIwIDAQABAoIBAQCkGFxb0goFnwzG
jcG+Hof4U9ylq1pqRHz1YQdydM5Xfzzqy2WnKLjaDac4yXoOmmzmGbRiYNWGxhKN
OyqKr9xvsNE+mVd3mup+WMI6K+neP/uEzBkq2QHhXRlbeky7CIqWtkAeHnbUlvia
5/IUC0lhV8+1f3enkco9AabHEjZnqZMjhN7idRjuUY1Si9UdvdMOBOUuGDaOfUiw
3z4YWm4aolWkpLmVHpoo1nxXQ7RUg4FWaSNL3rnQzFqcVdMfUyZ6JaaYhCNqKXGY
Ft1jcQLjim7HG6LFsWuyVKEMNbPgXM9znZtTFHufTk+yw/CYrB1j2ToIMp76C44l
z+v/B/dhAoGBAPG23gxABmBFtrJXtB/4gw+6QXsQ7hjEZ6gHgIwIfnW1FYmqiX4H
od8VUWLPK/kr+RwlApG9AwCg7WZxBYupFDht9lGjQPWKNFKWZ3AVianbt00/sCcG
VutFH4Qku3FmmApq2/SolUBGq6fzgrmOm/RqNjTySLCvOHErpwtp2nMzAoGBAObx
hZtdh3WM86Vjapep7QX/eh81H/kfc+7fz/rHlC2TugvyOAlmaiwI5zfQwmVPBceZ
5GXYIF7qsDZ0kiv7Y1JbFtZ+YuvUdeMvD2QeiFPDOB1qlM4TvIsepLtOfjIWp7x6
QxqvdXp7VkW6gAFlkEyDWTrIygVX0R7L0d7tDnVRAoGBAM5jfY/qL0eO3yPCvVu7
H3WTbQv+9b6SHYwc88ceDZTGDWDiC8pgC/hmxHphOUPmJyu/8kSspl6oCm05Pin1
Mf3I7tTgV7wQyQJnyGStD0HJCOfd5LQ9toPnHrT/hEmc91+VxMBQHjim3zVmOI3m
VgXJlwV4h1bOFpyTUGvvc4Z/AoGBANjnhPYcTSqx3PC8RBP4LD8S6S9AZSxFR0zW
9u7x3hFEi1vG/qyNfTComAnLT5l5M9N5jZO9/wFG6YPrzpHyhSGHnhaNE/mtTZ+3
xnvhVWdelmjCfspirRX5DP1DRrFip94U8suweeU0zB2ngaxOKM5EG11j0qJcDXQg
OJhpC8hRAoGBAOJb9C/Dz8kUYSzQyubdp56gMFTJbWEPGLhRIzHJGAoze9aeQ/TO
0wdmVUMoaDmi7AYpwRQ1jlv8BUjEB/+0I37JIOe4PK8HimQ351oSJHP9D9/iOba+
OUjsT/n1u67EX/6pN9fbXPMaUTnZcqEmEELwgedA0QUUg2FW1MIWetQT
-----END RSA PRIVATE KEY-----`

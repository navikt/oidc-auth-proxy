# OIDC-auth-proxy

Proxy som deployes som en egen instans ved siden av applikasjonen som skal bruke den.
Håndterer OIDC-innlogging, samt veksling til korrekt `on_behalf_of`- access token som trengs for å kalle de forskjellige tjenestene.

## Bygg
```
npm install
```

## Config
Config plukkes opp fra environment variabler
###
`CLIENT_ID` = OIDC Client ID for applikasjonen.
`JWK`= OIDC Client Private key på JWK format. Må inneholde kid claim som inneholder thumbprint av sertifikatet.
`DISCOVERY_URL`= OIDC Discovery URL for OIDC Provider
`OIDC_AUTH_PROXY_BASE_URL` = Base URL'en din instans av OIDC auth proxy. Dette vil bla.a. brukes som grunnlag til callback URL ved innlogging og vil være base url + `/callback` som må white listes hos OIDC provider som en gyldig callback URL.
`APPLICATION_BASE_URL` = Base URL'en til din applikasjon som dette benyttes som proxy for. Denne bruke bla.a. til white listing av URL'er proxyen redirecter tilbake til etter innlogging. Om det er en adresse under denne url'en er det OK, ellers redirectes man default rett til base url'en.

### PROXY_CONFIG
Inneholder listen `apis` som blir tilgjengeliggjort på `/api/{path}*` og dekker alle reqester som kommer bak denne pathen.

En entry i `apis` inneholder `path` for hvor api'et skal tilgjengeliggjøres, `url` for hvor requesten skal forwardes og `scopes` som er de scopene et access token trenger for å kunne nå dette api'et.

## Startup
```
export CLIENT_ID=fill-me
export JWK='{"kid": "set-me"}'
export DISCOVERY_URL=https://min-oidc-provider.no/.well-known/openid-configuration

export OIDC_AUTH_PROXY_BASE_URL=https://intern.nav.no/min-oidc-auth-proxy-instans
export APPLICATION_BASE_URL=https://intern.nav.no/min-app

export PROXYCONFIG='{
    "apis": [
        {
            "path": "/et-api",
            "url": "https://intern.nav.no/et-api",
            "scopes": "openid et-api-sin-client-id./default"
        }
    ]
}'

npm start
```

## Todo
[ ] White liste før vi redirecter tilbake til referer
[ ] Redis cache
[ ] Bygge docker image
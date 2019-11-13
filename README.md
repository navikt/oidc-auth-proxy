# OIDC-auth-proxy

Proxy som deployes som en egen instans ved siden av applikasjonen som skal bruke den.
Håndterer OIDC-innlogging, samt veksling til korrekt `on_behalf_of`- access token som trengs for å kalle de forskjellige tjenestene.

Når det kreves en ny innlogging fra brukeren vil proxyen gi en 401 error med `Location` header satt til hvor brukeren må redirectes for å gjøre innloggingen. Dette for at applikasjonen skal få mulighet til å lagre unna eventuell state før man redirecter til login.

## Config
Config plukkes opp fra environment variabler
### CLIENT_ID
OIDC Client ID for applikasjonen.
### JWK
OIDC Client Private key på JWK format. Må inneholde kid claim som inneholder thumbprint av sertifikatet.
### DISCOVERY_URL
OIDC Discovery URL for OIDC Provider.
### OIDC_AUTH_PROXY_BASE_URL
Base URL'en din instans av OIDC auth proxy. Dette vil bla.a. brukes som grunnlag til callback URL ved innlogging og vil være base url + `/oidc/callback` som må white listes hos OIDC provider som en gyldig callback URL.
### APPLICATION_BASE_URL
Base URL'en til din applikasjon som dette benyttes som proxy for. Denne bruke bla.a. til white listing av URL'er proxyen redirecter tilbake til etter innlogging. Om det er en adresse under denne url'en er det OK, ellers redirectes man default rett til base url'en.
### LOGIN_SCOPES
Scopes som skal spørres om ved innlogging.
### SESSION_ID_COOKIE_NAME
Navnet på Session ID Co
### SESSION_ID_COOKIE_SIGN_SECRET
Secret session id cookie signeres med (og verifiseres mot)
### SESSION_ID_COOKIE_VERIFY_SECRET
Secret session id cookie verifisres mot om den ikke var signert med `SESSION_ID_COOKIE_SIGN_SECRE` (For å rullere secrets.)
### HTTP_PROXY
Proxy som benyttes mot oidc provider (optional.)
### ALLOW_PROXY_TO_SELF_SIGNED_CERTIFICATES
Om settes til `true` vil det tillates at proxyen fungerer som proxy mot tjenester med selvsignerte TLS sertifikater.
Alle andre verdier vil føre til feil ved proxy request til tjenester med selvsignerte TLS sertifikater
### REDIS_HOST, REDIS_PORT & REDIS_PASSWORD
Må settes så fremt man ikke kjører applikasjonen med `OIDC_AUTH_PROXY_BASE_URL` på `localhost`
### PROXY_CONFIG
Inneholder listen `apis` som blir tilgjengeliggjort på `/api/{path}*` og dekker alle reqester som kommer bak denne pathen.

En entry i `apis` inneholder `path` for hvor api'et skal tilgjengeliggjøres, `url` for hvor requesten skal forwardes og `scopes` som er de scopene et access token trenger for å kunne nå dette api'et.

## Startup dev
Endre på `apis` i preprod_env iht. hva du ønsker å teste (bl.a. må scopes endres). Deretter sette secrets;
```
npm install
export JWK='{"kid": "set-the-rest"}'
export SESSION_ID_COOKIE_SIGN_SECRET=fill-me
export SESSION_ID_COOKIE_SIGN_SECRET=fill-me
source preprod_env
npm run start-dev
```
## Startup dist
Sette config på ønsket måte.
```
npm install
npm run build
npm run start
```
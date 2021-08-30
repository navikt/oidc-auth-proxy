# OIDC-auth-proxy

Proxy som deployes som en egen instans ved siden av applikasjonen som skal bruke den.
Håndterer OIDC-innlogging, samt veksling til korrekt `on_behalf_of`- access token som trengs for å kalle de forskjellige tjenestene.

Når det kreves en ny innlogging fra brukeren vil proxyen gi en 401 error med `Location` header satt til hvor brukeren må redirectes for å gjøre innloggingen. Dette for at applikasjonen skal få mulighet til å lagre unna eventuell state før man redirecter til login.

## End points

### GET /login?redirect_uri=

Redirect URI må være tilknyttet `APPLICATION_BASE_URL`
Redirecter til login og redirecter tilbake til `redirect_uri` når innloggingen er ferdig.

### ANY /logout

Logger brukeren ut og returnerer 204

### GET /me

Returnerer 200 JSON med `name` attributt satt til navnet på innlogget bruker (Krever at `profile` scope er satt ved innlogging, ellers returneres kun en tom JSON).
Returnerer 401 om brukeren ikke er logget inn.

## Config

Config plukkes opp fra environment variabler som i sin tur peker på hvor selve verdien er lagret.
Detter er en breaking change fra Major versjon 1 til versjon 2!!

Om verdien av environment variabelen starter med `value:` hentes verdien rått etter nevnte prefix.

Om verdien av environment variabelen starter med `env:` hentes verdien fra environment variable uten nevnte prefix.

Om verdien av environment variabelen starter med `path:` hentes verdien fra filen på denne pathen uten nevnte prefix.

### CLIENT_ID (required)

OIDC Client ID for applikasjonen.

### JWK (required)

OIDC Client Private key på JWK format. Må inneholde kid claim som inneholder thumbprint av sertifikatet.

### DISCOVERY_URL (required)

OIDC Discovery URL for OIDC Provider.

### OIDC_AUTH_PROXY_BASE_URL (required)

Base URL'en din instans av OIDC auth proxy. Dette vil bla.a. brukes som grunnlag til callback URL ved innlogging og vil være base url + `/oidc/callback` som må white listes hos OIDC provider som en gyldig callback URL.

### APPLICATION_BASE_URL (required)

Base URL'en til din applikasjon som dette benyttes som proxy for. Denne bruke bla.a. til white listing av URL'er proxyen redirecter tilbake til etter innlogging. Om det er en adresse under denne url'en er det OK, ellers redirectes man default rett til base url'en.

### LOGIN_SCOPES (required)

Scopes som skal spørres om ved innlogging.

### CALLBACK_PATH (optional)

Default `/oidc/callback`

### SESSION_ID_COOKIE_NAME (required)

Navnet på Session ID Cookie.

### SESSION_ID_COOKIE_SIGN_SECRET (required) 

Secret session id cookie signeres med (og verifiseres mot)

### SESSION_ID_COOKIE_VERIFY_SECRET (required)

Secret session id cookie verifisres mot om den ikke var signert med `SESSION_ID_COOKIE_SIGN_SECRE` (For å rullere secrets.)

### HTTP_PROXY (optional)

Proxy som benyttes mot oidc provider


### REDIS_HOST, REDIS_PORT & REDIS_PASSWORD (required)

For lagring av sesjoner i redis.

### CORS_ALLOWED_HEADERS && CORS_EXPOSED_HEADERS (optional)

Valgfrie. Default er ingen headere. Settes som CSV-verdier.

### PROXY_CONFIG (required)

Inneholder listen `apis` som blir tilgjengeliggjort på `/api/{path}*` og dekker alle reqester som kommer bak denne pathen.

En entry i `apis` inneholder `path` for hvor api'et skal tilgjengeliggjøres, `url` for hvor requesten skal forwardes og `scopes` som er de scopene et access token trenger for å kunne nå dette api'et.

### ADDITIONAL_AUTHORIZATION_PARAMETERS (optional)

Valgfri. Benyttes ved behov for ytterligere parametere i authorization-kallet. \
(Ved idporten-integrasjon må authorzation-kallet inneholde parameteren `resource` for at tokenet skal inneholde `aud`) \
På JSON-format. Feks `{"resource": "nav.no"}` 

NB: Denne vil ikke overskrive eksisterende parametre, kun legge til om de ikke finnes.

### ON_BEHALF_OF_* (optional)

Hvor * er `CLIENT_ID`, `JWK`, `DISCOVERY_URL` og `GRANT_TYPE`

Disse kan settes om man skal bruke en annen issuer og/eller client for login kontra `on_behalf_of`-flyten.

Om de ikke settes defaulter det til verdiene uten `ON_BEHALF_OF_`-prefix.

`ON_BEHALF_OF_GRANT_TYPE`  er default `urn:ietf:params:oauth:grant-type:jwt-bearer`

## Nais & secrets

https://doc.nais.io/security/secrets/kubernetes-secrets/

Eksempelvis, om man lager èn secret `oidc-auth-proxy-secrets` med tre verdier, `SESSION_ID_COOKIE_SIGN_SECRET`, `SESSION_ID_COOKIE_VERIFY_SECRET` & `REDIS_PASWORD`.


```
  filesFrom:
    - secret: oidc-auth-proxy-secrets
      mountPath: /var/run/secrets/oidc-auth-proxy
  .....
   env:
    - name: REDIS_PASSWORD
      value: path:/var/run/secrets/oidc-auth-proxy/REDIS_PASSWORD
    - name: SESSION_ID_COOKIE_SIGN_SECRET
      value: path:/var/run/secrets/oidc-auth-proxy/SESSION_ID_COOKIE_SIGN_SECRET
    - name: SESSION_ID_COOKIE_VERIFY_SECRET
      value: path:/var/run/secrets/oidc-auth-proxy/SESSION_ID_COOKIE_VERIFY_SECRET
```

## Nais & Idporten & TokenX

https://doc.nais.io/security/auth/tokenx/

https://doc.nais.io/security/auth/idporten/ 

```
{
  "CLIENT_ID": "env:IDPORTEN_CLIENT_ID",
  "JWK": "env:IDPORTEN_CLIENT_JWK",
  "DISCOVERY_URL": "env:IDPORTEN_WELL_KNOWN_URL",
  "LOGIN_SCOPES": "value:openid profile",
  "ON_BEHALF_OF_CLIENT_ID": "env:TOKEN_X_CLIENT_ID",
  "ON_BEHALF_DISCOVERY_URL": "env:TOKEN_X_WELL_KNOWN_URL",
  "ON_BEHALF_OF_JWK": "env:TOKEN_X_PRIVATE_JWK",
  "ON_BEHALF_OF_GRANT_TYPE": "value:urn:ietf:params:oauth:grant-type:token-exchange",
  "ADDITIONAL_AUTHORIZATION_PARAMETERS": 'value:{"resource": "https://nav.no"}'
}
```

## Nais & Azure

https://doc.nais.io/security/auth/azure-ad/

```
{
  "CLIENT_ID": "env:AZURE_APP_CLIENT_ID",
  "JWK": "env:AZURE_APP_JWK",
  "DISCOVERY_URL": "env:AZURE_APP_WELL_KNOWN_URL"
}
```

## Startup docker

Dette starter både mock av azure & oidc-auth-proxy i docker.
Bygger sistnevnte på nytt med eventuelle lokale endringer.

Om man ved åpning av `http://localhost:3000/login` havner på `http://localhost:3000/api/azure-mock/audience-check` med HTTP 200 response fungerer alt som det skal.

```
cd startup-utils/
./start-for-integration-tests.sh 
```

parametre som blir sendt med til `start-for-integration-tests.sh` sendes videre til docker-compose. F.eks `--detach` 

## Startup dev

Dette starter kun mock av azure i docker, men oidc-auth-proxy i dev-mode

```
npm install
cd startup-utils/
./start-for-local-dev.sh
cd ..
npm run start-dev
```

Om man ved åpning av `http://localhost:3000/login` havner på `http://localhost:3000/api/azure-mock/audience-check` med HTTP 200 response fungerer alt som det skal.

# Henvendelser

Spørsmål knyttet til koden eller prosjektet kan stilles som issues her på GitHub

## For NAV-ansatte

Interne henvendelser kan sendes via Slack i kanalen #sif_omsorgspenger.

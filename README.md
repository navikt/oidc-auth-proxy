# OIDC-auth-proxy

Proxy som deployes som en egen instans ved siden av applikasjonen som skal bruke den.
Håndterer OIDC-innlogging, samt veksling til korrekt `on_behalf_of`- access token som trengs for å kalle de forskjellige tjenestene.

Når det kreves en ny innlogging fra brukeren vil proxyen gi en 401 error med `Location` header satt til hvor brukeren må redirectes for å gjøre innloggingen. Dette for at applikasjonen skal få mulighet til å lagre unna eventuell state før man redirecter til login.

## GCP

### Opprette kubernetes secret
```
kubectl create secret generic <min-secret> -n <mitt-team> from-literal=SESSION_ID_COOKIE_SIGN_SECRET=<min-sign-secret> --from-literal= SESSION_ID_COOKIE_VERIFY_SECRET=<min-verify-secret>
```

### Bruke secret i naiserator 
```
  envFrom:
    - secret: <min-secret>
```

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

Config plukkes opp fra environment variabler.

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

Navnet på Session ID Cookie.

### SESSION_ID_COOKIE_SIGN_SECRET

Secret session id cookie signeres med (og verifiseres mot)

### SESSION_ID_COOKIE_VERIFY_SECRET

Secret session id cookie verifisres mot om den ikke var signert med `SESSION_ID_COOKIE_SIGN_SECRE` (For å rullere secrets.)

### HTTP_PROXY

Proxy som benyttes mot oidc provider (optional.)

### ALLOW_PROXY_TO_SELF_SIGNED_CERTIFICATES

Default `false`. Støtte for å sette true  vil fjernes ved neste major oppdaterting.

Om settes til `true` vil det tillates at proxyen fungerer som proxy mot tjenester med selvsignerte TLS sertifikater.
Alle andre verdier vil føre til feil ved proxy request til tjenester med selvsignerte TLS sertifikater

### REDIS_HOST, REDIS_PORT & REDIS_PASSWORD

Må settes så fremt man ikke kjører applikasjonen med `OIDC_AUTH_PROXY_BASE_URL` på `localhost`

### CORS_ALLOWED_HEADERS && CORS_EXPOSED_HEADERS

Valgfrie. Default er ingen headere. Settes som CSV-verdier.

### PROXY_CONFIG

Inneholder listen `apis` som blir tilgjengeliggjort på `/api/{path}*` og dekker alle reqester som kommer bak denne pathen.

En entry i `apis` inneholder `path` for hvor api'et skal tilgjengeliggjøres, `url` for hvor requesten skal forwardes og `scopes` som er de scopene et access token trenger for å kunne nå dette api'et.

### ADDITIONAL_AUTHORIZATION_PARAMETERS

Valgfri. Benyttes ved behov for ytterligere parametere i authorization-kallet. \
(Ved idporten-integrasjon må authorzation-kallet inneholde parameteren `resource` for at tokenet skal inneholde `aud`) \
På JSON-format. Feks `{"resource": "nav.no"}` 

NB: Denne vil ikke overskrive eksisterende parametre, kun legge til om de ikke finnes.

### TOKEN_EXCHANGE_CLIENT_ID

Valgfri. Default = `CLIENT_ID`.  
Settes dersom token-exchange skal gjøres med en annen klient enn autentiserings-flyten.  
Dette er nødvendig ved brukerautentisering via `Idporten`, fordi token-exhange løsningen ikke er så god, så NAIS har laget en egen løsning med navn `TokenX`. 
Blir importert direkte ved bruk av `TokenX`.

### TOKEN_EXCHANGE_DISCOVERY_URL

Valgfri. Default = `DISCOVERY_URL`.  
Settes dersom token-exchange skal gjøres med en annen klient enn autentiserings-flyten.  
Dette er nødvendig ved brukerautentisering via `Idporten`, fordi token-exhange løsningen ikke er så god, så NAIS har laget en egen løsning med navn `TokenX`.
Blir importert direkte ved bruk av `TokenX`.

### TOKEN_EXCHANGE_JWK

Valgfri. Default = `JWK`.  
Settes dersom token-exchange skal gjøres med en annen klient enn autentiserings-flyten.  
Dette er nødvendig ved brukerautentisering via `Idporten`, fordi token-exhange løsningen ikke er så god, så NAIS har laget en egen løsning med navn `TokenX`.
Blir importert direkte ved bruk av `TokenX`.


### TOKEN_EXCHANGE_GRANT_TYPE

Valgfri. Default = `urn:ietf:params:oauth:grant-type:jwt-bearer`.  
Settes for å overskrive `grant_type` som brukes ved token-exchange.  
Ved bruk av `TokenX` bør denne settes til `urn:ietf:params:oauth:grant-type:token-exchange`

## Startup docker

Dette starter både mock av azure & oidc-auth-proxy i docker.
Bygger sistnevnte på nytt med eventuelle lokale endringer.

Om man ved åpning av `http://localhost:8101/login` havner på `http://localhost:8101/api/azure-mock/audience-check` med HTTP 200 response fungerer alt som det skal.

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

Om man ved åpning av `http://localhost:8101/login` havner på `http://localhost:8101/api/azure-mock/audience-check` med HTTP 200 response fungerer alt som det skal.

## Ved lokal kjøring mot Idporten eller AzureAd direkte: 
Ved kjøring lokalt kan man bruke [disse **_TestKlientene_**](https://security.labs.nais.io/pages/utvikling/lokalt.html#testklienter). 
De er registrert i AzureAd og Idporten med `http://localhost:3000/oauth2/callback` som tillat redirectUri. 
Følgende fremgangsmåte vil ikke fungere for Chrome, så bruk Firefox:   
1. Oppdater og legg til nødvendige miljøvariabler i `startup-utils/create-env-files.sh`
   <details>
   <summary>Forslag til miljøvariabler som bør endres eller legges til:</summary> 
   
   #### AzureAd:
   ```
   echo CLIENT_ID='<test-app-1_AZURE_APP_CLIENT_ID>' >> $ENV_PATH
   echo JWK='<test-app-1_AZURE_APP_JWKS>' >> $ENV_PATH
   echo DISCOVERY_URL="'<test-app-1_AZURE_APP_WELL_KNOWN_URL>'" >> $ENV_PATH
   echo LOGIN_SCOPES="'openid profile <test-app-1_AZURE_APP_CLIENT_ID>/.default'" >> $ENV_PATH
   echo PROXY_CONFIG="'{\"apis\":[{\"path\":\"<BACKEND_PATH>\",\"url\":\"<BACKEND_URL>\",\"scopes\":\"<test-app-2_AZURE_APP_CLIENT_ID>/.default\"}]}'" >> $ENV_PATH
   echo OIDC_AUTH_PROXY_BASE_URL="'http://localhost:3000'" >> $ENV_PATH
   echo APPLICATION_BASE_URL="'http://localhost:3005'" >> $ENV_PATH
   ```
   * Variabler som starter på `<BACKEND...>` byttes ut avhengig av hvilke apper du kjører. 
   * Variabler som starter på `<test-app-...>` byttes ut med verdiene til **_TestKlientene_** 
     (se lenke i ingress, i dag ligger disse verdiene i vault). \
     Merk `<test-app-1_AZURE_APP_JWKS>` skal være uten `keys[]`. 
   
   #### Idporten:
   ```
   echo CLIENT_ID='<IDPORTEN_CLIENT_ID>' >> $ENV_PATH
   echo JWK='<IDPORTEN_CLIENT_JWK>' >> $ENV_PATH
   echo DISCOVERY_URL="'<IDPORTEN_WELL_KNOWN_URL>'" >> $ENV_PATH
   echo LOGIN_SCOPES="'openid profile'" >> $ENV_PATH
   
   echo TOKEN_EXCHANGE_CLIENT_ID='<din-frontend_TOKEN_X_CLIENT_ID>' >> $ENV_PATH
   echo TOKEN_EXCHANGE_DISCOVERY_URL="'<din-frontend_TOKEN_X_WELL_KNOWN_URL>'" >> $ENV_PATH
   echo TOKEN_EXCHANGE_JWK='<din-frontend_TOKEN_X_PRIVATE_JWK>' >> $ENV_PATH
   echo PROXY_CONFIG="'{\"apis\":[{\"path\":\"<BACKEND_PATH>\",\"url\":\"<BACKEND_URL>",\"scopes\":\"<din-backend_TOKEN_X_CLIENT_ID>\"}]}'" >> $ENV_PATH
 
   echo TOKEN_EXCHANGE_GRANT_TYPE= "'urn:ietf:params:oauth:grant-type:token-exchange'" >> $ENV_PATH
   echo ADDITIONAL_AUTHORIZATION_PARAMETERS= "'{\"resource\": \"https://nav.no\"}'" >> $ENV_PATH
   echo OIDC_AUTH_PROXY_BASE_URL="'http://localhost:3000'" >> $ENV_PATH
   echo APPLICATION_BASE_URL="'http://localhost:3005'" >> $ENV_PATH
   ```
   * Variabler som starter på `<IDPORTEN-...>` byttes ut med verdiene til _**TestKlienten**_ 
     (se lenke i ingress, i dag ligger disse verdiene i vault). 
   * Variabler som starter på `<BACKEND...>` byttes ut avhengig av hvilke apper du kjører. 
   * Variabler som starter på `<din-...>` byttes ut med verdier til de kjørende poddene du har i miljø. \
     (Det finnes ingen testklient for TokenX)
   </details>
   <br>
1. Rename alle forekomster av `/oidc/callback` til `/oauth2/callback` i hele koden. Det er kun denne pathen som er registrert.
1. Endre `services.oidc-auth-proxy.ports` i `startup-utils/docker-compose.yml` til: 
   ```
     - "3000:8101"
   ```
   Det kun er `localhost:3000` som er registrert, derfor endres porten fra `8101` til `3000`.
1. Oppdater `config.js` slik at sessionIdCookie har disse verdiene:
   ```
   secure = false;
   sameSite = 'none';
   ```
   (Dette ligger inni !https if'en)
   NB: Dette fungerer ikke i `Chrome`. Bruk `Firefox` isteden. 
1. Kjør opp med docker-compose: 
   ```
   cd startup-utils/
   ./start-for-integration-tests.sh
   ```

# Henvendelser

Spørsmål knyttet til koden eller prosjektet kan stilles som issues her på GitHub

## For NAV-ansatte

Interne henvendelser kan sendes via Slack i kanalen #sif_omsorgspenger.
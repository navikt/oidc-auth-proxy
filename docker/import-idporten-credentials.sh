#!/usr/bin/env sh

echo "Importing Idporten credentials"

if test -d /var/run/secrets/nais.io/idporten;
then
    FILE_NAME=/var/run/secrets/nais.io/idporten/IDPORTEN_CLIENT_JWK
    VALUE=$(cat $FILE_NAME)

    export CLIENT_ID=$IDPORTEN_CLIENT_ID
    export DISCOVERY_URL=$IDPORTEN_WELL_KNOWN_URL
    export JWK=$VALUE
fi

echo "Importing TokenX credentials"

if test -d /var/run/secrets/nais.io/jwker;
then
    FILE_NAME=/var/run/secrets/nais.io/jwker/TOKEN_X_PRIVATE_JWK
    VALUE=$(cat $FILE_NAME)

    export TOKEN_EXCHANGE_CLIENT_ID=$TOKEN_X_CLIENT_ID
    export TOKEN_EXCHANGE_DISCOVERY_URL=$TOKEN_X_WELL_KNOWN_URL
    export TOKEN_EXCHANGE_JWK=$VALUE
fi

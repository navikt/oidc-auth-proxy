#!/usr/bin/env sh

echo "Importing Idporten credentials"

if test -d /var/run/secrets/nais.io/idporten;
then
    FILE_NAME=/var/run/secrets/nais.io/idporten/IDPORTEN_CLIENT_JWK
    VALUE=$(cat $FILE_NAME | jq '.keys[0]')

    export CLIENT_ID=$IDPORTEN_CLIENT_ID
    export DISCOVERY_URL=$IDPORTEN_WELL_KNOWN_URL
    export JWK=$VALUE
fi

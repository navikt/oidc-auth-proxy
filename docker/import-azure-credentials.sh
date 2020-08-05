#!/usr/bin/env sh

echo "Importing Azure credentials"

if test -d /var/run/secrets/nais.io/azuread;
then
    for FILE in /var/run/secrets/nais.io/azuread/*
    do
        FILE_NAME=$(echo $FILE | sed 's:.*/::')
        KEY=$(echo $FILE_NAME | tr '[:lower:]' '[:upper:]')
        VALUE=$(cat "$FILE")

        echo "- exporting $KEY"
        export "$KEY"="$VALUE"
    done
fi

if test -d /var/run/secrets/nais.io/azure;
then
    FILE_NAME=/var/run/secrets/nais.io/azure/AZURE_APP_JWKS
    VALUE=$(cat $FILE_NAME | jq '.keys[0]')

    export CLIENT_ID=$AZURE_APP_CLIENT_ID
    export DISCOVERY_URL=$AZURE_APP_WELL_KNOWN_URL
    export JWK=$VALUE
fi

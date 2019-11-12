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
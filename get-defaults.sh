#!/bin/bash

set -e

if [ $# -ne 1 ]; then
    echo "usage: get-defaults.sh <path/to/dir>"
    exit 1
fi

cd $1

FILE_TO_SOURCE="args"

if [ ! -f "$FILE_TO_SOURCE" ]; then
    echo "no $FILE_TO_SOURCE file found"
    exit 1
fi

source $FILE_TO_SOURCE

set +e
    docker-compose down 2>/dev/null
    docker stop default-$SERVICE 2>/dev/null
set -e

docker run --rm -d --name default-$SERVICE relnaggar/rmsy.me-$SERVICE
mkdir old

set +e
    mv * old 2>/dev/null
set -e

mv old/$FILE_TO_SOURCE .
docker cp default-$SERVICE:$SRC/$DIR/ $1
mv $DIR/* .
rmdir $DIR
docker stop default-$SERVICE

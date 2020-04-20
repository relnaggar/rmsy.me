#!/bin/bash

STACKNAME=rmsy-me

if [ "$1" = "up" ]; then
    docker stack deploy -c docker-compose.yml -c docker-compose.override.yml $STACKNAME
elif [ "$1" = "down" ]; then
    docker stack rm $STACKNAME
elif [ "$1" = "logs" ]; then
    docker service logs rmsy-me_apache2
    docker service logs rmsy-me_postgres
else
    echo "operation not yet supported"
fi

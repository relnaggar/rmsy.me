#!/bin/bash

STACKNAME=rmsy-me

if [ "$1" = "up" ]; then
    docker stack deploy -c docker-compose.yml -c docker-compose.override.yml $STACKNAME
elif [ "$1" = "down" ]; then
    docker stack rm $STACKNAME
elif [ "$1" = "logs" ]; then
    docker service logs rmsy-me_apache2
    docker service logs rmsy-me_postgres
elif [ "$1" = "bash" ] && [ "$#" -eq 2 ]; then
    CONTAINER=`docker ps -a | grep -o "rmsy-me_$2.*"`
    exec docker exec -it $CONTAINER bash
else
    echo "operation not yet supported"
fi

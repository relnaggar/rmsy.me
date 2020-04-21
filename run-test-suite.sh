#!/bin/bash

# if the docker stack is up
if docker stack ls | grep -q "rmsy-me"; then
    SWARM=1
    COMPOSE=0
# if docker-compose is up
elif docker-compose exec apache2 echo 0 &> /dev/null ; then
    SWARM=0
    COMPOSE=1
elif [ "$1" = "production.sh" ] || [ "$1" = "development.sh" ]; then
    SWARM=0
    COMPOSE=0
    ./$1 up
else
    echo "error: the docker stack is down"
    echo "run ./developement.sh up before pushing"
    echo "aborting"
    exit 1
fi

./apache2/www/tests/run.sh
SUCCESS=$?

# if the stack was started by this script, tear it down at the end
if [ $SWARM -eq 0 ] && [ $COMPOSE -eq 0 ]; then
    ./$1 down
fi

exit $SUCCESS

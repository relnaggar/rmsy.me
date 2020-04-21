#!/bin/bash

# if the docker stack is up
if docker stack ls | grep -q "rmsy-me"; then
    CONTAINER=`docker ps -a | grep -o "rmsy-me_apache2.*"`
    docker exec -t $CONTAINER bash -c /var/www/tests/php-unit.sh
# if docker-compose is up
elif docker-compose exec apache2 echo 0 &> /dev/null ; then
    # -T prevents an issue with shell forwarding
    docker-compose exec -T apache2 bash -c /var/www/tests/php-unit.sh --exit-code-from apache2
else
    echo "error: the docker stack is down"
    echo "aborting"
    exit 1
fi

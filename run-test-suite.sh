#!/bin/bash

if docker-compose exec apache2 echo 0 &> /dev/null ; then
    APACHE2=1
else
    APACHE2=0
    docker-compose up -d
fi

./apache2/www/tests/run.sh
SUCCESS=$?

if [ $APACHE2 -eq 0 ]; then
    docker-compose down
fi

exit $SUCCESS

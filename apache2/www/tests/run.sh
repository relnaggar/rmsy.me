#!/bin/bash

docker-compose exec apache2 bash -c /var/www/tests/php-unit.sh

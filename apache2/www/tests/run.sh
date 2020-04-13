#!/bin/bash

docker-compose exec -T apache2 bash -c /var/www/tests/php-unit.sh --exit-code-from apache2

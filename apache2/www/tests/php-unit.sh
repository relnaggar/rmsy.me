#!/bin/bash

cd /var/www/
composer dumpautoload
~/.composer/vendor/bin/phpunit --bootstrap vendor/autoload.php --testdox tests
RESULT=$?
rm -r vendor
exit $RESULT

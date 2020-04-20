#!/bin/bash

cd /var/www/
composer dumpautoload
/home/apache2/.composer/vendor/bin/phpunit --bootstrap vendor/autoload.php --testdox tests
RESULT=$?
rm -r vendor
exit $RESULT

#!/bin/bash

cd /var/www/
composer dumpautoload
/home/apache2/.composer/vendor/bin/phpunit --bootstrap vendor/autoload.php --testdox tests --do-not-cache-result
RESULT=$?
rm -r vendor
exit $RESULT

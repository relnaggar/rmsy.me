#!/bin/bash

cd /var/www/
composer dumpautoload
~/.composer/vendor/bin/phpunit --bootstrap vendor/autoload.php --testdox tests
rm -r vendor

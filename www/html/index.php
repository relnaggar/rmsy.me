<?php

declare(strict_types=1);

require_once '/vendor/autoload.php'; // composer
require_once '../src/Framework/autoload.php'; // framework

// use Framework\Config;
// set config here e.g.
// Config::getInstance()->set('templateRootDirectory', 'templates');

$app = new RmsyMe\App();
$app->run();

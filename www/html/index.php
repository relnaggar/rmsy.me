<?php

declare(strict_types=1);

require_once '/vendor/autoload.php'; // composer

use Relnaggar\Veloz\Config;
Config::getInstance()->set('sourceDirectory', __DIR__ . '/../src/');

require_once '/vendor/relnaggar/veloz/autoload.php'; // for RmsyMe

use RmsyMe\App;

$app = new App();
$app->run();

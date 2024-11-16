<?php

declare(strict_types=1);

require_once '/vendor/autoload.php'; // composer
require_once '../src/autoload.php'; // for RmsyMe

use Relnaggar\Veloz\Config;
use RmsyMe\App;

Config::getInstance()->set('sourceDirectory', __DIR__ . '/../src/');
$app = new App();
$app->run();

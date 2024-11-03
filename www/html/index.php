<?php declare(strict_types=1);

require '/vendor/autoload.php'; // composer
require('../src/Framework/framework.php'); // framework

$app = new RmsyMe\App();
$app->run();

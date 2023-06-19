<?php declare(strict_types=1);

use Framework\EntryPoint;
use Framework\TemplateEngine;

$frameworkDirectory = $sourceDirectory . 'Framework/';
require($frameworkDirectory . 'autoload.php');

$templateEngine = new TemplateEngine();
$entryPoint = new EntryPoint($projectNamespace, $templateEngine);
$entryPoint->run();
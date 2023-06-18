<?php declare(strict_types=1);

$frameworkDirectory = $sourceDirectory . 'Framework/';
require($frameworkDirectory . 'autoload.php');
require($frameworkDirectory . 'loadTemplate.php');
require($frameworkDirectory . 'includeIcon.php');

$routesClass = "\\" . $projectNamespace . "\\Routes";
$routes = new $routesClass();
$entryPoint = new \Framework\EntryPoint($routes);
$entryPoint->run();
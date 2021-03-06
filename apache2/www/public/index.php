<?php declare(strict_types=1);

$GLOBALS['PRODUCTION'] = true;

if (!isset($GLOBALS['PRODUCTION'])) {
  ini_set('display_errors', '1');
  ini_set('display_startup_errors', '1');
  error_reporting(E_ALL);
}

$sourceDirectory = '../src/';
require($sourceDirectory . 'autoload.php');
require($sourceDirectory . 'loadTemplate.php');
require($sourceDirectory . 'includeIcon.php');

$routes = new \Routes();
$entryPoint = new \Framework\EntryPoint($routes);
$entryPoint->run();

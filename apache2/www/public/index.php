<?php declare(strict_types=1);

// Set this to true to disable error reporting
$GLOBALS['PRODUCTION'] = true;
if (!isset($GLOBALS['PRODUCTION'])) {
  ini_set('display_errors', '1');
  ini_set('display_startup_errors', '1');
  error_reporting(E_ALL);
}

$sourceDirectory = '../src/';
$projectNamespace = "RMSY";
require($sourceDirectory . 'Framework/framework.php');
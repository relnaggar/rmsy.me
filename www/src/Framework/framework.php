<?php declare(strict_types=1);

use Framework\EntryPoint;

// set the default source directory
if (!isset($sourceDirectory)) {
    $sourceDirectory = '../src/';
}

// autoloader
$frameworkDirectory = $sourceDirectory . 'Framework/';
require($frameworkDirectory . 'autoload.php');

// make sure the project namespace is defined
if (!isset($projectNamespace)) {
    throw new Error('Before importing framework.php you must define a global
variable \$projectNamespace that contains the name of your project folder');
}

// run the application
$entryPoint = new EntryPoint($projectNamespace);
$entryPoint->run();

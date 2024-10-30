<?php declare(strict_types=1);

use Framework\EntryPoint;

// make sure the project namespace is defined
if (!isset($frameworkConfig['projectNamespace'])) {
  throw new Error(
    'Before importing framework.php you must define a global
    array \$frameworkConfig that contains a key \'projectNamespace\' with
    the name of your project folder'
  );
}

// set the default source directory
if (!isset($frameworkConfig['sourceDirectory'])) {
  $frameworkConfig['sourceDirectory'] = '../src';
}
$frameworkConfig['sourceDirectory'] = $frameworkConfig['sourceDirectory'] ?? '../src';

// set the default template root directory
if (!isset($frameworkConfig['templateRootDirectory'])) {
  $frameworkConfig['templateRootDirectory'] = 'templates';
}

// set the default template file extension
if (!isset($frameworkConfig['templateFileExtension'])) {
  $frameworkConfig['templateFileExtension'] = '.html.php';
}

// set the default layout template path
if (!isset($frameworkConfig['layoutTemplatePath'])) {
  $frameworkConfig['layoutTemplatePath'] = 'layout';
}

// autoloader
require($frameworkConfig['sourceDirectory'] . '/Framework' . '/autoload.php');

// run the application
$entryPoint = new EntryPoint($frameworkConfig['projectNamespace']);
$entryPoint->run();

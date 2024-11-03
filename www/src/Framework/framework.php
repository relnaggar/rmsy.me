<?php declare(strict_types=1);

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

<?php declare(strict_types=1);
$icons = [];
function includeIcon($name) {
  global $icons;
  if (!isset($icons[$name])) {
    $icons[$name] = loadTemplate('/icons/' . $name, $templateVars=[], $fileExtension='.svg');
  }
  return $icons[$name];
}

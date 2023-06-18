<?php declare(strict_types=1);
$icons = [];
function includeIcon(string $name): string {
  global $icons;
  if (!isset($icons[$name])) {
    $icons[$name] = loadTemplate('/icons/' . $name, $templateVars=[], $fileExtension='.svg');
  }
  return $icons[$name];
}

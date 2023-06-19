<?php declare(strict_types=1);
$icons = [];
function includeIcon(string $name): string {
  global $icons, $templateEngine;
  if (!isset($icons[$name])) {
    $icons[$name] = $templateEngine->loadTemplate('/icons/' . $name, $templateVars=[], $fileExtension='.svg');
  }
  return $icons[$name];
}

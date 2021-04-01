<?php declare(strict_types=1);

function loadTemplate($filePath, $templateVars=[]) {
  global $sourceDirectory;
  extract($templateVars);
  ob_start();
  require $sourceDirectory . 'templates' . $filePath . '.html.php';
  $contents = ob_get_clean();
  return $contents;
}

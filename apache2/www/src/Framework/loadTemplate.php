<?php declare(strict_types=1);

function loadTemplate($filePath, $templateVars=[], $fileExtension='.html.php') {
  global $sourceDirectory;
  $templateDirectory = $sourceDirectory . 'templates';
  extract($templateVars);
  ob_start();
  require $templateDirectory . $filePath . $fileExtension;
  $contents = ob_get_clean();
  return $contents;
}

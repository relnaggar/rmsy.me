<?php declare(strict_types=1);

function loadTemplate($filePath, $templateVars=[], $fileExtension='.html.php') {
  global $sourceDirectory;
  extract($templateVars);
  ob_start();
  require $sourceDirectory . 'templates' . $filePath . $fileExtension;
  $contents = ob_get_clean();
  return $contents;
}

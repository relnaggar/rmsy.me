<?php declare(strict_types=1);
namespace Framework;

class TemplateEngine {
  public static function loadTemplate(string $filePath, array $templateVars=[], string $fileExtension='.html.php'): string {
    global $sourceDirectory;
    $templateDirectory = $sourceDirectory . 'templates';
    extract($templateVars);
    ob_start();
    require $templateDirectory . $filePath . $fileExtension;
    $contents = ob_get_clean();
    return $contents;
  }
}
<?php declare(strict_types=1);
namespace Framework;

class TemplateEngine {

  /**
    * Load a template file, inject variables into it, and return the result.
    *
    * @param string $templatePath The path to the template file, relative to the
    *   templates directory. Given without the file extension. The templates
    *   directory is assumed to be located at the root of the project and named
    *   'templates'. 
    *
    *   Example: 'folder/file' if the file is located at
    *   project_root/templates/folder/file.html.php.
    * @param array $templateVars Must be in the format
    *   ['variableName' => 'variableValue', ...].
    * @param string $fileExtension
    * @return string The contents of the template file with the variables
    *   injected.
    */
  public static function load_template(
    string $templatePath,
    array $templateVars=[],
    string $fileExtension='.html.php')
  : string {
    global $sourceDirectory;
    $templateDirectory = $sourceDirectory . 'templates';
    extract($templateVars);
    ob_start();
    require $templateDirectory . '/' . $templatePath . $fileExtension;
    $contents = ob_get_clean();
    return $contents;
  }
}

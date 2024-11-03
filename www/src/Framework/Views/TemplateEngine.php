<?php declare(strict_types=1);
namespace Framework\Views;

class TemplateEngine {
  /**
    * Load a template file, inject variables into it, and return the result.
    *
    * @param string $templatePath The path to the template file, relative to
    *   the configured template root directory. Given without the file
    *   extension.
    * @param array $templateVars The variables to inject. Must be in the format
    *   ['variableName' => 'variableValue', ...].
    * @param string $templateDirectory The directory of the template file. If
    *   empty, the configured template root directory is used.
    * @return string The contents of the template file with the variables
    *   injected.
    */
  public static function loadTemplate(
    string $templatePath,
    array $templateVars=[],
    string $templateDirectory=''
  ): string {
    global $frameworkConfig;

    // use the configured template root directory if none is given
    if (empty($templateDirectory)) {
      $templateDirectory = $frameworkConfig['templateRootDirectory'];
    }
    
    // extract the variables to be injected
    extract($templateVars);

    $filePath = $frameworkConfig['sourceDirectory'] . '/' . $templateDirectory .
      '/' . $templatePath . $frameworkConfig['templateFileExtension'];

    if (file_exists($filePath)) {
      // start output buffering to capture the template contents
      ob_start();
      // load the template file
      require $filePath;
      // return the contents of the output buffer
      return ob_get_clean();
    } else {
      return '';
    }
  }

  /*
    * Get a snippet of text from a HTML template.
    *
    * @param string $templatePath The path to the template file, relative to
    *   the configured template root directory. Given without the file
    *   extension.
    * @param array $templateVars The variables to inject. Must be in the format
    *   ['variableName' => 'variableValue', ...].
    * @param int $numberOfCharacters The number of characters to include in the
    *   snippet.
    * @return string The snippet of text.
    */
  public static function getSnippet(
    string $templatePath,
    array $templateVars=[],
    int $numberOfCharacters=200,
  ): string {
    $html = self::loadTemplate($templatePath, $templateVars);
    $text = strip_tags($html);
    $squashedText = trim(preg_replace('/\s+/', ' ', $text));
    $snippet = substr($squashedText, 0, $numberOfCharacters);
    return $snippet;
  }
}

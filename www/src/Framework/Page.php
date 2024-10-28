<?php declare(strict_types=1);
namespace Framework;

class Page {
  private string $htmlContent;

  // factory pattern used since PHP doesn't support method overloading
  private function __construct() {}

  public function get_html_content(): string {
    return $this->htmlContent;
  }

  /**
   * Create a new Page instance with the HTML content directly specified.
   *
   * @param string $htmlContent The HTML content for the Page.
   * @return Page A new Page instance with the specified HTML content.
   */
  public static function with_html_content(string $htmlContent): Page {
    $obj = new Page();
    $obj->htmlContent = $htmlContent;
    return $obj;
  }

  /**
   * Create a new Page instance with the HTML content loaded from a template
   * file, and inject the specified variables into the template.
   *
   * @param string $templatePath The path to the template file, relative to the
   *   templates directory. Given without the file extension, which must be
   *   '.html.php'. The templates directory is assumed to be located at the root
   *   of the project and named 'templates'.
   *   
   *   Example: 'folder/file' if the file is located at
   *   project_root/templates/folder/file.html.php.
   * @param array $templateVars The variables to pass to the template file. Must
   *   be in the format ['variableName' => 'variableValue', ...].
   * @return Page A new Page instance with the HTML content loaded from the
   * template file and the specified variables injected.
   */
  public static function with_template(
    string $templatePath,
    array $templateVars
  ): Page {
    $obj = new Page();
    $obj->htmlContent = TemplateEngine::load_template(
      $templatePath,
      $templateVars
    );
    return $obj;
  }

  /**
   * Create a new Page instance with the HTML content loaded from the
   * layout file, templates/layout.html.php. The content of the body must be
   * injected by specifying a body template file. Variables can then be injected
   * into the layout template and the given body template.
   * 
   * @param string $bodyTemplatePath The path to the body template file,
   *   relative to the templates directory. Given without the file extension,
   *   which must be '.html.php'. The templates directory is assumed to be
   *   located at the root of the project and named 'templates'.
   * 
   *   Example: 'folder/file' if the file is located at
   *   project_root/templates/folder/file.html.php.
   * @param array $templateVars The variables to pass to the default template
   *   file and/or the body template file. Must be in the format
   *   ['variableName' => 'variableValue', ...].
   * @param string $layoutTemplatePath The path to the layout template file,
   *   relative to the templates directory. Given without the file extension,
   *   which must be '.html.php'. The templates directory is assumed to be
   *   located at the root of the project and named 'templates'.
   * 
   *   Example: 'folder/file' if the file is located at
   *   project_root/templates/folder/file.html.php.
   * @return Page A new Page instance with the HTML content loaded from the
   *   layout file and the specified variables injected, including the body
   *   content loaded from the body template file.
   */
  public static function with_layout(
    string $bodyTemplatePath,
    array $templateVars=[],
    string $layoutTemplatePath='layout'
  ): Page {
    $obj = new Page();

    $obj->htmlContent = TemplateEngine::load_template($layoutTemplatePath, [
      'bodyContent' => TemplateEngine::load_template(
        $bodyTemplatePath,
        $templateVars
      ),
      ...$templateVars
    ]);
    return $obj;
  }
}

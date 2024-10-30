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
   * @param string $templatePath The path to the template file, relative to
   *   $templateRootDirectory. Given without the file extension.
   * @param array $templateVars The variables to inject to the template file.
   *   Must be in the format ['variableName' => 'variableValue', ...].
   * @return Page A new Page instance with the HTML content loaded from the
   * template file and the specified variables injected.
   */
  public static function with_template(
    string $templatePath,
    array $templateVars=[]
  ): Page {
    $obj = new Page();
    $obj->htmlContent = TemplateEngine::load_template(
      $templatePath,
      $templateVars
    );
    return $obj;
  }

  /**
   * Create a new Page instance with the HTML content loaded from the layout
   * template. The $bodyContent template variable is injected by
   * specifying the body template. Additional variables can then be
   * injected which will be available to both the layout and body templates.
   * 
   * @param string $bodyTemplatePath The path to the body template file,
   *   relative to the configured template root directory. Given without the
   *   file extension.
   * @param array $templateVars The variables to inject to the layout template
   *   and/or the body template. Must be in the format
   *   ['variableName' => 'variableValue', ...].
   * @param string $layoutTemplatePath The path to the layout template file,
   *   relative to the configured template root directory. Given without the
   *   file extension. If empty, the configured layout template path is used.
   * @return Page A new Page instance with the HTML content loaded from the
   *   layout file, the body content injected, and the specified variables
   *   injected.
   */
  public static function with_layout(
    string $bodyTemplatePath,
    array $templateVars=[],
    string $layoutTemplatePath='',
  ): Page {
    global $frameworkConfig;

    $obj = new Page();

    if (empty($layoutTemplatePath)) {
      $layoutTemplatePath = $frameworkConfig['layoutTemplatePath'];
    }

    $obj->htmlContent = TemplateEngine::load_template(
      $layoutTemplatePath,
      [
        'bodyContent' => TemplateEngine::load_template(
          $bodyTemplatePath,
          $templateVars
        ),
        ...$templateVars
      ]
    );
    return $obj;
  }
}

<?php declare(strict_types=1);
namespace Framework;

abstract class AbstractController {

  /**
   * Create a new Page instance with the HTML content loaded from the
   * layout file, templates/layout.html.php. The content of the body must be
   * injected by specifying a body template file, located in the templates
   * directory corresponding to the controller. Variables can then be injected
   * into layout template and the given body template.
   * 
   * @param string $bodyTemplatePath TThe path to the body template file,
   *   relative to the controller's template directory. Given without the file
   *   extension, which must be '.html.php'. The controller's templates
   *   directory is assumed to be project_root/templates/ControllerName.
   * 
   *   Example: 'folder/file' if the file is located at
   *   project_root/templates/ControlleraName/folder/file.html.php.
   * @param string $layoutTemplatePath The path to the layout template file,
   *   relative to the templates directory. Given without the file extension,
   *   which must be '.html.php'. The templates directory is assumed to be
   *   located at the root of the project and named 'templates'.
   * 
   *   Example: 'folder/file' if the file is located at
   *   project_root/templates/folder/file.html.php.
   * @param array $templateVars The variables to pass to the template. Must be
   *   in the format ['variableName' => 'variableValue', ...]
   * @return Page
   */
  public function get_controller_page_with_layout(
    string $bodyTemplatePath,
    array $templateVars=[],
    string $layoutTemplatePath='layout'
  ): Page {
    $controllerName = (new \ReflectionClass($this))->getShortName();
    return Page::with_layout(
      $controllerName . '/' . $bodyTemplatePath,
      $templateVars=$templateVars,
      $layoutTemplatePath=$layoutTemplatePath
    );
  }
}

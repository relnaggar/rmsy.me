<?php declare(strict_types=1);
namespace Framework;

abstract class AbstractController {
  private array $decorators;
  protected array $services;

  /** 
   * @param array $decorators An optional array of decorators to apply to the
   *   controller. Each decorator must implement the DecoratorInterface.
   * @param array $services An optional array of services to apply to the
   *  controller. Each service must implement the ServiceInterface.
   */
  public function __construct(array $decorators=[], array $services=[]) {
    // validate decorators
    foreach ($decorators as $decorator) {
      if (!($decorator instanceof DecoratorInterface)) {
        throw new \InvalidArgumentException(
          'All decorators must implement the DecoratorInterface.'
        );
      }
    }
    $this->decorators = $decorators;

    // validate services
    foreach ($services as $service) {
      if (!($service instanceof ServiceInterface)) {
        throw new \InvalidArgumentException(
          'All services must implement the ServiceInterface.'
        );
      }
    }
    $this->services = $services;
  }

  /**
   * Create a new Page instance with the HTML content loaded from the
   * layout template. The $bodyContent template variable is injected by
   * specifying the body template in this controller's template directory.
   * Additional variables can then be injected which will be available to both
   * the layout and body templates.
   * 
   * @param string $bodyTemplatePath The path to the body template file,
   *   relative to this controller's template directory, which is a subdirectory
   *   of the configured template root directory and named after the controller.
   *   Given without the file extension.
   * 
   *   For example, if the controller class is named 'Home', the configured
   *   templateRootDirectory is 'templates', and $bodyTemplatePath is
   *   given as 'index', then the body template file will be loaded from
   *  'sourceDirectory/templates/Home/index.html.php'.
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
  public function get_page(
    string $bodyTemplatePath,
    array $templateVars=[],
    string $layoutTemplatePath=''
  ): Page {
    $controllerName = (new \ReflectionClass($this))->getShortName();

    // apply decorators
    foreach ($this->decorators as $decorator) {
      $newTemplateVars = $decorator->get_new_template_vars($templateVars);
      foreach ($newTemplateVars as $key => $value) {
        if (array_key_exists($key, $templateVars)) {
          throw new \Error(
            'Decorators cannot modify existing template variables.'
          );
        }
        $templateVars[$key] = $value;
      }
    }

    return Page::with_layout(
      $controllerName . '/' . $bodyTemplatePath,
      $templateVars,
      $layoutTemplatePath
    );
  }

  /**
   * Redirect the user to the specified path.
   * 
   * @param string $path The path to redirect the user to.
   */
  public function redirect(string $path): void {
    header('Location: ' . $path);
    exit();
  }
}

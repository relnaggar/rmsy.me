<?php declare(strict_types=1);
namespace Framework\Controllers;

use Framework\Services\AbstractServiceUser;
use Framework\Decorators\AbstractDecorator;
use Framework\Views\Page;
use Framework\Views\TemplateEngine;

abstract class AbstractController extends AbstractServiceUser {
  private array $decorators=[];

  /**
   * Add a new decorator to the controller.
   * 
   * @param AbstractDecorator $decorator The decorator to register
   */
  public function addDecorator(AbstractDecorator $decorator): void {
    $this->decorators[] = $decorator;
  }

  /**
   * Apply the decorators to the template variables.
   * 
   * @param array $templateVars The template variables to apply the decorators
   *   to.
   * @return array The template variables with the decorators applied.
   */
  public function applyDecorators(array $templateVars): array {
    foreach ($this->decorators as $decorator) {
      $newTemplateVars = $decorator->getNewTemplateVars($templateVars);
      foreach ($newTemplateVars as $key => $value) {
        if (array_key_exists($key, $templateVars)) {
          throw new \Error(
            'Decorators cannot modify existing template variables.'
          );
        }
        $templateVars[$key] = $value;
      }
    }
    return $templateVars;
  }

  /**
   * Get the name of the controller class.
   * 
   * @return string The name of the controller class.
   */
  public function getControllerName(): string {
    return (new \ReflectionClass($this))->getShortName();
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
  public function getPage(
    string $bodyTemplatePath='',
    array $templateVars=[],
    string $layoutTemplatePath='',
    array $sections=[]
  ): Page {
    $templateVars = $this->applyDecorators($templateVars);

    foreach ($sections as $sectionId => &$section) {
      $section['html'] =
        TemplateEngine::loadTemplate(
          "{$section['templateDirectory']}/$sectionId",
          $templateVars
        );
    }
    if (!empty($sections)) {
      $templateVars['sections'] = $sections;
    }

    return Page::withLayout(
      "{$this->getControllerName()}/$bodyTemplatePath",
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

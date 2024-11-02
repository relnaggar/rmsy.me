<?php declare(strict_types=1);
namespace Framework\Routing;

use Framework\Controllers\AbstractController;

class ControllerAction {
  public readonly AbstractController $controller;
  public readonly string $action;
  public readonly array $params;

  /**
   * Constructs a ControllerAction object, which is a simple pair of a
   * controller and an action.
   * 
   * @param AbstractController $controller The controller to be called.
   * @param string $action The action to be called on the controller.
   */
  public function __construct(
    AbstractController $controller,
    string $action,
    array $params = []
  ) {
    $this->controller = $controller;
    $this->action = $action;
    $this->params = $params;
  }
}

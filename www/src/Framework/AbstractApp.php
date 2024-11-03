<?php declare(strict_types=1);
namespace Framework;

use DI\Container;

use Framework\Routing\ControllerAction;
use Framework\Views\Page;

abstract class AbstractApp {
  protected Container $container;

  public function __construct() {
    $this->container = new Container();
  }

  public final function run(): void {
    // get the URL path, not including the query string
    $serverRequestPath = explode('?', $_SERVER['REQUEST_URI'])[0];

    // get the HTTP method e.g. GET, POST, PUT, DELETE
    $httpMethod = $_SERVER['REQUEST_METHOD'];

    // get the controller and action as defined in the project's App.php
    $controllerAction = $this->route($serverRequestPath, $httpMethod);
    $controller = $controllerAction->controller;
    $action = $controllerAction->action;
    $params = $controllerAction->params;

    // call the controller action
    $page = $controller?->$action(...$params);
    // make sure the controller action returns a Page object
    if (! $page instanceof Page) {
      $controllerClass = get_class($controller);
      throw new \Error("Controller action $controllerClass->$action must return
        an instance of \\Framework\\Views\\Page");
    }
    // output the page content
    echo $page->getHtmlContent();
  }

  /**
   * Routes to a \Framework\ControllerAction object, which contains the
   * controller and action to be called when the user navigates to the given
   * path using the given HTTP method.
   * 
   * @param string $serverRequestPath The URL path, not including the query
   *  string.
   * @param string $httpMethod The HTTP method e.g. GET, POST, PUT, DELETE
   * @return ControllerAction The controller and action to be called when the
   *   user navigates to the given path using the given HTTP method.
   */
  abstract public function route(
    string $serverRequestPath,
    string $httpMethod
  ): ControllerAction;
}

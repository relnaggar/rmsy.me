<?php declare(strict_types=1);
namespace Framework;

class EntryPoint {
  private readonly RoutesInterface $routes;

  public function __construct(string $projectNamespace) {
    $routesClass = '\\' . $projectNamespace . '\\Routes';
    $this->routes = new $routesClass();
  }

  public function run(): void {
    // get the URL path, not including the query string
    $path = explode('?', $_SERVER['REQUEST_URI'])[0];

    // get the HTTP method e.g. GET, POST, PUT, DELETE
    $method = $_SERVER['REQUEST_METHOD'];

    // get the controller and action as defined in the project's Routes.php
    $controllerAction = $this->routes->get_controller_action($path,$method);
    $controller = $controllerAction->controller;
    $action = $controllerAction->action;

    // call the controller action
    $page = $controller?->$action();
    // make sure the controller action returns a Page object
    if (! $page instanceof \Framework\Page) {
      throw new \Error("Controller action TODO->$action must return an 
        instance of \\Framework\\Page");
    }
    // output the page content
    echo $page->get_html_content();
  }
}

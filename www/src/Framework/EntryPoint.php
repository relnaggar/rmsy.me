<?php declare(strict_types=1);
namespace Framework;

class EntryPoint {
  private readonly RouterInterface $router;

  public function __construct(string $projectNamespace) {
    $routerClass = '\\' . $projectNamespace . '\\Router';
    $this->router = new $routerClass();
  }

  public function run(): void {
    // get the URL path, not including the query string
    $serverRequestPath = explode('?', $_SERVER['REQUEST_URI'])[0];

    // get the HTTP method e.g. GET, POST, PUT, DELETE
    $httpMethod = $_SERVER['REQUEST_METHOD'];

    // get the controller and action as defined in the project's Routes.php
    $controllerAction = $this->router->route($serverRequestPath, $httpMethod);
    $controller = $controllerAction->controller;
    $action = $controllerAction->action;

    // call the controller action
    $page = $controller?->$action();
    // make sure the controller action returns a Page object
    if (! $page instanceof \Framework\Page) {
      $controllerClass = get_class($controller);
      throw new \Error("Controller action $controllerClass->$action must return
        an instance of \\Framework\\Page");
    }
    // output the page content
    echo $page->get_html_content();
  }
}

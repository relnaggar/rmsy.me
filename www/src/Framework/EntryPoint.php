<?php declare(strict_types=1);
namespace Framework;

class EntryPoint {
  private readonly Routing\RouterInterface $router;

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
    $params = $controllerAction->params;

    // call the controller action
    $page = $controller?->$action(...$params);
    // make sure the controller action returns a Page object
    if (! $page instanceof \Framework\Views\Page) {
      $controllerClass = get_class($controller);
      throw new \Error("Controller action $controllerClass->$action must return
        an instance of \\Framework\\Views\\Page");
    }
    // output the page content
    echo $page->getHtmlContent();
  }
}

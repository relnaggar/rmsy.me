<?php declare(strict_types=1);
namespace Framework;

class EntryPoint {
  private readonly AppInterface $app;

  public function __construct(string $projectNamespace) {
    $appClass = '\\' . $projectNamespace . '\\App';
    $this->app = new $appClass();
  }

  public function run(): void {
    // get the URL path, not including the query string
    $serverRequestPath = explode('?', $_SERVER['REQUEST_URI'])[0];

    // get the HTTP method e.g. GET, POST, PUT, DELETE
    $httpMethod = $_SERVER['REQUEST_METHOD'];

    // get the controller and action as defined in the project's App.php
    $controllerAction = $this->app->route($serverRequestPath, $httpMethod);
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

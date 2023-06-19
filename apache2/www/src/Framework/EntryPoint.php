<?php declare(strict_types=1);
namespace Framework;

class EntryPoint {
  /* @var TemplateEngine */
  private $templateEngine;

  /* @var RoutesInterface */
  private $routes;

  public function __construct(string $projectNamespace, TemplateEngine $templateEngine) {
    $this->templateEngine = $templateEngine;
    $routesClass = "\\" . $projectNamespace . "\\Routes";
    $this->routes = new $routesClass($this->templateEngine);
  }

  public function run(): void {
    $route = explode('?', $_SERVER['REQUEST_URI'])[0];
    $method = $_SERVER['REQUEST_METHOD'];
    $routes = $this->routes->getRoutes();
    if (isset($routes[$route][$method])) {
      $route = $routes[$route][$method];      
    } else {
      $route = $this->routes->getDefaultRoute();
    }
    $controller = $route['controller'];
    $functionName = $route['functionName'];
    $layoutVars = $controller->$functionName();
    $output = $this->templateEngine->loadTemplate('/layout', $layoutVars);
    echo $output;
  }
}

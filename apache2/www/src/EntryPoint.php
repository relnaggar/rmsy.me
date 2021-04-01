<?php declare(strict_types=1);

class EntryPoint {
  /* @var \Routes */
  private $routes;

  public function __construct(\Routes $routes) {
    $this->routes = $routes;
  }

  public function run(): void {
    $route = explode('?', $_SERVER['REQUEST_URI'])[0];
    $method = $_SERVER['REQUEST_METHOD'];
    $routes = $this->routes->getRoutes();
    $controller = $routes[$route][$method]['controller'];
    $functionName = $routes[$route][$method]['functionName'];
    $layoutVars = $controller->$functionName();
    $output = loadTemplate('/layout', $layoutVars);
    echo $output;
  }
}

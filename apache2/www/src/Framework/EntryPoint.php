<?php declare(strict_types=1);
namespace Framework;
class EntryPoint {
  /* @var \Framework\RoutesInterface */
  private $routes;

  public function __construct(\Framework\RoutesInterface $routes) {
    $this->routes = $routes;
  }

  public function run(): void {
    $route = explode('?', $_SERVER['REQUEST_URI'])[0];
    $method = $_SERVER['REQUEST_METHOD'];
    $routes = $this->routes->getRoutes();
    if (isset($routes[$route][$method])) {
      $controller = $routes[$route][$method]['controller'];
      $functionName = $routes[$route][$method]['functionName'];
    } else {
      $defaultRoute = $this->routes->getDefaultRoute();
      $controller = $defaultRoute['controller'];
      $functionName = $defaultRoute['functionName'];
    }
    $layoutVars = $controller->$functionName();
    $output = loadTemplate('/layout', $layoutVars);
    echo $output;
  }
}

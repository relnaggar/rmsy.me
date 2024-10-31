<?php declare(strict_types=1);
namespace Framework\Routing;

interface RouterInterface {
  
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
  public function route(
    string $serverRequestPath,
    string $httpMethod
  ): ControllerAction;
}

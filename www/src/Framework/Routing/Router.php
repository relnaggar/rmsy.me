<?php declare(strict_types=1);
namespace Framework\Routing;

class Router {
  /**
   * Routes to a \Framework\Routing\ControllerAction object, which contains the
   * controller and action to be called when the user navigates to the given
   * path using the given HTTP method.
   * 
   * @param string $path The URL path, not including the query string.
   * @param string $method The HTTP method e.g. GET, POST, PUT, DELETE
   * @param array $routes An associative array of routes, where the key is the
   *   route pattern and the value is an associative array of HTTP methods and
   *   \Framework\Routing\ControllerAction objects.
   * @param ControllerAction $pageNotFoundAction The controller and action to be
   *   called when no route matches the given path.
   */
  public static function route(
    string $path,
    string $method,
    array $routes,
    ControllerAction $pageNotFoundAction
  ): ControllerAction {
    foreach ($routes as $pattern => $route) {
      // replace all <...> with (?P<...>[^/]+)
      $regx = preg_replace('/<(\w+)>/', '(?P<$1>[^/]+)', $pattern);
      $regx = "#^$regx$#";
      if (preg_match($regx, $path, $matches)) {
        $matchingPattern = $pattern;
        break; // stop at first match to avoid $matches being overwritten
      }
    }

    if (!isset($matchingPattern)) { // no match
      return $pageNotFoundAction;
    } else if (!isset($routes[$matchingPattern][$method])) { // wrong method
      return new MethodNotAllowed(array_keys($routes[$matchingPattern]));
    } else { // match and correct method
      if (count($matches) == 1) { // no <...> matches
        return $routes[$matchingPattern][$method];
      } else { // 1 or more <...> matches
        $namedMatches = [];
        foreach ($matches as $key => $value) {
          if (is_string($key)) {
            $namedMatches[$key] = $value;
          }
        }
        return new ControllerAction(
          $routes[$matchingPattern][$method]->controller,
          $routes[$matchingPattern][$method]->action,
          $namedMatches // pass <...> matches as parameters
        );
      }
    }
  }
}

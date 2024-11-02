<?php declare(strict_types=1);
namespace Framework\Routing;

class MethodNotAllowed extends ControllerAction {
  public function __construct(array $allowedMethods)
  {
    http_response_code(405);
    header('Allow: ' . implode(', ', $allowedMethods));
    exit();
  }
}

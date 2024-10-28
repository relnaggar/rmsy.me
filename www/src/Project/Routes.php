<?php declare(strict_types=1);
namespace Project;

class Routes implements \Framework\RoutesInterface {
  public function get_controller_action(
    string $path,
    string $method
  ): \Framework\ControllerAction {
    return new \Framework\ControllerAction(new Controllers\Home(), 'index');
  }
}

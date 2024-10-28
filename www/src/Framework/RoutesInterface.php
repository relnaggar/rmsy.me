<?php declare(strict_types=1);
namespace Framework;

interface RoutesInterface {
  public function get_controller_action(
    string $path,
    string $method
  ): ControllerAction;
}

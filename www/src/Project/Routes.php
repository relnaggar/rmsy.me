<?php declare(strict_types=1);
namespace Project;

class Routes implements \Framework\RoutesInterface {
  public function get_controller_action(
    string $path,
    string $method
  ): \Framework\ControllerAction {
    $menuService = new Services\Menu();
    $homeController = new Controllers\Home($menuService);
    if ($path === '/') {
      return new \Framework\ControllerAction($homeController, 'index');
    } else if ($path === '/about') {
      return new \Framework\ControllerAction($homeController, 'about');
    } else if ($path === '/contact') {
      return new \Framework\ControllerAction($homeController, 'contact');
    } else {
      return new \Framework\ControllerAction($homeController, 'index');
    }
  }
}

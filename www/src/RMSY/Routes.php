<?php declare(strict_types=1);
namespace RMSY;

class Routes implements \Framework\RoutesInterface {
  public function get_controller_action(
    string $path,
    string $method
  ): \Framework\ControllerAction {
    $menuService = new Services\Menu();
    $siteController = new Controllers\Site($menuService);
    if ($path === '/') {
      return new \Framework\ControllerAction($siteController, 'index');
    } else if ($path === '/about') {
      return new \Framework\ControllerAction($siteController, 'about');
    } else if ($path === '/contact') {
      return new \Framework\ControllerAction($siteController, 'contact');
    } else {
      return new \Framework\ControllerAction($siteController, 'pageNotFound');
    }
  }
}

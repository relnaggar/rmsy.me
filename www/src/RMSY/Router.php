<?php declare(strict_types=1);
namespace RMSY;

class Router implements \Framework\RouterInterface {
  public function route(
    string $path,
    string $method
  ): \Framework\ControllerAction {
    $extendedTitleDecorator = new Decorators\ExtendedTitle();
    $navDecorator = new Decorators\Nav();
    $mediaRootDecorator = new Decorators\MediaRoot();    

    $siteController = new Controllers\Site([
      $extendedTitleDecorator,
      $navDecorator,      
      $mediaRootDecorator,      
    ]);

    if ($path === '/') {
      return new \Framework\ControllerAction($siteController, 'index');
    } else if ($path === '/about') {
      return new \Framework\ControllerAction($siteController, 'about');
    } else if ($path === '/contact') {
      return new \Framework\ControllerAction($siteController, 'contact');
    } else if ($path === '/linkedin') {
      return new \Framework\ControllerAction($siteController, 'linkedin');
    } else if ($path === '/github') {
      return new \Framework\ControllerAction($siteController, 'github');
    } else {
      return new \Framework\ControllerAction($siteController, 'pageNotFound');
    }
  }
}

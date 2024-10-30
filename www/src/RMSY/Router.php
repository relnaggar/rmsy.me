<?php declare(strict_types=1);
namespace RMSY;

class Router implements \Framework\RouterInterface {
  public function route(
    string $path,
    string $method
  ): \Framework\ControllerAction {
    // decorators
    $extendedTitleDecorator = new Decorators\ExtendedTitle();
    $navDecorator = new Decorators\Nav();
    $mediaRootDecorator = new Decorators\MediaRoot();
    
    // services
    $mailerService = new Services\Mailer();

    // controllers
    $siteController = new Controllers\Site(
      $decorators=[
        $extendedTitleDecorator,
        $navDecorator,      
        $mediaRootDecorator,      
      ],
    );
    $contactFormController = new Controllers\ContactForm(
      $decorators=[
        $extendedTitleDecorator,
        $navDecorator,
      ],
      $services=[
        'mailer' => $mailerService,
      ],
    );

    // routes
    switch($path) {
      case '/':
        return new \Framework\ControllerAction($siteController, 'index');
      case '/about':
        return new \Framework\ControllerAction($siteController, 'about');
      case '/contact':
        switch ($method) {
          case 'GET':
            return new \Framework\ControllerAction(
              $contactFormController,
              'contact'
            );
          case 'POST':
            return new \Framework\ControllerAction(
              $contactFormController,
              'contactSubmit'
            );
        }
      case '/linkedin':
        return new \Framework\ControllerAction($siteController, 'linkedin');
      case '/github':
        return new \Framework\ControllerAction($siteController, 'github');
      default:
        return new \Framework\ControllerAction($siteController, 'pageNotFound');
    }
  }
}

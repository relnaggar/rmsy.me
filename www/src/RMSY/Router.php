<?php declare(strict_types=1);
namespace RMSY;

use \Framework\Routing\ControllerAction;
use \Framework\Routing\Redirect;

class Router implements \Framework\Routing\RouterInterface {
  public function route(
    string $path,
    string $method
  ): ControllerAction {
    // services
    $menuService = new Services\Menu();
    $projectsService = new Services\Projects();
    $mediaService = new Services\Media();
    $secretsService = new Services\Secrets();
    $mailerService = new Services\Mailer();
    $mailerService->registerService($secretsService);

    // decorators

    $extendedTitleDecorator = new Decorators\ExtendedTitle();

    $navDecorator = new Decorators\Nav();
    $navDecorator->registerService($menuService);
    $navDecorator->registerService($projectsService);

    $mediaRootDecorator = new Decorators\MediaRoot();
    $mediaRootDecorator->registerService($mediaService);

    // controllers

    $siteController = new Controllers\Site();
    $siteController->registerService($mediaService);
    $siteController->addDecorator($extendedTitleDecorator);
    $siteController->addDecorator($navDecorator);
    $siteController->addDecorator($mediaRootDecorator);

    $contactFormController = new Controllers\ContactForm();
    $contactFormController->registerService($mailerService);
    $contactFormController->addDecorator($extendedTitleDecorator);
    $contactFormController->addDecorator($navDecorator);

    $projectsController = new Controllers\Projects();
    $projectsController->registerService($projectsService);
    $projectsController->addDecorator($extendedTitleDecorator);
    $projectsController->addDecorator($navDecorator);

    // routes
    switch($path) {
      case '/':
        return new ControllerAction($siteController, 'index');
      case '/about':
        return new ControllerAction($siteController, 'about');
      case '/tutoring':
        return new ControllerAction($siteController, 'tutoring');
      case '/resumes/full-stack-developer':
        return new Redirect(
          $mediaService->getMediaRoot() .
          '/resumes/ramsey-el-naggar-full-stack-developer.pdf'
        );
      case '/resumes/tutor':
        return new Redirect(
          $mediaService->getMediaRoot() . '/resumes/ramsey-el-naggar-tutor.pdf'
        );
      case '/github':
        return new Redirect('https://github.com/relnaggar');
      case '/linkedin':
        return new Redirect('https://www.linkedin.com/in/relnaggar/');
      case '/contact':
        switch ($method) {
          case 'GET':
            return new ControllerAction($contactFormController, 'contact');
          case 'POST':
            return new ControllerAction(
              $contactFormController,
              'contactSubmit',
            );
        }
      case '/projects/':
        return new ControllerAction($projectsController, 'summary');
      case '/projects/beetle':
        return new ControllerAction($projectsController, 'beetle');
      case '/projects/sdp':
        return new ControllerAction($projectsController, 'sdp');
      default:
        return new ControllerAction($siteController, 'pageNotFound');
    }
  }
}

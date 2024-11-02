<?php declare(strict_types=1);
namespace RMSY;

use \Framework\Routing\ControllerAction;
use \Framework\Routing\Redirect;
use \Framework\Routing\MethodNotAllowed;

class Router implements \Framework\Routing\RouterInterface {
  public function route(
    string $path,
    string $method
  ): ControllerAction {
    // services
    $contactMethodsService = new Services\ContactMethods();
    $projectsService = new Services\Projects();
    $navService = new Services\Nav();
    $navService->registerService($projectsService);
    $navService->registerService($contactMethodsService);
    $mediaService = new Services\Media();
    $secretsService = new Services\Secrets();
    $mailerService = new Services\Mailer();
    $mailerService->registerService($secretsService);

    // decorators

    $extendedTitleDecorator = new Decorators\ExtendedTitle();

    $navDecorator = new Decorators\Nav();
    $navDecorator->registerService($navService);

    $mediaRootDecorator = new Decorators\MediaRoot();
    $mediaRootDecorator->registerService($mediaService);

    // controllers

    $siteController = new Controllers\Site();
    $siteController->registerService($mediaService);
    $siteController->addDecorator($extendedTitleDecorator);
    $siteController->addDecorator($navDecorator);
    $siteController->addDecorator($mediaRootDecorator);

    $contactFormController = new Controllers\ContactForm();
    $contactFormController->registerService($contactMethodsService);
    $contactFormController->registerService($mailerService);
    $contactFormController->addDecorator($extendedTitleDecorator);
    $contactFormController->addDecorator($navDecorator);

    $projectsController = new Controllers\Projects();
    $projectsController->addDecorator($extendedTitleDecorator);
    $projectsController->addDecorator($navDecorator);

    // routes

    // projects routes
    $projectsBasePath = '/projects';
    if (strpos($path, $projectsBasePath) === 0) {
      $routes = [
        "$projectsBasePath/" => [
          'GET' => new ControllerAction($projectsController, 'index'),
        ],
      ];
      foreach ($projectsService->getData() as $projectSlug => $projectData) {
        $routes["$projectsBasePath/$projectSlug"] = [
          'GET' => new ControllerAction(
            $projectsController,
            'show',
            [$projectSlug, $projectData]
          ),
        ];
      }
    } else {
      // other routes
      $routes = [
        '/' => [
          'GET' => new ControllerAction($siteController, 'index'),
        ],
        '/about' => [
          'GET' => new ControllerAction($siteController, 'about'),
        ],
        '/tutoring' => [
          'GET' => new ControllerAction($siteController, 'tutoring'),
        ],
        '/resumes/full-stack-developer' => [
          'GET' => new Redirect(
            $mediaService->getMediaRoot() .
            '/resumes/ramsey-el-naggar-full-stack-developer.pdf'
          ),
        ],
        '/resumes/tutor' => [
          'GET' => new Redirect(
            $mediaService->getMediaRoot() .
            '/resumes/ramsey-el-naggar-tutor.pdf'
          ),
        ],
        '/github' => [
          'GET' => new Redirect('https://github.com/relnaggar'),
        ],
        '/linkedin' => [
          'GET' => new Redirect('https://www.linkedin.com/in/relnaggar/'),
        ],
        '/contact' => [
          'GET' => new ControllerAction($contactFormController, 'contact'),
          'POST' => new ControllerAction(
            $contactFormController,
            'contactSubmit'
          ),
        ],
      ];
    }

    if (!isset($routes[$path])) {
      return new ControllerAction($siteController, 'pageNotFound');
    } else if (!isset($routes[$path][$method])) {
      return new MethodNotAllowed(array_keys($routes[$path]));
    } else {
      return $routes[$path][$method];
    }
  }
}

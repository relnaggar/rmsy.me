<?php declare(strict_types=1);
namespace RmsyMe;

use DI\ContainerBuilder;

use Framework\AbstractApp;
use Framework\Routing\ControllerAction;
use Framework\Routing\Redirect;
use Framework\Routing\Router;

class App extends AbstractApp {
  public function __construct() {
    $containerBuilder = new ContainerBuilder();
    // configure autowiring of decorators to controllers
    
    $containerBuilder->addDefinitions([
      Controllers\Site::class => \DI\autowire()
        ->constructorParameter('decorators', [
          \DI\get(Decorators\ExtendedTitle::class),
          \DI\get(Decorators\Nav::class),
          \DI\get(Decorators\MediaRoot::class),
        ]),
      Controllers\ContactForm::class => \DI\autowire()
        ->constructorParameter('decorators', [
          \DI\get(Decorators\ExtendedTitle::class),
          \DI\get(Decorators\Nav::class),
        ]),
      Controllers\Projects::class => \DI\autowire()
        ->constructorParameter('decorators', [
          \DI\get(Decorators\ExtendedTitle::class),
          \DI\get(Decorators\Nav::class),
          \DI\get(Decorators\MediaRoot::class),
        ]),
    ]);

    $this->container = $containerBuilder->build();
  }

  public function route(
    string $path,
    string $method
  ): ControllerAction {
    // services
    $mediaService = $this->container->get(Services\Media::class);

    // controllers
    $siteController = $this->container->get(Controllers\Site::class);
    $contactFormController = $this->container->get(
      Controllers\ContactForm::class
    );
    $projectsController = $this->container->get(Controllers\Projects::class);

    // routes
    $routes = [
      '/' => [
        'GET' => new ControllerAction($siteController, 'index'),
      ],
      '/about' => [
        'GET' => new ControllerAction($siteController, 'about'),
      ],
      '/projects/' => [
        'GET' => new ControllerAction($projectsController, 'index'),
      ],
      '/projects/<projectSlug>' => [
        'GET' => new ControllerAction($projectsController, 'show'),
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
          $mediaService->getMediaRoot() . '/resumes/ramsey-el-naggar-tutor.pdf'
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
        'POST' => new ControllerAction($contactFormController, 'contactSubmit'),
      ],
    ];

    return Router::route(
      $path,
      $method,
      $routes,
      new ControllerAction($siteController, 'pageNotFound')
    );
  }
}

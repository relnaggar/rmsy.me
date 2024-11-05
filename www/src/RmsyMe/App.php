<?php declare(strict_types=1);
namespace RmsyMe;

use Framework\AbstractApp;
use Framework\Routing\RouterInterface;
use Framework\Routing\BasicRouter;
use Framework\Routing\ControllerAction;
use Framework\Routing\Redirect;

class App extends AbstractApp {
  public function getDecoratorMap(): array {
    return [
      Controllers\Site::class => [
        Decorators\ExtendedTitle::class,
        Decorators\Nav::class,
        Decorators\MediaRoot::class,
      ],
      Controllers\ContactForm::class => [
        Decorators\ExtendedTitle::class,
        Decorators\Nav::class,
      ],
      Controllers\Projects::class => [
        Decorators\ExtendedTitle::class,
        Decorators\Nav::class,
        Decorators\MediaRoot::class,
      ]
    ];
  }

  public function getRouter(): RouterInterface {
    $mediaService = new Services\Media();
    return new BasicRouter(
      routes: [
        '/' => [
          'GET' => new ControllerAction(Controllers\Site::class, 'index'),
        ],
        '/about' => [
          'GET' => new ControllerAction(Controllers\Site::class, 'about'),
        ],
        '/projects/' => [
          'GET' => new ControllerAction(Controllers\Projects::class, 'index'),
        ],
        '/projects/<projectSlug>' => [
          'GET' => new ControllerAction(Controllers\Projects::class, 'show'),
        ],
        // '/tutoring' => [
        //   'GET' => new ControllerAction(Controllers\Site::class, 'tutoring'),
        // ],
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
          'GET' => new ControllerAction(
            Controllers\ContactForm::class,
            'contact'
          ),
          'POST' => new ControllerAction(
            Controllers\ContactForm::class,
            'contactSubmit'
          ),
        ],
      ],
      pageNotFound: new ControllerAction(
        Controllers\Site::class,
        'pageNotFound'
      ),
    );
  }
}

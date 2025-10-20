<?php

declare(strict_types=1);

namespace RmsyMe;

use Relnaggar\Veloz\{
  AbstractApp,
  Routing\RouterInterface,
  Routing\BasicRouter,
  Routing\ControllerAction,
  Routing\Redirect,
};

class App extends AbstractApp
{
  public function getDecoratorMap(): array
  {
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
        Decorators\Sidebar::class,
      ],
      Controllers\Client::class => [
        Decorators\ExtendedTitle::class,
        Decorators\Nav::class,
      ],
    ];
  }

  public function getRouter(): RouterInterface
  {
    $mediaService = new Services\Media();

    return new BasicRouter(
      routes: [
        '/' => [
          'GET' => new ControllerAction(Controllers\Site::class, 'index'),
        ],
        '/about' => [
          'GET' => new ControllerAction(Controllers\Site::class, 'about'),
        ],
        // '/services/engineer' => [
        //   'GET' => new ControllerAction(
        //     Controllers\Services::class,
        //     'engineer'
        //   ),
        // ],
        // '/services/educator' => [
        //   'GET' => new ControllerAction(
        //     Controllers\Services::class,
        //     'educator'
        //   ),
        // ],
        '/projects/' => [
          'GET' => new ControllerAction(Controllers\Projects::class, 'index'),
        ],
        '/projects/<projectSlug>' => [
          'GET' => new ControllerAction(Controllers\Projects::class, 'show'),
        ],
        '/free-meeting' => [
          'GET' => new Redirect("https://calendly.com/relnaggar/free-meeting"),
        ],
        '/resumes/full-stack-developer' => [
          'GET' => new Redirect(
            $mediaService->getMediaRoot() .
              '/resumes/ramsey-el-naggar-full-stack-developer.pdf'
          ),
        ],
        '/resumes/educator' => [
          'GET' => new Redirect(
            $mediaService->getMediaRoot() .
              '/resumes/ramsey-el-naggar-educator.pdf'
          ),
        ],
        '/github' => [
          'GET' => new Redirect('https://github.com/relnaggar', 301),
        ],
        '/linkedin' => [
          'GET' => new Redirect('https://www.linkedin.com/in/relnaggar/', 301),
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
        '/login' => [
          'GET' => new ControllerAction(
            Controllers\Client::class,
            'login'
          ),
          'POST' => new ControllerAction(
            Controllers\Client::class,
            'loginSubmit'
          ),
        ],
        '/database-error' => [
          'GET' => new ControllerAction(
            Controllers\Site::class,
            'databaseError'
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

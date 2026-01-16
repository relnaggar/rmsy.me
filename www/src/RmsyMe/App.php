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
      Controllers\SiteController::class => [
        Decorators\ExtendedTitleDecorator::class,
        Decorators\NavDecorator::class,
        Decorators\MediaRootDecorator::class,
      ],
      Controllers\ContactController::class => [
        Decorators\ExtendedTitleDecorator::class,
        Decorators\NavDecorator::class,
      ],
      Controllers\ProjectsController::class => [
        Decorators\ExtendedTitleDecorator::class,
        Decorators\NavDecorator::class,
        Decorators\MediaRootDecorator::class,
        Decorators\SidebarDecorator::class,
      ],
      Controllers\LoginController::class => [
        Decorators\ExtendedTitleDecorator::class,
        Decorators\NavDecorator::class,
      ],
      Controllers\ClientController::class => [
        Decorators\ExtendedTitleDecorator::class,
        Decorators\NavDecorator::class,
        Decorators\SidebarDecorator::class,
      ],
    ];
  }

  public function getRouter(): RouterInterface
  {
    $mediaService = new Services\MediaService();

    return new BasicRouter(
      routes: [
        '/' => [
          'GET' => new ControllerAction(
            Controllers\SiteController::class,
            'index'
          ),
        ],
        '/about' => [
          'GET' => new ControllerAction(
            Controllers\SiteController::class,
            'about'
          ),
        ],
        // '/services/engineer' => [
        //   'GET' => new ControllerAction(
        //     Controllers\ServicesController::class,
        //     'engineer'
        //   ),
        // ],
        // '/services/educator' => [
        //   'GET' => new ControllerAction(
        //     Controllers\ServicesController::class,
        //     'educator'
        //   ),
        // ],
        '/projects/' => [
          'GET' => new ControllerAction(
            Controllers\ProjectsController::class,
            'index'
          ),
        ],
        '/projects/<projectSlug>' => [
          'GET' => new ControllerAction(
            Controllers\ProjectsController::class,
            'show'
          ),
        ],
        '/free-meeting' => [
          'GET' => new Redirect('https://calendly.com/relnaggar/free-meeting'),
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
            Controllers\ContactController::class,
            'contact'
          ),
          'POST' => new ControllerAction(
            Controllers\ContactController::class,
            'contactSubmit'
          ),
        ],
        '/client/login' => [
          'GET' => new ControllerAction(
            Controllers\LoginController::class,
            'login'
          ),
          'POST' => new ControllerAction(
            Controllers\LoginController::class,
            'loginSubmit'
          ),
        ],
        '/client/logout' => [
          'GET' => new ControllerAction(
            Controllers\LoginController::class,
            'logout'
          ),
        ],
        '/client/' => [
          'GET' => new ControllerAction(
            Controllers\ClientController::class,
            'index'
          ),
        ],
        '/client/payments' => [
          'GET' => new ControllerAction(
            Controllers\ClientController::class,
            'payments'
          ),
          'POST' => new ControllerAction(
            Controllers\ClientController::class,
            'paymentsSubmit'
          ),
        ],
        '/client/buyers' => [
          'GET' => new ControllerAction(
            Controllers\ClientController::class,
            'buyers'
          ),
        ],
        '/client/students' => [
          'GET' => new ControllerAction(
            Controllers\ClientController::class,
            'students'
          ),
        ],
        '/client/students/<studentIdString>' => [
          'GET' => new ControllerAction(
            Controllers\ClientController::class,
            'student'
          ),
          'POST' => new ControllerAction(
            Controllers\ClientController::class,
            'studentSubmit'
          ),
        ],
        '/client/clients' => [
          'GET' => new ControllerAction(
            Controllers\ClientController::class,
            'clients'
          ),
        ],
        '/client/clients/<clientIdString>' => [
          'GET' => new ControllerAction(
            Controllers\ClientController::class,
            'client'
          ),
          'POST' => new ControllerAction(
            Controllers\ClientController::class,
            'clientSubmit'
          ),
        ],
        '/client/buyers/<encodedBuyerId>' => [
          'GET' => new ControllerAction(
            Controllers\ClientController::class,
            'buyer'
          ),
          'POST' => new ControllerAction(
            Controllers\ClientController::class,
            'buyerSubmit'
          ),
        ],
        '/client/invoices/<invoiceNumber>' => [
          'GET' => new ControllerAction(
            Controllers\ClientController::class,
            'invoice'
          ),
        ],
        '/client/lessons' => [
          'GET' => new ControllerAction(
            Controllers\ClientController::class,
            'lessons'
          ),
        ],
        '/wise-deposit' => [
          'POST' => new ControllerAction(
            Controllers\SiteController::class,
            'wiseDeposit'
          ),
        ],
        '/auth/callback' => [
          'GET' => new ControllerAction(
            Controllers\AuthController::class,
            'callback'
          ),
        ],
        '/auth/login' => [
          'GET' => new ControllerAction(
            Controllers\AuthController::class,
            'login'
          ),
        ],
      ],
      pageNotFound: new ControllerAction(
        Controllers\SiteController::class,
        'pageNotFound'
      ),
    );
  }
}

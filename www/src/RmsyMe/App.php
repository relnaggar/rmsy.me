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
    $base = [
      Decorators\ExtendedTitleDecorator::class,
      Decorators\NavDecorator::class,
    ];
    $withSidebar = [...$base, Decorators\SidebarDecorator::class];
    $withMedia = [...$base, Decorators\MediaRootDecorator::class];
    $withBoth = [...$withMedia, Decorators\SidebarDecorator::class];

    return [
      // Public pages
      Controllers\SiteController::class => $withMedia,
      Controllers\ContactController::class => $base,
      Controllers\ProjectsController::class => $withBoth,
      Controllers\LoginController::class => $base,

      // Portal pages
      Controllers\PortalController::class => $withSidebar,
      Controllers\PaymentsController::class => $withSidebar,
      Controllers\BuyersController::class => $withSidebar,
      Controllers\StudentsController::class => $withSidebar,
      Controllers\ClientsController::class => $withSidebar,
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
        '/portal/login' => [
          'GET' => new ControllerAction(
            Controllers\LoginController::class,
            'login'
          ),
          'POST' => new ControllerAction(
            Controllers\LoginController::class,
            'loginSubmit'
          ),
        ],
        '/portal/logout' => [
          'GET' => new ControllerAction(
            Controllers\LoginController::class,
            'logout'
          ),
        ],
        '/portal/' => [
          'GET' => new ControllerAction(
            Controllers\PortalController::class,
            'index'
          ),
        ],
        '/portal/payments' => [
          'GET' => new ControllerAction(
            Controllers\PaymentsController::class,
            'payments'
          ),
          'POST' => new ControllerAction(
            Controllers\PaymentsController::class,
            'paymentsSubmit'
          ),
        ],
        '/portal/buyers' => [
          'GET' => new ControllerAction(
            Controllers\BuyersController::class,
            'index'
          ),
        ],
        '/portal/students' => [
          'GET' => new ControllerAction(
            Controllers\StudentsController::class,
            'index'
          ),
        ],
        '/portal/students/<idString>' => [
          'GET' => new ControllerAction(
            Controllers\StudentsController::class,
            'edit'
          ),
          'POST' => new ControllerAction(
            Controllers\StudentsController::class,
            'editSubmit'
          ),
        ],
        '/portal/clients' => [
          'GET' => new ControllerAction(
            Controllers\ClientsController::class,
            'index'
          ),
        ],
        '/portal/clients/<idString>' => [
          'GET' => new ControllerAction(
            Controllers\ClientsController::class,
            'edit'
          ),
          'POST' => new ControllerAction(
            Controllers\ClientsController::class,
            'editSubmit'
          ),
        ],
        '/portal/buyers/<idString>' => [
          'GET' => new ControllerAction(
            Controllers\BuyersController::class,
            'edit'
          ),
          'POST' => new ControllerAction(
            Controllers\BuyersController::class,
            'editSubmit'
          ),
        ],
        '/portal/invoices/<invoiceNumber>' => [
          'GET' => new ControllerAction(
            Controllers\PaymentsController::class,
            'invoice'
          ),
        ],
        '/portal/lessons' => [
          'GET' => new ControllerAction(
            Controllers\PaymentsController::class,
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
            Controllers\MicrosoftAuthController::class,
            'callback'
          ),
        ],
        '/auth/login' => [
          'GET' => new ControllerAction(
            Controllers\MicrosoftAuthController::class,
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

<?php declare(strict_types=1);
class Routes implements \Framework\RoutesInterface {
  /* @var \Controllers\Menu */
  private $menuController;

  /* @var \Controllers\Sidebar */
  private $sidebarController;
  
  /* @var \Controllers\Front */
  private $frontController;

  /* @var \Controllers\Engineer */
  private $engineerController;

  /* @var \Controllers\Website*/
  private $websiteController;

  /* @var \Controller */
  private $controller;

  public function __construct() {
    $this->menuController = new \Controllers\Menu();
    $this->sidebarController = new \Controllers\Sidebar();
    $this->frontController = new \Controllers\Front();
    $this->engineerController= new \Controllers\Engineer($this->menuController, $this->sidebarController);
    $this->websiteController = new \Controllers\Website($this->menuController, $this->sidebarController);
  }

  public function getRoutes(): array {
    return [
      '/' => [
        'GET' => [
          'controller' => $this->frontController,
          'functionName' => 'home'
        ]
      ],
      '/engineer/' => [
        'GET' => [
          'controller' => $this->engineerController,
          'functionName' => 'home'
        ]
      ],
      '/engineer/about' => [
        'GET' => [
          'controller' => $this->engineerController,
          'functionName' => 'about'
        ]
      ],
      '/engineer/contact' => [
        'GET' => [
          'controller' => $this->engineerController,
          'functionName' => 'contact'
        ],
        'POST' => [
          'controller' => $this->engineerController,
          'functionName' => 'contact'
        ]
      ],
      '/engineer/website/' => [
        'GET' => [
          'controller' => $this->websiteController,
          'functionName' => 'introduction'
        ]
      ],
      '/engineer/website/aws' => [
        'GET' => [
          'controller' => $this->websiteController,
          'functionName' => 'aws'
        ]
      ],
      '/engineer/website/docker' => [
        'GET' => [
          'controller' => $this->websiteController,
          'functionName' => 'docker'
        ]
      ],
      '/engineer/website/apache' => [
        'GET' => [
          'controller' => $this->websiteController,
          'functionName' => 'apache'
        ]
      ],
      '/engineer/website/bash' => [
        'GET' => [
          'controller' => $this->websiteController,
          'functionName' => 'bash'
        ]
      ],
      '/engineer/website/ssl' => [
        'GET' => [
          'controller' => $this->websiteController,
          'functionName' => 'ssl'
        ]
      ],
      '/engineer/website/postgres' => [
        'GET' => [
          'controller' => $this->websiteController,
          'functionName' => 'postgres'
        ]
      ],
      '/engineer/website/phpunit' => [
        'GET' => [
          'controller' => $this->websiteController,
          'functionName' => 'phpunit'
        ]
      ],
      '/engineer/website/selenium' => [
        'GET' => [
          'controller' => $this->websiteController,
          'functionName' => 'selenium'
        ]
      ],
      '/engineer/website/cucumber' => [
        'GET' => [
          'controller' => $this->websiteController,
          'functionName' => 'cucumber'
        ]
      ],
      '/engineer/website/bootstrap' => [
        'GET' => [
          'controller' => $this->websiteController,
          'functionName' => 'bootstrap'
        ]
      ],
      '/engineer/website/php' => [
        'GET' => [
          'controller' => $this->websiteController,
          'functionName' => 'php'
        ]
      ],
      '/engineer/website/form' => [
        'GET' => [
          'controller' => $this->websiteController,
          'functionName' => 'form'
        ]
      ]
    ];
  }

  public function getDefaultRoute(): array {
    http_response_code(404);
    return [
      'controller' => $this->engineerController,
      'functionName' => 'pageNotFound'
    ];
  }
}

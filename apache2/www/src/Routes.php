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
          'functionName' => 'intro'
        ]
      ],
      '/engineer/website/aws' => [
        'GET' => [
          'controller' => $this->websiteController,
          'functionName' => 'aws'
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

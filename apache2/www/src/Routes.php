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

  /* @var \Controllers\Project1 */
  private $project1Controller;

  /* @var \Controller */
  private $controller;

  public function __construct() {
    $this->menuController = new \Controllers\Menu();
    $this->sidebarController = new \Controllers\Sidebar();
    $this->frontController = new \Controllers\Front();
    $this->engineerController= new \Controllers\Engineer($this->menuController, $this->sidebarController);
    $this->project1Controller = new \Controllers\Project1($this->menuController, $this->sidebarController);
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
        'GET'  => [
          'controller' => $this->engineerController,
          'functionName' => 'home'
        ]
      ],
      '/engineer/project1/' => [
        'GET' => [
          'controller' => $this->project1Controller,
          'functionName' => 'intro'
        ]
      ],
      '/engineer/project1/feature1' => [
        'GET' => [
          'controller' => $this->project1Controller,
          'functionName' => 'feature1'
        ]
      ],
      '/engineer/project1/feature2' => [
        'GET' => [
          'controller' => $this->project1Controller,
          'functionName' => 'feature2'
        ]
      ]
    ];
  }
}

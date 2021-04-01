<?php declare(strict_types=1);

class Routes {
  /* @var \MenuController */
  private $menuController;

  /* @var \SidebarController */
  private $sidebarController;

  /* @var \Controller */
  private $controller;

  public function __construct() {
    $this->menuController = new \MenuController();
    $this->sidebarController = new \SidebarController();
    $this->frontController = new \FrontController();
    $this->engineerController= new \EngineerController($this->menuController, $this->sidebarController);
    $this->project1Controller = new \Project1Controller($this->menuController, $this->sidebarController);
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

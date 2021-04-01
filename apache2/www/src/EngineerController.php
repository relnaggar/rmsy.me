<?php declare(strict_types=1);

class EngineerController {
  /* @var string */
  private $templateDir;

  /* @var \MenuController */
  private $menu;

  /* @var \SidebarController */
  private $sidebar;

  public function __construct(\MenuController $menuController, \SidebarController $sidebarController) {
    $this->templateDir = '/engineer/';
    $this->menu = $menuController->engineer();
    $this->sidebar = $sidebarController->project1();
  }

  public function home(): array {
    return [
      'title' => 'Home',
      'menu' => $this->menu,
      'html' => loadTemplate($this->templateDir . __FUNCTION__)
    ];
  }
}

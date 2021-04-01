<?php declare(strict_types=1);
namespace Controllers;
class Engineer {
  /* @var string */
  private $templateDir;

  /* @var \Controllers\Menu */
  private $menu;

  public function __construct(\Controllers\Menu $menuController, \Controllers\Sidebar $sidebarController) {
    $this->templateDir = '/engineer/';
    $this->menu = $menuController->engineer();
  }

  public function home(): array {
    $title = 'Home';
    $this->menu['activeItemText'] = $title;
    return [
      'title' => $title,
      'menu' => $this->menu,
      'html' => loadTemplate($this->templateDir . __FUNCTION__)
    ];
  }
}

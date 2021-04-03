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

  private function basic($function_name) {
    $title = mb_convert_case($function_name, MB_CASE_TITLE, 'UTF-8');
    $this->menu['activeItemText'] = $title;
    return [
      'title' => $title,
      'menu' => $this->menu,
      'html' => loadTemplate($this->templateDir . $function_name)
    ];
  
  }

  public function home(): array {
    return $this->basic(__FUNCTION__);
  }

  public function about(): array {
    return $this->basic(__FUNCTION__);
  }

  public function contact(): array {
    return $this->basic(__FUNCTION__);
  }
}

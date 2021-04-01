<?php declare(strict_types=1);

class Project1Controller {
  /* @var string */
  private $templateDir;

  /* @var \MenuController */
  private $menu;

  /* @var \SidebarController */
  private $sidebar;

  public function __construct(\MenuController $menuController, \SidebarController $sidebarController) {
    $this->templateDir = '/project1/';
    $this->menu = $menuController->engineer();
    $this->sidebar = $sidebarController->project1();
  }

  public function intro(): array {
    $this->sidebar->setI(0);
    return [
      'title' => 'Introduction',
      'menu' => $this->menu,
      'sidebar' => $this->sidebar,
      'html' => loadTemplate($this->templateDir . __FUNCTION__)
    ];
  }

  public function feature1(): array {
    $sections = [
      [
        'title' => 'Section 1',
        'id' => 'section-1',
        'html' => loadTemplate($this->templateDir . __FUNCTION__)
      ]
    ];

    $this->sidebar->setI(1);
    return [
      'title' => 'Feature 1',
      'menu' => $this->menu,
      'sidebar' => $this->sidebar,
      'sections' => $sections
    ];
  }

  public function feature2(): array {
    $sections = [
      [
        'title' => 'Section 1',
        'id' => 'section-1',
        'html' => loadTemplate($this->templateDir . __FUNCTION__)
      ]
    ];

    $this->sidebar->setI(2);
    return [
      'title' => 'Feature 2',
      'menu' => $this->menu,
      'sidebar' => $this->sidebar,
      'sections' => $sections
    ];
  }
}

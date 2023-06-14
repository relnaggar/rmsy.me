<?php declare(strict_types=1);
namespace Controllers;

abstract class Segment {
  /* @var string */
  protected $templateDir;

  /* @var array */
  protected $menu;

  /* @var \Sidebar */
  protected $sidebar;

  protected function __construct(string $templateDir, array $menu, \Sidebar $sidebar=NULL) {
    $this->templateDir = $templateDir;
    $this->menu = $menu;
    $this->sidebar = $sidebar;
  }

  protected function getTitle(string $function_name): string {
    $words = preg_split('/(?=[A-Z])/', $function_name);
    $words[0] = ucfirst($words[0]);
    $title = implode(' ', $words);
    return $title;
  }

  protected function basic(string $function_name, array $meta=[], array $vars=[]): array {
    if (!isset($meta['title'])) {
      $meta['title'] = $this->getTitle($function_name);
    }
    if (!isset($this->menu['activeItemText'])) {
      $this->menu['activeItemText'] = $meta['title'];
    }
    
    $page = [
      'meta' => $meta,
      'menu' => $this->menu,
      'html' => loadTemplate($this->templateDir . $function_name, $vars)
    ];
    if (isset($this->sidebar)) {
      $this->sidebar->setActiveItemText($meta['title']);
      $page['sidebar'] = $this->sidebar;
    }
    return $page;
  }
}

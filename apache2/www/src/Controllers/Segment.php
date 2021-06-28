<?php declare(strict_types=1);
namespace Controllers;

abstract class Segment {
  /* @var string */
  protected $templateDir;

  /* @var array */
  protected $menu;

  protected function __construct(string $templateDir, array $menu) {
    $this->templateDir = $templateDir;
    $this->menu = $menu;
  }

  protected function getTitle(string $function_name): string {
    $words = preg_split('/(?=[A-Z])/', $function_name);
    $words[0] = ucfirst($words[0]);
    $title = implode(' ', $words);
    return $title;
  }

  protected function basic(string $function_name, array $vars=[]): array {
    $title = $this->getTitle($function_name);
    $this->menu['activeItemText'] = $title;
    return [
      'title' => $title,
      'menu' => $this->menu,
      'html' => loadTemplate($this->templateDir . $function_name, $vars)
    ];
  }
}

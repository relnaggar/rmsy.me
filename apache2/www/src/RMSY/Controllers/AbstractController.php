<?php declare(strict_types=1);
namespace RMSY\Controllers;

use Framework\TemplateEngine;
use RMSY\Data\Sidebar;

abstract class AbstractController {
  /* @var TemplateEngine */
  private $templateEngine;

  /* @var string */
  protected $templateDir;

  /* @var array */
  protected $menu;

  /* @var \Sidebar */
  protected $sidebar;

  protected function __construct(TemplateEngine $templateEngine, string $templateDir, array $menu, Sidebar $sidebar=NULL) {
    $this->templateEngine = $templateEngine;
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

  private function addSectionTemplates(array $sections, string $function_name, array $vars): array {
    foreach ($sections as &$section) {
      $section['html'] = $this->templateEngine->loadTemplate($this->templateDir . $function_name . '/' . $section['id'], $vars);
    }
    return $sections;
  }

  protected function basic(string $function_name, array $meta=[], array $vars=[], array $sections=NULL): array {
    if (!isset($meta['title'])) {
      $meta['title'] = $this->getTitle($function_name);
    }
    if (!isset($this->menu['activeItemText'])) {
      $this->menu['activeItemText'] = $meta['title'];
    }
    $page = [
      'meta' => $meta,
      'menu' => $this->menu
    ];
    if (isset($sections)) {
      $page['sections'] = $this->addSectionTemplates($sections, $function_name, $vars);
    } else {
      $page['html'] = $this->templateEngine->loadTemplate($this->templateDir . $function_name, $vars);
    }
    if (isset($this->sidebar)) {
      $this->sidebar->setActiveItemText($meta['title']);
      $page['sidebar'] = $this->sidebar;
    }
    return $page;
  }
}

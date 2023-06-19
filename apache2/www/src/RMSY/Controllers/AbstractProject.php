<?php declare(strict_types=1);
namespace RMSY\Controllers;

use Framework\TemplateEngine;
use RMSY\Data\Sidebar;

abstract class AbstractProject extends AbstractController {

  /* @var array */
  protected $project;

  protected function __construct(TemplateEngine $templateEngine, string $templateDir, array $menu, array $project) {
    parent::__construct($templateEngine=$templateEngine, $templateDir=$templateDir, $menu=$menu, $sidebar=$this->getSidebar($project));
    $this->project = $project;
    $this->menu['activeItemText'] = 'Projects';
  }

  private function getSidebar(array $project): ?Sidebar {
    if (!isset($project['pages'])) {
      return NULL;
    }

    $items = [
      [
        'text' => 'Introduction',
        'path' => $project['path']
      ]
    ];
    foreach ($project['pages'] as $page) {
      $items[] = [
        'text' => $page['title'],
        'path' => $page['path']
      ];
    }
    return new Sidebar($title=$project['title'], $items=$items);
  }

  protected function basic(string $function_name, array $meta=[], array $vars=[], array $sections=NULL): array {
    if (isset($this->project['pages']) && isset($this->project['pages'][$function_name])) {
      $meta['title'] = $this->project['pages'][$function_name]['title'];
    }
    if (!isset($meta['description'])) {
      $meta['description'] = $this->project['description'];
    }
    return parent::basic($function_name, $meta, $vars, $sections);
  }
}
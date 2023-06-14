<?php declare(strict_types=1);
namespace Controllers;

abstract class Project extends Segment {
  public function __construct(string $templateDir, array $menu, array $project) {
    parent::__construct($templateDir=$templateDir, $menu=$menu, $sidebar=$this->getSidebar($project));
    $this->menu['activeItemText'] = 'Projects';
  }

  private function getSidebar(array $project): ?\Sidebar {
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
    return new \Sidebar($title=$project['title'], $items=$items);
  }
  
}
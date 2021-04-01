<?php declare(strict_types=1);

class SidebarController {
  public function project1(): \Sidebar {
    return new \Sidebar(
      $title = 'Project 1',
      $items = [
        [
          'text' => 'Introduction',
          'path' => '/engineer/project1/'
        ], [
          'text' => 'Feature 1',
          'path' => '/engineer/project1/feature1'
        ], [
          'text' => 'Feature 2',
          'path' => '/engineer/project1/feature2'
        ]
      ]
    );
  }
}

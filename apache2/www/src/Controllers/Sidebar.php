<?php declare(strict_types=1);
namespace Controllers;
class Sidebar {
  public function website(): \Sidebar {
    $homePath = '/engineer/' . __FUNCTION__ . '/';
    return new \Sidebar(
      $title = 'Personal Website',
      $items = [
        [
          'text' => 'Introduction',
          'path' => $homePath
        ], [
          'text' => 'Feature 1',
          'path' => $homePath . 'feature1'
        ], [
          'text' => 'Feature 2',
          'path' => $homePath . 'feature2'
        ]
      ]
    );
  }
}

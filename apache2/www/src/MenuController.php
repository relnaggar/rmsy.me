<?php declare(strict_types=1);

class MenuController {
  public function engineer(): array {
    return [
      'title' => 'software engineer',
      'homePath' => '/engineer/',
      'items' => [
        [
          'text' => 'Home',
          'path' => '/engineer/'
        ], [
          'text' => 'Project 1',
          'path' => '/engineer/project1/'
        ], [
          'text' => 'Project 2',
          'path' => '/engineer/project2/'
        ]
      ]
    ];
  }
}

<?php declare(strict_types=1);
namespace Controllers;
class Menu {
  public function engineer(): array {
    $homePath = '/engineer/';
    return [
      'title' => 'software engineer',
      'homePath' => $homePath,
      'items' => [
        [
          'text' => 'Home',
          'path' => $homePath
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

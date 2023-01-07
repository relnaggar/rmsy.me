<?php declare(strict_types=1);
namespace Controllers;
class Menu {
  public function engineer(): array {
    $homePath = '/' . __FUNCTION__ . '/';
    return [
      'title' => 'software engineer',
      'homePath' => $homePath,
      'items' => [
        [
          'text' => 'Home',
          'path' => $homePath
        ], [
          'text' => 'About',
          'path' => $homePath . 'about'
        ], [
          'text' => 'Projects',
          'id' => 'projects',
          'dropdown' => [
            [
              'text' => 'Personal Website',
              'path' => $homePath . 'website/'
            ]
          ]
        ], [
          'text' => 'Resume',
          'path' => $homePath . 'resume',
          'target' => '_blank'
        ], [
          'text' => 'Linkedin',
          'path' => '/linkedin',
          'target' => '_blank'
        ], [
          'text' => 'Contact',
          'path' => $homePath . 'contact'
        ]
      ]
    ];
  }
}

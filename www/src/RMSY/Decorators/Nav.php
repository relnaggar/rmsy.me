<?php declare(strict_types=1);
namespace RMSY\Decorators;

class Nav implements \Framework\DecoratorInterface {
  public function get_new_template_vars(array $templateVars): array {
    $newTemplateVars['nav'] = [
      'homePath' => '/',
      'title' => 'software engineer',
      'items' => [
        [
          'text' => 'Home',
          'path' => '/'
        ], [
          'text' => 'About',
          'path' => '/about'
        ], [
          'text' => 'Projects',
          'path' => '/projects'
        ], [
          'text' => 'Linkedin',
          'path' => '/linkedin',
          'target' => '_blank',
          'rel' => 'noopener noreferrer',
        ], [
          'text' => 'GitHub',
          'path' => '/github',
          'target' => '_blank',
          'rel' => 'noopener noreferrer',
        ], [
          'text' => 'Contact',
          'path' => '/contact',
        ],        
      ],
      'activeItemText' => $templateVars['title'] ?? ''
    ];
    return $newTemplateVars;
  }
}

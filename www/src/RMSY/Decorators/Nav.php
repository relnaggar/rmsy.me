<?php declare(strict_types=1);
namespace RMSY\Decorators;

class Nav implements \Framework\DecoratorInterface {
  public function get_new_template_vars(array $templateVars): array {
    $newTemplateVars['nav'] = [
      'homePath' => '/',
      'title' => 'software engineer',
      'items' => [
        ['text' => 'Home', 'path' => '/'],
        ['text' => 'About', 'path' => '/about'],
        ['text' => 'Contact', 'path' => '/contact']
      ],
      'activeItemText' => $templateVars['title'] ?? ''
    ];
    return $newTemplateVars;
  }
}

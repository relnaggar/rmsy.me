<?php declare(strict_types=1);
namespace RMSY\Services;

class Menu {
  public function get_template_vars(string $activeItemText): array {
    return [
      'homePath' => '/',
      'title' => 'software engineer',
      'items' => [
        ['text' => 'Home', 'path' => '/'],
        ['text' => 'About', 'path' => '/about'],
        ['text' => 'Contact', 'path' => '/contact']
      ],
      'activeItemText' => $activeItemText
    ];
  }
}

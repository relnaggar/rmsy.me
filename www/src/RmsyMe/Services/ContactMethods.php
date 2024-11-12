<?php

declare(strict_types=1);

namespace RmsyMe\Services;

use Framework\Routing\RouterInterface;

class ContactMethods
{
  private RouterInterface $router;
  private array $contactMethods;

  public function __construct(RouterInterface $router)
  {
    $this->router = $router;
    $this->contactMethods = [];
    $this->addContactMethod([
      'title' => 'Email',
      'icon' => 'envelope',
      'href' => 'mailto:ramsey.el-naggar@outlook.com',
      'external' => true,
      'html' => <<<HTML
        ramsey.el&#8209;naggar@outlook.com
      HTML,
      'inNav' => false,
    ]);
    $this->addContactMethod([
      'title' => 'GitHub',
      'icon' => 'github',
      'href' => '/github',
      'html' => 'rmsy.me/github',
      'external' => true,
      'inNav' => true,
      'inFooter' => true,
    ]);
    $this->addContactMethod([
      'title' => 'LinkedIn',
      'icon' => 'linkedin',
      'href' => '/linkedin',
      'html' => 'rmsy.me/linkedin',
      'external' => true,
      'inNav' => true,
      'inFooter' => true,
    ]);
  }

  private function addContactMethod(array $contactMethods): void
  {
    if (
      $this->router->hasPath($contactMethods['href'])
      || strpos($contactMethods['href'], "mailto:") === 0
    ) {
      $this->contactMethods[] = $contactMethods;
    }
  }

  public function getContactMethods(): array
  {
    return $this->contactMethods;
  }
}

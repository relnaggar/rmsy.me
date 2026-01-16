<?php

declare(strict_types=1);

namespace RmsyMe\Services;

use Relnaggar\Veloz\Routing\RouterInterface;

class ContactMethodsService
{
  private RouterInterface $router;
  private array $contactMethods;

  public function __construct(RouterInterface $router)
  {
    $this->router = $router;
    $this->contactMethods = [];
    $this->addContactMethod([
      'title' => 'Free meeting',
      'icon' => 'calendar3',
      'href' => '/free-meeting',
      'html' => 'rmsy.me/free-meeting',
      'external' => true,
      'inMenu' => false,
      'inFooter' => true,
      'cta' => true,
    ]);
    $this->addContactMethod([
      'title' => 'Email',
      'icon' => 'envelope',
      'href' => 'mailto:ramsey.el-naggar@outlook.com',
      'external' => true,
      'html' => <<<HTML
        ramsey.el&#8209;naggar@outlook.com
      HTML,
      'inMenu' => false,
      'inFooter' => false,
    ]);
    $this->addContactMethod([
      'title' => 'GitHub',
      'icon' => 'github',
      'href' => '/github',
      'html' => 'rmsy.me/github',
      'external' => true,
      'inMenu' => true,
      'inFooter' => true,
    ]);
    $this->addContactMethod([
      'title' => 'LinkedIn',
      'icon' => 'linkedin',
      'href' => '/linkedin',
      'html' => 'rmsy.me/linkedin',
      'external' => true,
      'inMenu' => true,
      'inFooter' => true,
    ]);
  }

  private function addContactMethod(array $contactMethods): void
  {
    // only add the contact method if it matches a route or is a mailto link
    if (
      $this->router->hasPath($contactMethods['href'])
      || strpos($contactMethods['href'], 'mailto:') === 0
    ) {
      $this->contactMethods[] = $contactMethods;
    }
  }

  public function getContactMethods(): array
  {
    return $this->contactMethods;
  }
}

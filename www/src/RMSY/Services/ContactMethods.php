<?php declare(strict_types=1);
namespace RMSY\Services;

class ContactMethods extends \Framework\Services\AbstractService {
  public function getData(): array {
    return [
      [
        'title' => 'Email',
        'icon' => 'envelope',
        'href' => 'mailto:ramsey.el-naggar@outlook.com',
        'external' => true,
        'html' => <<<HTML
          ramsey.el&#8209;naggar@outlook.com
        HTML,
        'inNav' => false,
      ], [
        'title' => 'GitHub',
        'icon' => 'github',
        'href' => '/github',
        'html' => 'rmsy.me/github',
        'external' => true,
        'inNav' => true,
        'inFooter' => true,
      ], [
        'title' => 'LinkedIn',
        'icon' => 'linkedin',
        'href' => '/linkedin',
        'html' => 'rmsy.me/linkedin',
        'external' => true,
        'inNav' => true,
        'inFooter' => true,
      ],
    ];
  }
}

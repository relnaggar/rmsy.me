<?php declare(strict_types=1);
namespace RmsyMe\Services;

use Framework\Routing\RouterInterface;

class ContactMethods {
  private RouterInterface $router;
  private array $data;

  public function __construct(RouterInterface $router) {
    $this->router = $router;
    $this->data = [];
    $this->initialiseData();
  }

  private function initialiseData(): void {
    $this->addData([
      'title' => 'Email',
      'icon' => 'envelope',
      'href' => 'mailto:ramsey.el-naggar@outlook.com',
      'external' => true,
      'html' => <<<HTML
        ramsey.el&#8209;naggar@outlook.com
      HTML,
      'inNav' => false,
    ]);
    $this->addData([
      'title' => 'GitHub',
      'icon' => 'github',
      'href' => '/github',
      'html' => 'rmsy.me/github',
      'external' => true,
      'inNav' => true,
      'inFooter' => true,
    ]);
    $this->addData([
      'title' => 'LinkedIn',
      'icon' => 'linkedin',
      'href' => '/linkedin',
      'html' => 'rmsy.me/linkedin',
      'external' => true,
      'inNav' => true,
      'inFooter' => true,
    ]);
  }

  private function addData(array $data): void {
    if (
      $this->router->hasPath($data['href'])
      || strpos($data['href'], "mailto:") === 0
    ) {
      $this->data[] = $data;
    }
  }

  public function getData(): array {
    return $this->data;
  }
}

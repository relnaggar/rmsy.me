<?php declare(strict_types=1);
namespace Controllers;
class Engineer {
  /* @var string */
  private $templateDir;

  /* @var \Controllers\Menu */
  private $menu;

  public function __construct(\Controllers\Menu $menuController, \Controllers\Sidebar $sidebarController) {
    $this->templateDir = '/engineer/';
    $this->menu = $menuController->engineer();
  }

  private function getTitle(string $function_name): string {
    $words = preg_split('/(?=[A-Z])/', $function_name);
    $words[0] = ucfirst($words[0]);
    $title = implode(' ', $words);
    return $title;
  }

  private function basic(string $function_name, array $vars=[]): array {
    $title = $this->getTitle($function_name);
    $this->menu['activeItemText'] = $title;
    return [
      'title' => $title,
      'menu' => $this->menu,
      'html' => loadTemplate($this->templateDir . $function_name, $vars)
    ];
  }

  private function recaptcha(): array {
    $recaptcha['nonce'] = base64_encode(random_bytes(18)); // number of bytes must be a multiple of 3 greater than 16
    if (isset($GLOBALS['PRODUCTION'])) {
      $recaptcha['sitekey'] = '***REMOVED***';
    } else {
      $recaptcha['sitekey'] = '***REMOVED***';
    }
    header("Content-Security-Policy: TO_BE_REPLACED; script-src 'self' 'nonce-" . $recaptcha['nonce'] . "'; frame-src https://www.google.com/recaptcha/, https://recaptcha.google.com/recaptcha/");
    return $recaptcha;
  }

  public function home(): array {
    return $this->basic(__FUNCTION__);
  }

  public function about(): array {
    return $this->basic(__FUNCTION__);
  }

  public function contact(): array {
    return $this->basic(__FUNCTION__, [
        'recaptcha' => $this->recaptcha(),
    ]);
  }

  public function pageNotFound(): array {
    return $this->basic(__FUNCTION__);
  }
}

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

  private function getRecaptchaDetails(): array {
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

  private function sendPostRequest(string $url, array $data) {
    $options = [
      'http' => [
        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
        'method'  => 'POST',
        'content' => http_build_query($data)
      ],
      'ssl' => [
        'cafile' => '../cacert.cer',
      ]
    ];
    return file_get_contents($url, false, stream_context_create($options));
  }

  private function validateRecaptcha() {
    $url = 'https://www.google.com/recaptcha/api/siteverify';
    $data = [
      'response' => $_POST['g-recaptcha-response']
    ];
    if (isset($GLOBALS['PRODUCTION'])) {
      $data['secret'] = '***REMOVED***';
    } else {                                                     
      $data['secret'] = '***REMOVED***';
    }
    return $this->sendPostRequest($url, $data);
  }

  public function contact(): array {
    $message['sent'] = false;
    if (isset($_POST['submit'])) {
      $result_string = $this->validateRecaptcha();
      if ($result_string) {
        $result = json_decode($result_string, true);
        if ($result['success']) {
          $message['sent'] = true;
        } else if (count($result['error-codes']) === 1 && $result['error-codes'][0] === 'timeout-or-duplicate') {
          $message['error-code'] = 'timeout-or-duplicate';
        } else {
          $message['error-code'] = 'internal';
        }
      } else {
        $message['error-code'] = 'internal';
      }
    }
    if (!$message['sent']) {
      $vars['recaptcha'] = $this->getRecaptchaDetails();
    }
    $vars['message'] = $message;
    return $this->basic(__FUNCTION__, $vars);
  }

  public function pageNotFound(): array {
    return $this->basic(__FUNCTION__);
  }
}

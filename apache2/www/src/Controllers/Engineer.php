<?php declare(strict_types=1);
namespace Controllers;

use \PHPMailer\PHPMailer\PHPMailer;
use \PHPMailer\PHPMailer\Exception;
use \PHPMailer\PHPMailer\SMTP;

class Engineer extends Segment {
  public function __construct(\Controllers\Menu $menuController, \Controllers\Sidebar $sidebarController) {
    parent::__construct($templateDir='/engineer/', $menu=$menuController->engineer());
  }

  public function pageNotFound(): array {
    return $this->basic(__FUNCTION__);
  }

  public function home(): array {
    return $this->basic(__FUNCTION__);
  }

  public function about(): array {
    return $this->basic(__FUNCTION__);
  }

  private function getRecaptchaDetails(): array {
    $recaptcha = [
      'nonce' => base64_encode(random_bytes(18)), // number of bytes must be a multiple of 3 greater than 16
      'sitekey' => rtrim(file_get_contents('/run/secrets/RECAPTCHA_SITE_KEY'))
    ];
    header("Content-Security-Policy: TO_BE_REPLACED; script-src 'self' https://platform.linkedin.com/badges/js/profile.js https://badges.linkedin.com/ 'nonce-" . $recaptcha['nonce'] . "'; frame-src https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/");
    return $recaptcha;
  }

  private function sendPostRequest(string $url, array $data) {
    $options = [
      'http' => [
        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
        'method'  => 'POST',
        'content' => http_build_query($data)
      ]
    ];
    return file_get_contents($url, false, stream_context_create($options));
  }

  private function validateRecaptcha() {
    $url = 'https://www.google.com/recaptcha/api/siteverify';
    $data = [
      'response' => $_POST['g-recaptcha-response'],
      'secret' => rtrim(file_get_contents('/run/secrets/RECAPTCHA_SECRET_KEY'))
    ];
    return $this->sendPostRequest($url, $data);
  }

  private function sendEmail(string $fromEmail, string $fromName, string $toEmail, string $toName, string $ccEmail, string $ccName, string $subject, string $htmlBody): bool {
    $mail = new PHPMailer(true);
    $mail->Debugoutput = 'error_log';
    try {
      // Server settings
      $mail->SMTPDebug = SMTP::DEBUG_SERVER;
      $mail->isSMTP();
      $mail->Host = rtrim(file_get_contents('/run/secrets/SMTP_HOST'));
      $mail->SMTPAuth = true;
      $mail->Username = rtrim(file_get_contents('/run/secrets/SMTP_USERNAME'));
      $mail->Password = rtrim(file_get_contents('/run/secrets/SMTP_PASSWORD'));
      $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
      $mail->Port = 465;

      // Recipients
      $mail->setFrom($fromEmail, $fromName);
      $mail->addAddress($toEmail, $toName);
      $mail->addCC($ccEmail, $ccName);

      // Content
      $mail->isHTML(true);
      $mail->Subject = $subject;
      $mail->Body = $htmlBody;

      $mail->send();
      return true;
    } catch (Exception $e) {
      return false;
    }
  }

  public function contact(): array {
    $message['sent'] = false;
    if (isset($_POST['submit'])) {
      $result_string = $this->validateRecaptcha();
      if ($result_string) {
        $result = json_decode($result_string, true);
        if ($result['success']) {
          $message['sent'] = $this->sendEmail(
            'engineer@rmsy.me',
            'Ramsey El-Naggar',
            'engineer@rmsy.me',
            'Ramsey El-Naggar',
            $_POST['message']['email'],
            $_POST['message']['name'],
            'rmsy.me engineer contact form message',
            $_POST['message']['message']
          );
          if (!$message['sent']) {
            $message['error-code'] = 'PHPMailer';
          }
        } else if (count($result['error-codes']) === 1 && $result['error-codes'][0] === 'timeout-or-duplicate') {
          $message['error-code'] = 'timeout-or-duplicate';
        } else {
          $message['error-code'] = 'reCAPTCHA';
        }
      } else {
        $message['error-code'] = 'file_get_contents';
      }
    }
    if (!$message['sent']) {
      $vars['recaptcha'] = $this->getRecaptchaDetails();
    }
    $vars['message'] = $message;
    return $this->basic(__FUNCTION__, $vars);
  }
}

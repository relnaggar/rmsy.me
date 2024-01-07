<?php declare(strict_types=1);
namespace RMSY\Controllers;

use \PHPMailer\PHPMailer\PHPMailer;
use \PHPMailer\PHPMailer\Exception;
use \PHPMailer\PHPMailer\SMTP;

use Framework\TemplateEngine;

class Engineer extends AbstractController {
  /* @var array */
  private $projects;

  public function __construct(TemplateEngine $templateEngine, array $menu, array $projects) {
    parent::__construct($templateEngine=$templateEngine, $templateDir='/engineer/', $menu=$menu);
    $this->projects = $projects;
  }

  public function pageNotFound(): array {
    return $this->basic(__FUNCTION__);
  }

  public function home(): array {
    $description = "Hello there, I'm Ramsey -- not just your average software engineer, but a virtuoso conducting symphonies of syntax and semicolons.";
    return $this->basic(__FUNCTION__, $meta=['description' => $description], $vars=['projects' => $this->projects]);
  }

  public function about(): array {
    $description = "My specialty? Well, I dive into the depths of full-stack web application development.";
    return $this->basic(__FUNCTION__, $meta=['description' => $description]);
  }

  private function getRecaptchaDetails(): array {
    $recaptcha = [
      'nonce' => base64_encode(random_bytes(18)), // number of bytes must be a multiple of 3 greater than 16
      'sitekey' => rtrim(file_get_contents('/run/secrets/RECAPTCHA_SITE_KEY'))
    ];
    header("Content-Security-Policy: TO_BE_REPLACED; script-src 'self' 'nonce-" . $recaptcha['nonce'] . "'; frame-src https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/");
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
      $mail->SMTPAuth = true;
      $mail->Host = rtrim(file_get_contents('/run/secrets/SMTP_HOST'));      
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

  private function validatePostRequest(): bool {
    if (isset($_POST['submit']) &&
        isset($_POST['message']['name']) &&
        isset($_POST['message']['email']) &&
        isset($_POST['message']['message'])
      ) {
      return true;
    } else {
      return false;
    }
  }

  public function contact(): array {
    $description = "I'm always game to talk tech, tutoring, or even dung beetles!";
    $message['sent'] = false;
    if ($this->validatePostRequest()) {
      if (!filter_var($_POST['message']['email'], FILTER_VALIDATE_EMAIL)) {
        $message['error-code'] = 'email';
      } else if (strlen($_POST['message']['name']) > 255) {
        $message['error-code'] = 'name';
      } else if (strlen($_POST['message']['message']) > 65535) {
        $message['error-code'] = 'message';
      } else {
        $result_string = $this->validateRecaptcha();
        if ($result_string) {
          $result = json_decode($result_string, true);
          // uncomment these lines to simulate a reCAPTCHA failure
          // $result['success'] = false; 
          // $result['error-codes'] = ['timeout-or-duplicate'];
          if ($result['success']) {
            $message['sent'] = $this->sendEmail(
              'contactform@rmsy.me',
              $_POST['message']['name'],
              'ramsey.el-naggar@outlook.com',
              'Ramsey El-Naggar',
              $_POST['message']['email'],
              $_POST['message']['name'],
              'rmsy.me engineer contact form message',
              nl2br($_POST['message']['message'], false)
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
    }
    if (!$message['sent']) {
      $vars['recaptcha'] = $this->getRecaptchaDetails();
    }
    $vars['message'] = $message;
    return $this->basic(__FUNCTION__, $meta=['description' => $description], $vars);
  }
}

<?php declare(strict_types=1);
namespace RMSY\Services;

use PHPMailer\PHPMailer\PHPMailer;

class Mailer implements \Framework\ServiceInterface {
  public function sendEmail(
    string $fromEmail,
    string $fromName,
    string $toEmail,
    string $toName,
    string $ccEmail,
    string $ccName,
    string $subject,
    string $htmlBody
  ): bool {
    $phpMailer = new PHPMailer(true);
    return false;
  }
}

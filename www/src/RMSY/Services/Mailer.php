<?php declare(strict_types=1);
namespace RMSY\Services;

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
    return false;
  }
}

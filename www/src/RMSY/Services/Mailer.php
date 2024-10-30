<?php declare(strict_types=1);
namespace RMSY\Services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

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
    // $phpMailer->Debugoutput = 'error_log';
    // try {
    //   // Server settings
    //   $phpMailer->SMTPDebug = SMTP::DEBUG_SERVER;
    //   $phpMailer->isSMTP();
    //   $phpMailer->SMTPAuth = true;
    //   $phpMailer->Host = rtrim(file_get_contents('/run/secrets/SMTP_HOST'));      
    //   $phpMailer->Username = rtrim(file_get_contents('/run/secrets/SMTP_USERNAME'));
    //   $phpMailer->Password = rtrim(file_get_contents('/run/secrets/SMTP_PASSWORD'));
    //   $phpMailer->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    //   $phpMailer->Port = 465;

    //   // Recipients
    //   $phpMailer->setFrom($fromEmail, $fromName);
    //   $phpMailer->addAddress($toEmail, $toName);
    //   $phpMailer->addCC($ccEmail, $ccName);

    //   // Content
    //   $phpMailer->isHTML(true);
    //   $phpMailer->Subject = $subject;
    //   $phpMailer->Body = $htmlBody;

    //   $phpMailer->send();
    //   return true;
    // } catch (Exception $e) {
    //   return false;
    // }
    return false;
  }
}

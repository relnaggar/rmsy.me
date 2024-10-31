<?php declare(strict_types=1);
namespace RMSY\Services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class Mailer implements \Framework\ServiceInterface {
  public function sendEmail(
    string $fromEmail,    
    string $toEmail,    
    string $subject,
    string $htmlBody,
    string $fromName="",
    string $toName="",
    string $replyToEmail="",
    string $replyToName=""    
  ): bool {
    return false; // currently disabled

    $phpMailer = new PHPMailer(true);
    $phpMailer->Debugoutput = 'error_log';
    try {
      // server settings
      $phpMailer->SMTPDebug = SMTP::DEBUG_SERVER;
      $phpMailer->isSMTP();
      $phpMailer->SMTPAuth = true;
      $phpMailer->Host = rtrim(file_get_contents('/run/secrets/SMTP_HOST'));      
      $phpMailer->Username = rtrim(file_get_contents('/run/secrets/SMTP_USERNAME'));
      $phpMailer->Password = rtrim(file_get_contents('/run/secrets/SMTP_PASSWORD'));
      $phpMailer->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
      $phpMailer->Port = 465;

      // recipients
      if ($fromName === "") {
        $phpMailer->setFrom($fromEmail);
      } else {
        $phpMailer->setFrom($fromEmail, $fromName);
      }      
      if ($toName === "") {
        $phpMailer->addAddress($toEmail);
      } else {
        $phpMailer->addAddress($toEmail, $toName);
      }
      if ($replyToEmail !== "") {
        if ($replyToName === "") {
          $phpMailer->addReplyTo($replyToEmail);
        } else {
          $phpMailer->addReplyTo($replyToEmail, $replyToName);
        }
      }

      // content
      $phpMailer->isHTML(true);
      $phpMailer->Subject = $subject;
      $phpMailer->Body = $htmlBody;

      $phpMailer->send();
      return true;
    } catch (Exception $e) {
      return false;
    }
  }
}

<?php declare(strict_types=1);
namespace RMSY\Controllers;

use Framework\Views\Page;
use RMSY\Data\ContactFormData;

class ContactForm extends \Framework\Controllers\AbstractController {
  private function getContactTemplateVars(): array {
    return [
      'title' => 'Contact',
      'metaDescription' => 'I\'m always game to talk tech, tutoring, or ' . 
        'even dung beetles!',
      'contactMethods' => [
        [
          'title' => 'Email',
          'icon' => 'envelope',
          'href' => 'mailto:ramsey.el-naggar@outlook.com',
          'html' => <<<HTML
            ramsey.el&#8209;naggar@outlook.com
          HTML,
        ], [
          'title' => 'LinkedIn',
          'icon' => 'linkedin',
          'href' => '/linkedin',
          'html' => 'rmsy.me/linkedin',
          'target' => '_blank',
          'rel' => 'noopener noreferrer',
        ], [
          'title' => 'GitHub',
          'icon' => 'github',
          'href' => '/github',
          'html' => 'rmsy.me/github',
          'target' => '_blank',
          'rel' => 'noopener noreferrer',
        ],
      ],
      'displayAlert' => false,
      'displayForm' => true,
    ];
  }

  public function contact(): Page {
    return $this->getPage(
      __FUNCTION__,
      $this->getContactTemplateVars()
    );
  }

  public function contactSubmit(): Page {
    // set template path and vars same as contact method
    $templatePath = 'contact';
    $templateVars = $this->getContactTemplateVars();

    // display error alert by default
    $templateVars['displayAlert'] = true;
    $templateVars['success'] = false;

    // display error alert if form not submitted
    if (!isset($_POST['submit']) || !isset($_POST['contactForm'])) {
      return $this->getPage($templatePath, $templateVars);
    }    

    // validate form data
    $contactFormData = new ContactFormData($_POST['contactForm']);
    $errorCodes = $contactFormData->validate();

    // display error alert if form data is invalid
    if (!empty($errorCodes)) {
      // pass error code to template
      $templateVars['errorCode'] = $errorCodes[0];
      return $this->getPage($templatePath, $templateVars);
    }

    // try to send email
    $emailSent = $this->services['Mailer']->sendEmail(
      $fromEmail='contactform@rmsy.me',
      $toEmail='ramsey.el-naggar@outlook.com',
      $subject="From $contactFormData->name <$contactFormData->email>",
      $htmlBody=nl2br($contactFormData->message, false),
      $fromName='rmsy.me contact form',
      $toName='Ramsey El-Naggar',      
      $replyToEmail=$contactFormData->email,
      $replyToName=$contactFormData->name,
    );

    // display error alert if email not sent
    if (!$emailSent) {
      return $this->getPage($templatePath, $templateVars);
    }

    // display success alert if email sent
    $templateVars['displayForm'] = false;
    $templateVars['success'] = true;
    $templateVars['contactFormData'] = $contactFormData;
    return $this->getPage($templatePath, $templateVars);
  }
}

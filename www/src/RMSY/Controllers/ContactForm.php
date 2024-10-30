<?php declare(strict_types=1);
namespace RMSY\Controllers;

use RMSY\Data\ContactFormData;

class ContactForm extends \Framework\AbstractController {
  private function get_contact_template_vars(): array {
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

  public function contact(): \Framework\Page {
    return $this->get_page(
      __FUNCTION__,
      $this->get_contact_template_vars()
    );
  }

  public function contactSubmit(): \Framework\Page {
    // set template path and vars same as contact method
    $templatePath = 'contact';
    $templateVars = $this->get_contact_template_vars();

    // display error alert by default
    $templateVars['displayAlert'] = true;
    $templateVars['success'] = false;

    // display error alert if form not submitted
    if (!isset($_POST['submit']) || !isset($_POST['contactForm'])) {
      return $this->get_page($templatePath, $templateVars);
    }

    // validate form data
    $contactFormData = new ContactFormData($_POST['contactForm']);
    $errorCodes = $contactFormData->validate();

    // display error alert if form data is invalid
    if (!empty($errorCodes)) {
      // pass error code to template
      $templateVars['errorCode'] = $errorCodes[0];
      return $this->get_page($templatePath, $templateVars);
    }

    // try to send email
      $emailSent = $this->services['mailer']->sendEmail(
      $fromEmail='contactform@rmsy.me',
      $fromName=$contactFormData->name,
      $toEmail='ramsey.el-naggar@outlook.com',
      $toName='Ramsey El-Naggar',
      $ccEmail=$contactFormData->email,
      $ccName=$contactFormData->name,
      $subject='rmsy.me engineer contact form message',
      $htmlBody=nl2br($contactFormData->message, false)
    );

    // display error alert if email not sent
    if (!$emailSent) {
      return $this->get_page($templatePath, $templateVars);
    }

    // display success alert if email sent
    $templateVars['displayForm'] = false;
    $templateVars['success'] = true;
    return $this->get_page($templatePath, $templateVars);
  }
}

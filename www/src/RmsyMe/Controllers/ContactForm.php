<?php

declare(strict_types=1);

namespace RmsyMe\Controllers;

use Symfony\Contracts\HttpClient\Exception\ExceptionInterface;
use Relnaggar\Veloz\{
  Controllers\AbstractController,
  Views\Page,
};
use RmsyMe\{
  Services\ContactMethods,
  Services\Mailer,
  Data\ContactFormData,
  Services\ApiClient,
  Services\Secrets,
};

class ContactForm extends AbstractController
{
  private ContactMethods $contactMethodsService;
  private Mailer $mailerService;
  private ApiClient $apiClientService;
  private Secrets $secretsService;

  public function __construct(
    array $decorators,
    ContactMethods $contactMethodsService,
    Mailer $mailerService,
    ApiClient $apiClientService,
    Secrets $secretsService,
  ) {
    parent::__construct($decorators);
    $this->contactMethodsService = $contactMethodsService;
    $this->mailerService = $mailerService;
    $this->apiClientService = $apiClientService;
    $this->secretsService = $secretsService;
  }

  private function getContactTemplateVars(): array
  {
    return [
      'title' => 'Contact',
      'metaDescription' => 'I\'m always game to talk tech, education, or ' .
        'even dung beetles!',
      'contactMethods' => $this->contactMethodsService->getContactMethods(),
      'displayAlert' => false,
      'displayForm' => true,
      'formName' => 'contactForm',
    ];
  }

  public function contact(): Page
  {
    return $this->getPage(
      __FUNCTION__,
      $this->getContactTemplateVars()
    );
  }

  public function contactSubmit(): Page
  {
    // set template path and vars same as contact method
    $templatePath = 'contact';
    $templateVars = $this->getContactTemplateVars();

    // display error alert by default
    $templateVars['displayAlert'] = true;
    $templateVars['success'] = false;

    // display error alert if form not submitted
    if (!isset($_POST['submit']) || !isset($_POST[$templateVars['formName']])) {
      return $this->getPage($templatePath, $templateVars);
    }

    // validate form data
    $contactFormData = new ContactFormData($_POST[$templateVars['formName']]);
    $errorCodes = $contactFormData->validate();

    // display error alert if form data is invalid
    if (!empty($errorCodes)) {
      // pass error code to template
      $templateVars['errorCode'] = array_keys($errorCodes)[0];
      return $this->getPage($templatePath, $templateVars);
    }

    if (empty($_POST['cf-turnstile-response'])) {
      // display error alert if turnstile not submitted
      $templateVars['errorCode'] = 'CAPTCHA';
      return $this->getPage($templatePath, $templateVars);
    }

    // verify turnstile response via siteverify API
    // https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
    try {
      $body = [
        'secret' => $this->secretsService->getSecret('TURNSTILE_SECRET_KEY'),
        'response' => $_POST['cf-turnstile-response'],
      ];
      if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
        $body['remoteip'] = $_SERVER['HTTP_CF_CONNECTING_IP'];
      }
      $response = $this->apiClientService->post(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        $body
      );
    } catch (ExceptionInterface $e) {
      // display error alert if siteverify API call fails
      $templateVars['errorCode'] = 'CAPTCHA';
      return $this->getPage($templatePath, $templateVars);
    }

    if (empty($response['success']) || $response['success'] !== true) {
      // display error alert unless siteverify API succeeds
      $templateVars['errorCode'] = 'CAPTCHA';
      return $this->getPage($templatePath, $templateVars);
    }

    // try to send email
    $emailSent = $this->mailerService->sendEmail(
      fromEmail: 'contactform@rmsy.me',
      toEmail: 'ramsey.el-naggar@outlook.com',
      subject: "From $contactFormData->name <$contactFormData->email>",
      htmlBody: nl2br($contactFormData->message, false),
      fromName: 'rmsy.me contact form',
      toName: 'Ramsey El-Naggar',
      replyToEmail: $contactFormData->email,
      replyToName: $contactFormData->name,
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

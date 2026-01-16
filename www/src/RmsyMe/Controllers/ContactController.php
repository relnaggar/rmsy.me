<?php

declare(strict_types=1);

namespace RmsyMe\Controllers;

use Symfony\Contracts\HttpClient\Exception\ExceptionInterface;
use Relnaggar\Veloz\{
  Controllers\AbstractController,
  Views\Page,
};
use RmsyMe\{
  Services\ContactMethodsService,
  Services\MailerService,
  Forms\ContactForm,
  Services\ApiClientService,
  Services\SecretsService,
  Components\Alert,
};

class ContactController extends AbstractController
{
  private ContactMethodsService $contactMethodsService;
  private MailerService $mailerService;
  private ApiClientService $apiClientService;
  private SecretsService $secretsService;

  public function __construct(
    array $decorators,
    ContactMethodsService $contactMethodsService,
    MailerService $mailerService,
    ApiClientService $apiClientService,
    SecretsService $secretsService,
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
      'formName' => 'contactForm',
    ];
  }

  public function contact(): Page
  {
    return $this->getPage(
      relativeBodyTemplatePath: __FUNCTION__,
      templateVars: $this->getContactTemplateVars()
    );
  }

  public function contactSubmit(): Page
  {
    // set template path and vars same as contact method
    $templatePath = 'contact';
    $templateVars = $this->getContactTemplateVars();

    // display error alert by default
    $templateVars['alert'] = new Alert(
      type: 'danger',
      title: 'Message send failure!',
      message: <<<HTML
        There was an error submitting the contact form but it's not clear why.
        The contact form could be under maintenance or broken.
        If the problem persists, please <a href="/contact">let me know</a>.
      HTML
    );

    // display error alert if form not submitted
    if (!isset($_POST['submit']) || !isset($_POST[$templateVars['formName']])) {
      return $this->getPage($templatePath, $templateVars);
    }

    // validate form data
    $formData = new ContactForm($_POST[$templateVars['formName']]);
    $errors = $formData->validate();

    // display error alert if form data is invalid
    if (!empty($errors)) {
      $templateVars['alert']->message = $errors[array_key_first($errors)];
      return $this->getPage($templatePath, $templateVars);
    }

    if (empty($_POST['cf-turnstile-response'])) {
      // display error alert if turnstile not submitted
      $templateVars['alert']->message = <<<HTML
        Captcha not submitted.
        Please try again.
      HTML;
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
      error_log('Turnstile siteverify API error: ' . $e->getMessage());
      // display error alert if siteverify API call fails
      $templateVars['alert']->message = <<<HTML
        Captcha API error.
        Please try again.
      HTML;
      return $this->getPage($templatePath, $templateVars);
    }

    if (empty($response['success']) || $response['success'] !== true) {
      // display error alert unless siteverify API succeeds
      $templateVars['alert']->message = <<<HTML
        Captcha verification failed.
        Please try again.
      HTML;
      return $this->getPage($templatePath, $templateVars);
    }

    // try to send email
    $emailSent = $this->mailerService->sendEmail(
      fromEmail: 'contactform@rmsy.me',
      toEmail: 'ramsey.el-naggar@outlook.com',
      subject: "From $formData->name <$formData->email>",
      htmlBody: nl2br($formData->message, false),
      fromName: 'rmsy.me contact form',
      toName: 'Ramsey El-Naggar',
      replyToEmail: $formData->email,
      replyToName: $formData->name,
    );

    // display error alert if email not sent
    if (!$emailSent) {
      return $this->getPage($templatePath, $templateVars);
    }

    // display success alert if email sent
    $templateVars['alert'] = new Alert(
      type: 'success',
      title: 'Message sent!',
      message: <<<HTML
        <p>
          Your message has been sent successfully!
          I'll get back to you as soon as I can.
        </p>
        <p>
          Here's what you sent:
          <ul>
            <li><strong>Name:</strong> $formData->name</li>
            <li><strong>Email:</strong> $formData->email</li>
            <li><strong>Message:</strong> $formData->message</li>
          </ul>
        </p>
      HTML,
    );
    $_POST = []; // clear POST data to reset form
    return $this->getPage($templatePath, $templateVars);
  }
}

<?php

declare(strict_types=1);

namespace RmsyMe\Forms;

use Relnaggar\Veloz\Data\AbstractFormData;

class Contact extends AbstractFormData
{
  public string $name;
  public string $email;
  public string $message;
  public string $subject;

  public function validate(): array
  {
    $errors = [];
    if (
      empty($this->name)
      || strlen($this->name) > 254
    ) {
      $errors['name'] = <<<HTML
        Name is required and must be less than or equal to 254 characters.
        Please try again.
      HTML;
    }
    if (
      empty($this->email)
      || !filter_var($this->email, FILTER_VALIDATE_EMAIL)
      || strlen($this->email) > 254
    ) {
      $errors['email'] = <<<HTML
        Email is required and must be a valid email address less than or equal
        to 254 characters. Please try again.
      HTML;
    }
    if (
      empty($this->message)
      || strlen($this->message) > 65534
    ) {
      $errors['message'] = <<<HTML
        Message is required and must be less than or equal to 65534 characters.
        Please try again.
      HTML;
    }
    // honeypot
    if (!empty($this->subject)) {
      $errors['spam'] = <<<HTML
        Spam detected!
      HTML;
    }
    return $errors;
  }
}

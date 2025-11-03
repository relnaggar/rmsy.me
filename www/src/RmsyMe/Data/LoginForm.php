<?php

declare(strict_types=1);

namespace RmsyMe\Data;

use Dom\HTMLElement;
use Relnaggar\Veloz\Data\AbstractFormData;

class LoginForm extends AbstractFormData
{
  public string $email;
  public string $password;

  public function validate(): array
  {
    $errors = [];
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
      empty($this->password)
      || strlen($this->password) > 65534
    ) {
      $errors['password'] = <<<HTML
        Password is required and must be less than or equal to 65534 characters.
        Please try again.
      HTML;
    }
    return $errors;
  }
}

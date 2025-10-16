<?php

declare(strict_types=1);

namespace RmsyMe\Data;

use Relnaggar\Veloz\Data\AbstractFormData;

class LoginFormData extends AbstractFormData
{
  public string $email;
  public string $password;

  public function validate(): array
  {
    $errorCodes = [];
    if (
      empty($this->email)
      || !filter_var($this->email, FILTER_VALIDATE_EMAIL)
      || strlen($this->email) > 254
    ) {
      $errorCodes['email'] = 'Email is required and must be a valid email ' .
        'address (up to 254 characters)';
    }
    if (
      empty($this->password)
      // || strlen($this->password) > 65534
    ) {
      $errorCodes['password'] = 'Password is required';
    }
    return $errorCodes;
  }
}

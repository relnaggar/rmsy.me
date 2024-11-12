<?php declare(strict_types=1);
namespace RmsyMe\Data;

use Framework\Data\AbstractFormData;

class ContactFormData extends AbstractFormData {
  public string $name;
  public string $email;
  public string $message;

  public function validate(): array {
    $errorCodes = [];
    if (
      empty($this->name)
      // || strlen($this->name) > 254
    ) {
      $errorCodes['name'] = 'Name is required';
    }
    if (
      empty($this->email)
      || !filter_var($this->email, FILTER_VALIDATE_EMAIL)
      || strlen($this->email) > 254
    ) {
      $errorCodes['email'] = 'Email is required and must be a valid email ' .
        'address (up to 254 characters)';
    }
    if (
      empty($this->message)
      // || strlen($this->message) > 65534
    ) {
      $errorCodes['message'] = 'Message is required';
    }
    return $errorCodes;
  }
}

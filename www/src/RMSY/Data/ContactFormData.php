<?php declare(strict_types=1);
namespace RMSY\Data;

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
      $errorCodes[] = 'name';
    }
    if (
      empty($this->email)
      || !filter_var($this->email, FILTER_VALIDATE_EMAIL)
      || strlen($this->email) > 254
    ) {
      $errorCodes[] = 'email';
    }
    if (
      empty($this->message)
      // || strlen($this->message) > 65534
    ) {
      $errorCodes[] = 'message';
    }
    return $errorCodes;
  }
}

<?php

declare(strict_types=1);

namespace RmsyMe\Models;

use Relnaggar\Veloz\Data\AbstractFormData;

class StudentModel extends AbstractFormData
{
  public int $id;
  public string $name;

  public function validate(): array
  {
    $errors = [];

    // validate name
    if (
      empty($this->name)
      || strlen($this->name) > 255
    ) {
      $errors['name'] = <<<HTML
        Name is required and must be less than or equal to 255 characters.
        Please try again.
      HTML;
    }

    return $errors;
  }
}

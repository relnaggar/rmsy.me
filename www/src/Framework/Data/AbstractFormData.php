<?php declare(strict_types=1);
namespace RmsyMe\Data;

abstract class AbstractFormData {
  public function __construct(array $data = []) {
    foreach ($data as $key => $value) {
      if (property_exists($this, $key)) {
        $this->$key = $value;
      }
    }
  }

  abstract public function validate(): array;
}

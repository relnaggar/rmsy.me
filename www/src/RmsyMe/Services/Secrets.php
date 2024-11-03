<?php declare(strict_types=1);
namespace RmsyMe\Services;

use Framework\Services\AbstractService;

class Secrets extends AbstractService {
  public function getSecret(string $name): string {
    return rtrim(file_get_contents('/run/secrets/' . $name));
  }
}

<?php

declare(strict_types=1);

namespace RmsyMe\Services;

class SecretsService
{
  public function getSecret(string $name): string
  {
    return rtrim(file_get_contents('/run/secrets/' . $name));
  }
}

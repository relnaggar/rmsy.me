<?php

declare(strict_types=1);

namespace RmsyMe\Services;

class Secrets
{
  public function getSecret(string $name): string
  {
    return rtrim(file_get_contents('/run/secrets/' . $name));
  }
}

<?php declare(strict_types=1);
namespace RMSY\Services;

class Secrets extends \Framework\Services\AbstractService {
  public function getSecret(string $name): string {
    return rtrim(file_get_contents('/run/secrets/' . $name));
  }
}

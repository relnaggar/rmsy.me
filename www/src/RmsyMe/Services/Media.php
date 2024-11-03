<?php declare(strict_types=1);
namespace RmsyMe\Services;

use Framework\Services\AbstractService;

class Media extends AbstractService {
  public function getMediaRoot(): string {
    return 'https://media.rmsy.me';
  }
}

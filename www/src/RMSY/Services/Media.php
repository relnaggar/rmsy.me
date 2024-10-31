<?php declare(strict_types=1);
namespace RMSY\Services;

class Media extends \Framework\Services\AbstractService {
  public function getMediaRoot(): string {
    return 'https://media.rmsy.me';
  }
}

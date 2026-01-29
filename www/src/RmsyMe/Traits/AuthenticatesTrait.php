<?php

declare(strict_types=1);

namespace RmsyMe\Traits;

use ReflectionClass;
use ReflectionMethod;
use RmsyMe\{
  Services\LoginService,
  Attributes\RequiresAuth,
};

trait AuthenticatesTrait
{
  protected ?int $loggedInUserId = null;

  abstract protected function getLoginService(): LoginService;

  private function authenticate(): void
  {
    $this->loggedInUserId = $this->getLoginService()->getLoggedInUserId();
    if ($this->loggedInUserId === null) {
      $this->redirect('/portal/login', 303);
    }
  }

  public function beforeAction(string $action): void
  {
    $class = new ReflectionClass($this);
    if ($class->getAttributes(RequiresAuth::class)) {
      $this->authenticate();
    } else {
      $method = new ReflectionMethod($this, $action);
      if ($method->getAttributes(RequiresAuth::class)) {
        $this->authenticate();
      }
    }
  }
}

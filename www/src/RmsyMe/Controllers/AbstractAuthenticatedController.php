<?php

declare(strict_types=1);

namespace RmsyMe\Controllers;

use ReflectionClass;
use ReflectionMethod;
use Relnaggar\Veloz\Controllers\AbstractController;
use RmsyMe\{
  Services\LoginService,
  Attributes\RequiresAuth,
};

abstract class AbstractAuthenticatedController extends AbstractController
{
  protected ?int $loggedInUserId;
  protected LoginService $loginService;

  public function __construct(
    array $decorators,
    LoginService $loginService,
  ) {
    parent::__construct($decorators);
    $this->loginService = $loginService;
    $this->loggedInUserId = null;
  }

  private function authenticate(): void
  {
    $this->loggedInUserId = $this->loginService->getLoggedInUserId();
    if ($this->loggedInUserId === null) {
      $this->redirect('/portal/login', 302);
    }
  }

  #[\Override]
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

<?php

declare(strict_types=1);

namespace RmsyMe\Controllers;

use PDOException;
use Relnaggar\Veloz\{
  Controllers\AbstractController,
  Views\Page,
};
use RmsyMe\{
  Services\Database,
  Services\Login,
};

class Client extends AbstractController
{
  private Login $loginService;
  private Database $databaseService;
  
  public function __construct(
    array $decorators,
    Login $loginService,
    Database $databaseService
  )
  {
    parent::__construct($decorators);
    $this->loginService = $loginService;
    $this->databaseService = $databaseService;
  }

  private function authenticate(): int
  {
    $userId = $this->loginService->getLoggedInUserId();
    if ($userId === -1) {
      $this->redirect('/login', 302);
      return 0;
    } else {
      return $userId;
    }
  }

  public function welcome(): Page
  {
    $loggedInUserId = $this->authenticate();
    try {
      $userEmail = $this->databaseService->getUserEmail($loggedInUserId);
    } catch (PDOException $e) {
      error_log($e->getMessage());
      $this->redirect('/database-error', 302);
      return Page::empty();
    }

    return $this->getPage(
      bodyTemplatePath: __FUNCTION__,
      templateVars: [
        'title' => 'Welcome',
        'userEmail' => $userEmail,
      ],
    );
  }
}

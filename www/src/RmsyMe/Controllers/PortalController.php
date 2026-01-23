<?php

declare(strict_types=1);

namespace RmsyMe\Controllers;

use PDOException;
use Relnaggar\Veloz\Controllers\AbstractController;
use Relnaggar\Veloz\Views\Page;
use RmsyMe\{
  Services\LoginService,
  Repositories\UserRepository,
  Repositories\Database,
  Attributes\RequiresAuth,
  Traits\AuthenticatesTrait,
};

#[RequiresAuth]
class PortalController extends AbstractController
{
  use AuthenticatesTrait;

  private LoginService $loginService;
  private UserRepository $userRepository;
  private Database $database;

  public function __construct(
    array $decorators,
    LoginService $loginService,
    UserRepository $userRepository,
    Database $database,
  )
  {
    parent::__construct($decorators);
    $this->loginService = $loginService;
    $this->userRepository = $userRepository;
    $this->database = $database;
  }

  protected function getLoginService(): LoginService
  {
    return $this->loginService;
  }

  public function index(): Page
  {
    try {
      $userEmail = $this->userRepository->selectEmail($this->loggedInUserId);
    } catch (PDOException $e) {
      return $this->database->getDatabaseErrorPage($this, $e);
    }
    return $this->getPage(
      relativeBodyTemplatePath: __FUNCTION__,
      templateVars: [
        'title' => 'Dashboard',
        'userEmail' => $userEmail,
      ]
    );
  }
}

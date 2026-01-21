<?php

declare(strict_types=1);

namespace RmsyMe\Controllers;

use PDOException;
use Relnaggar\Veloz\Views\Page;
use RmsyMe\{
  Services\LoginService,
  Repositories\UserRepository,
  Repositories\Database,
  Attributes\RequiresAuth,
};

#[RequiresAuth]
class PortalController extends AbstractAuthenticatedController
{
  private UserRepository $userRepository;
  private Database $database;

  public function __construct(
    array $decorators,
    LoginService $loginService,
    UserRepository $userRepository,
    Database $database,
  )
  {
    parent::__construct($decorators, $loginService);
    $this->loginService = $loginService;
    $this->userRepository = $userRepository;
    $this->database = $database;
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

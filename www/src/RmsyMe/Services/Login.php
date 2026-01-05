<?php

declare(strict_types=1);

namespace RmsyMe\Services;

use PDOException;
use RmsyMe\Services\Database;

class Login
{
  private Database $databaseService;

  public function __construct(Database $databaseService)
  {
    if (session_status() === PHP_SESSION_NONE) {
      session_start();
    }
    $this->databaseService = $databaseService;
  }

  /**
   * Attempt to log in a user with the given email and password.
   * 
   * @param string $email The user's email address.
   * @param string $password The user's password.
   * @return bool True if the email and password are valid, false otherwise.
   * @throws PDOException If there is a database error.
   */
  public function login(string $email, string $password): bool
  {
    $userId = $this->databaseService->getUserId($email, $password);
    if ($userId === null) {
      return false;
    } else {
      $_SESSION['user_id'] = $userId;
      return true;
    }
  }

  public function logout(): void
  {
    unset($_SESSION['user_id']);
  }

  public function getLoggedInUserId(): ?int
  {
    return $_SESSION['user_id'] ?? null;
  }
}

<?php

declare(strict_types=1);

namespace RmsyMe\Services;

use PDO;
use PDOException;

class Database
{
  private ?PDO $pdo;
  private bool $databaseConnected;

  public function __construct()
  {
    $this->pdo = null;
    $this->databaseConnected = false;
  }

  /**
   * Establish a connection to the database.
   * 
   * @throws PDOException If there is a database connection error.
   */
  public function connect(): void {
    if ($this->databaseConnected) {
      return;
    }

    $this->pdo = new PDO('sqlite:/var/db/database.sqlite3');
    $this->databaseConnected = true;
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
    $this->connect();

    $stmt = $this->pdo->prepare('SELECT password_hash FROM users WHERE email = :email');
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password_hash'])) {
      return true;
    }

    return false;
  }
}

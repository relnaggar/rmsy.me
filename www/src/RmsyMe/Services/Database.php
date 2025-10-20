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
   * Get the user ID for the given email and password.
   * 
   * @param string $email The user's email address.
   * @param string $password The user's password.
   * @return int The user ID if the email and password are valid, -1 otherwise.
   * @throws PDOException If there is a database error.
   */
  public function getUserId(string $email, string $password): int
  {
    $this->connect();

    $stmt = $this->pdo->prepare('SELECT id, password_hash FROM users WHERE email = :email');
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password_hash'])) {
      return $user['id'];
    }

    return -1;
  }

  /**
   * Get the email address of a user by their user ID.
   * 
   * @param int $userId The user's ID.
   * @return string The user's email address.
   * @throws PDOException If there is a database error.
   */
  public function getUserEmail(int $userId): string
  {
    $this->connect();

    $stmt = $this->pdo->prepare('SELECT email FROM users WHERE id = :id');
    $stmt->execute(['id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    return $user['email'];
  }
}

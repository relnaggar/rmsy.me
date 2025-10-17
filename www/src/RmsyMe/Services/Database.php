<?php

declare(strict_types=1);

namespace RmsyMe\Services;

use PDO;
use PDOException;

class Database
{
  private PDO $pdo;
  private bool $databaseConnected;

  public function __construct()
  {
    try {
      $this->pdo = new PDO('sqlite:/var/db/database.sqlite3');
      // throw new PDOException('Simulated failure');
      $this->databaseConnected = true;
    } catch (PDOException $e) {
      $this->databaseConnected = false;
    }
  }

  public function login(string $email, string $password): bool
  {
    if (!$this->databaseConnected) {
      return false;
    }

    $stmt = $this->pdo->prepare('SELECT password_hash FROM users WHERE email = :email');
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password_hash'])) {
      return true;
    }

    return false;
  }

  public function getPdo(): PDO
  {
    return $this->pdo;
  }

  public function isConnected(): bool
  {
    return $this->databaseConnected;
  }
}

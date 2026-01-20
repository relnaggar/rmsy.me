<?php

declare(strict_types=1);

namespace RmsyMe\Repositories;

use PDO;
use PDOException;
use Relnaggar\Veloz\Repositories\AbstractRepository;

class UserRepository extends AbstractRepository
{
  public function __construct(Database $database)
  {
    parent::__construct($database);
    $this->tableName = 'users';
  }

  /**
   * Select the user ID for the given email and password.
   * 
   * @param string $email The user's email address.
   * @param string $password The user's password.
   * @return ?int The user's ID if the email and password are valid,
   *   null otherwise.
   * @throws PDOException If there is a database error.
   */
  public function selectIdByEmailPassword(string $email, string $password): ?int
  {
    $stmt = $this->pdo->prepare(<<<SQL
      SELECT id, password_hash
      FROM {$this->tableName}
      WHERE email = :email
    SQL);
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password_hash'])) {
      return $user['id'];
    }

    return null;
  }

  /**
   * Select the email address of a user by their user ID.
   * 
   * @param int $id The user's ID.
   * @return string The user's email address.
   * @throws PDOException If there is a database error.
   */
  public function selectEmail(int $id): string
  {
    $stmt = $this->pdo->prepare(<<<SQL
      SELECT email
      FROM {$this->tableName}
      WHERE id = :id
    SQL);
    $stmt->execute(['id' => $id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    return $user['email'];
  }
}

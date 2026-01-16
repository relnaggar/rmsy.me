<?php

declare(strict_types=1);

namespace RmsyMe\Repositories;

use PDO;
use PDOException;
use RmsyMe\Services\DatabaseService;

abstract class AbstractRepository
{
  protected PDO $pdo;
  protected string $tableName;
  protected string $modelClass;

  public function __construct(DatabaseService $databaseService)
  {
    $this->pdo = $databaseService->getConnection();
  }
  /**
   * Select all records from the table.
   * 
   * @return array An array of record objects or associative arrays.
   * @throws PDOException If there is a database error.
   */
  public function selectAll(): array
  {
    $stmt = $this->pdo->prepare(<<<SQL
      SELECT *
      FROM {$this->tableName}
    SQL);
    $stmt->execute();
    if (isset($this->modelClass)) {
      $results = $stmt->fetchAll(PDO::FETCH_CLASS, $this->modelClass);
    } else {
      $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    return $results;
  }

  /**
   * Select a record by its ID.
   * 
   * @param mixed $id The ID.
   * @return mixed The record object or associative array if found,
   *  null otherwise.
   * @throws PDOException If there is a database error.
   */
  public function selectById(mixed $id): mixed
  {
    $stmt = $this->pdo->prepare(<<<SQL
      SELECT *
      FROM {$this->tableName}
      WHERE id = :id
    SQL);
    $stmt->execute(['id' => $id]);
    if (isset($this->modelClass)) {
      $result = $stmt->fetchObject($this->modelClass);
    } else {
      $result = $stmt->fetch(PDO::FETCH_ASSOC);
    }
    if (!$result) {
      return null;
    }

    return $result;
  }

  public function getOrCreateIdByName(string $name): int {
    foreach ($this->selectAll() as $record) {
      // record could be an object or an associative array
      if (is_object($record) && str_starts_with($record->name, $name)) {
        return (int)$record->id;
      } else if (is_array($record) && str_starts_with($record['name'], $name)) {
        return (int)$record['id'];
      }
    }

    // create new record
    $insertStmt = $this->pdo->prepare(<<<SQL
      INSERT INTO {$this->tableName} (name)
      VALUES (:name)
    SQL);
    $insertStmt->execute(['name' => $name]);
    return (int)$this->pdo->lastInsertId();
  }
}

<?php

declare(strict_types=1);

namespace RmsyMe\Repositories;

use PDOException;
use RmsyMe\{
  Services\DatabaseService,
  Models\StudentModel,
};

class StudentRepository extends AbstractRepository
{
  public function __construct(DatabaseService $databaseService)
  {
    parent::__construct($databaseService);
    $this->tableName = 'students';
    $this->modelClass = StudentModel::class;
  }

  /**
   * Update a student in the students table.
   * 
   * @param StudentModel $student The Student object to update.
   * @throws PDOException If there is a database error.
   */
  public function update(StudentModel $student): void
  {
    $stmt = $this->pdo->prepare(<<<SQL
      UPDATE {$this->tableName}
      SET
        name = :name
      WHERE id = :id
    SQL);
    $stmt->execute([
      'id' => $student->id,
      'name' => $student->name,
    ]);
  }
}

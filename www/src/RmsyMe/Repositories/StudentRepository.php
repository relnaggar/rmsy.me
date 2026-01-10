<?php

declare(strict_types=1);

namespace RmsyMe\Repositories;

use RmsyMe\Services\Database;
use RmsyMe\Models\Student;

class StudentRepository extends AbstractRepository
{
  public function __construct(Database $databaseService)
  {
    parent::__construct($databaseService);
    $this->tableName = 'students';
    $this->modelClass = Student::class;
  }

  /**
   * Update a student in the students table.
   * 
   * @param Student $student The Student object to update.
   * @throws PDOException If there is a database error.
   */
  public function update(Student $student): void
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

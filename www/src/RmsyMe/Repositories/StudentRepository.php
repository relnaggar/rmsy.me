<?php

declare(strict_types=1);

namespace RmsyMe\Repositories;

use PDOException;
use Relnaggar\Veloz\Repositories\AbstractRepository;
use RmsyMe\Models\StudentModel;

class StudentRepository extends AbstractRepository
{
  public function __construct(Database $database)
  {
    parent::__construct($database);
    $this->tableName = 'students';
    $this->modelClass = StudentModel::class;
  }
}

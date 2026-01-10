<?php

declare(strict_types=1);

namespace RmsyMe\Repositories;

use RmsyMe\Services\Database;
use RmsyMe\Models\Lesson;

class LessonRepository extends AbstractRepository
{
  public function __construct(Database $databaseService)
  {
    parent::__construct($databaseService);
    $this->tableName = 'lessons';
    $this->modelClass = Lesson::class;
  }
}

<?php

declare(strict_types=1);

namespace RmsyMe\Repositories;

use RmsyMe\{
  Services\DatabaseService,
  Models\LessonModel,
};

class LessonRepository extends AbstractRepository
{
  public function __construct(DatabaseService $databaseService)
  {
    parent::__construct($databaseService);
    $this->tableName = 'lessons';
    $this->modelClass = LessonModel::class;
  }
}

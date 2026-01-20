<?php

declare(strict_types=1);

namespace RmsyMe\Repositories;

use Relnaggar\Veloz\Repositories\AbstractRepository;
use RmsyMe\Models\LessonModel;

class LessonRepository extends AbstractRepository
{
  public function __construct(Database $database)
  {
    parent::__construct($database);
    $this->tableName = 'lessons';
    $this->modelClass = LessonModel::class;
  }
}

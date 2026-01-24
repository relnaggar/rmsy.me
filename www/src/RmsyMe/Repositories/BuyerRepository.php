<?php

declare(strict_types=1);

namespace RmsyMe\Repositories;

use PDOException;
use Relnaggar\Veloz\Repositories\AbstractRepository;
use RmsyMe\Models\BuyerModel;

class BuyerRepository extends AbstractRepository
{
  public function __construct(Database $database)
  {
    parent::__construct($database);
    $this->tableName = 'buyers';
    $this->modelClass = BuyerModel::class;
  }
}

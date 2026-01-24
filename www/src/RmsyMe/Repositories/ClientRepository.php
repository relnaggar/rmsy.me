<?php

declare(strict_types=1);

namespace RmsyMe\Repositories;

use Relnaggar\Veloz\Repositories\AbstractRepository;
use RmsyMe\Models\ClientModel;

class ClientRepository extends AbstractRepository
{
  public function __construct(Database $database)
  {
    parent::__construct($database);
    $this->tableName = 'clients';
    $this->modelClass = ClientModel::class;
  }
}

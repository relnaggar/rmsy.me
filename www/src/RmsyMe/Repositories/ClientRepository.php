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

  /**
   * Update a client in the clients table.
   * 
   * @param ClientModel $client The Client object to update.
   * @throws PDOException If there is a database error.
   */
  public function update(ClientModel $client): void
  {
    $stmt = $this->pdo->prepare(<<<SQL
      UPDATE {$this->tableName}
      SET
        name = :name
      WHERE id = :id
    SQL);
    $stmt->execute([
      'id' => $client->id,
      'name' => $client->name,
    ]);
  }
}

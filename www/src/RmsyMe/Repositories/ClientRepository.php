<?php

declare(strict_types=1);

namespace RmsyMe\Repositories;

use RmsyMe\Services\Database;
use RmsyMe\Models\Client;

class ClientRepository extends AbstractRepository
{
  public function __construct(Database $databaseService)
  {
    parent::__construct($databaseService);
    $this->tableName = 'clients';
  }

  /**
   * Update a client in the clients table.
   * 
   * @param Client $client The Client object to update.
   * @throws PDOException If there is a database error.
   */
  public function update(Client $client): void
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

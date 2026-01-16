<?php

declare(strict_types=1);

namespace RmsyMe\Repositories;

use PDOException;
use RmsyMe\{
  Services\DatabaseService,
  Models\BuyerModel,
};

class BuyerRepository extends AbstractRepository
{
  public function __construct(DatabaseService $databaseService)
  {
    parent::__construct($databaseService);
    $this->tableName = 'buyers';
    $this->modelClass = BuyerModel::class;
  }

  /**
   * Update a buyer in the buyers table.
   * 
   * @param BuyerModel $buyer The Buyer object to update.
   * @throws PDOException If there is a database error.
   */
  public function update(BuyerModel $buyer): void
  {
    $stmt = $this->pdo->prepare(<<<SQL
      UPDATE {$this->tableName}
      SET
        name = :name,
        address1 = :address1,
        address2 = :address2,
        address3 = :address3,
        town_city = :town_city,
        state_province_county = :state_province_county,
        zip_postal_code = :zip_postal_code,
        country = :country,
        extra = :extra
      WHERE id = :id
    SQL);
    $stmt->execute([
      'id' => $buyer->id,
      'name' => $buyer->name,
      'address1' => $buyer->address1 == '' ? null : $buyer->address1,
      'address2' => $buyer->address2 == '' ? null : $buyer->address2,
      'address3' => $buyer->address3 == '' ? null : $buyer->address3,
      'town_city' => $buyer->town_city == '' ? null : $buyer->town_city,
      'state_province_county' => $buyer->state_province_county == '' ?
        null : $buyer->state_province_county,
      'zip_postal_code' => $buyer->zip_postal_code == '' ? null : $buyer->zip_postal_code,
      'country' => $buyer->country,
      'extra' => $buyer->extra == '' ? null : $buyer->extra,
    ]);
  }
}

<?php

declare(strict_types=1);

namespace Cacana;

use PDO;
use PDOException;

class Database
{
  private ?PDO $pdo;

  /**
    * Establish a connection to the SQLite database and create tables if they do not exist.
    * @throws PDOException
    */
  public function __construct()
  {
    $this->pdo = new PDO('sqlite:/var/db/cacana.sqlite3');
    $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); // throw exceptions on errors

    $this->pdo->exec(<<<SQL
      CREATE TABLE IF NOT EXISTS cacas (
        uuid TEXT PRIMARY KEY,
        createdAt INTEGER,
        deleted INTEGER DEFAULT 0 -- boolean
      );
      CREATE TABLE IF NOT EXISTS operations (
        uuid TEXT PRIMARY KEY,
        tableName TEXT,
        entityUuid TEXT,
        timestamp INTEGER,
        action TEXT
      );
    SQL);
  }

  public function processOutbox($outbox): bool
  {
    foreach ($outbox as $outboxItem) {
      // TODO process each valid outbox item
    }

    return true;
  }
}

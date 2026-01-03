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
        updatedAt INTEGER,
        deletedAt INTEGER DEFAULT NULL
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

  /**
    * Process outbox items received from the client.
    *
    * @param array $outbox Array of outbox items to process.
    * @throws PDOException
    */
  public function processOutbox($outbox): void
  {
    $this->pdo->beginTransaction();
    try {
      foreach ($outbox as $outboxItem) {
        // check if operation already processed
        $stmt = $this->pdo->prepare(<<<SQL
          SELECT COUNT(*) as count
          FROM operations
          WHERE uuid = :uuid
          ORDER BY timestamp DESC
        SQL);
        $stmt->execute([
          ':uuid' => $outboxItem['uuid'],
        ]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($result && $result['count'] > 0) {
          // operation already processed, skip
          continue;
        }

        switch ($outboxItem['table']) {
          case 'cacas':
            switch ($outboxItem['action']) {
              case 'create':
                $stmt = $this->pdo->prepare(<<<SQL
                  INSERT OR IGNORE INTO cacas (
                    uuid,
                    createdAt,
                    updatedAt
                  ) VALUES (
                    :uuid,
                    :createdAt,
                    :createdAt
                  )
                SQL);
                $stmt->execute([
                  ':uuid' => $outboxItem['entityUuid'],
                  ':createdAt' => $outboxItem['timestamp'],
                ]);
                break;
              case 'delete':
                $stmt = $this->pdo->prepare(<<<SQL
                  UPDATE cacas
                  SET
                    deletedAt=:deletedAt,
                    updatedAt=:deletedAt
                  WHERE uuid = :uuid
                SQL);
                $stmt->execute([
                  ':uuid' => $outboxItem['entityUuid'],
                  ':deletedAt' => $outboxItem['timestamp'],
                ]);
                break;
            }
            break;
        }

        $stmt = $this->pdo->prepare(<<<SQL
          INSERT INTO operations
          VALUES (
            :uuid,
            :tableName,
            :entityUuid,
            :timestamp,
            :action
          )
        SQL);
        $stmt->execute([
          ':uuid' => $outboxItem['uuid'],
          ':tableName' => $outboxItem['table'],
          ':entityUuid' => $outboxItem['entityUuid'],
          ':timestamp' => $outboxItem['timestamp'],
          ':action' => $outboxItem['action'],
        ]);
      }

      $this->pdo->commit();
    } catch (PDOException $e) {
      $this->pdo->rollBack();
      throw $e;
    }
  }

  /**
    * Retrieve all cacas since a given timestamp, newest first.
    *
    * @return array Array of cacas.
    * @throws PDOException
    */
  public function getCacasSince(int $sinceTimestamp): array
  {
    $stmt = $this->pdo->prepare(<<<SQL
      SELECT * FROM cacas
      WHERE updatedAt > :sinceTimestamp
      ORDER BY createdAt DESC
    SQL);
    $stmt->execute([
      ':sinceTimestamp' => $sinceTimestamp,
    ]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  /**
    * Get the latest update timestamp from the cacas table.
    *
    * @return int Latest update timestamp.
    * @throws PDOException
    */
  public function getLatestUpdateTimestamp(): int
  {
    $stmt = $this->pdo->prepare(<<<SQL
      SELECT MAX(updatedAt) as latestTimestamp
      FROM cacas
    SQL);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$result || $result['latestTimestamp'] === null) {
      return 0;
    }
    return (int)$result['latestTimestamp'];
  }
}

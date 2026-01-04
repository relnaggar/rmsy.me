<?php

declare(strict_types=1);

namespace Cacana;

use PDO;
use PDOException;

class Database
{
  private ?PDO $pdo;

  /**
    * Establish a connection to the SQLite database
    * and create tables if they do not exist.
    * @throws PDOException
    */
  public function __construct()
  {
    $this->pdo = new PDO('sqlite:/var/db/cacana.sqlite3');
    // throw exceptions on errors
    $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $this->pdo->exec(<<<SQL
      CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        passwordHash TEXT NOT NULL,
        createdAt INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS cacas (
        uuid TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        deletedAt INTEGER DEFAULT NULL,
        FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
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
    * Register a new user.
    *
    * @param string $username Username.
    * @param string $password Plain text password.
    * @param int $createdAt Account creation timestamp.
    * @return bool True if registration successful,
    *   false if username already exists.
    * @throws PDOException
    */
  public function registerUser(
    string $username,
    string $password,
    int $createdAt
  ): bool
  {
    // check if username already exists
    $stmt = $this->pdo->prepare(<<<SQL
      SELECT COUNT(*) as count
      FROM users
      WHERE username = :username
    SQL);
    $stmt->execute([':username' => $username]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($result && $result['count'] > 0) {
      return false;
    }

    $stmt = $this->pdo->prepare(<<<SQL
      INSERT INTO users (
        username,
        passwordHash,
        createdAt
      ) VALUES (
        :username,
        :passwordHash,
        :createdAt
      )
    SQL);
    $stmt->execute([
      ':username' => $username,
      ':passwordHash' => password_hash($password, PASSWORD_ARGON2ID),
      ':createdAt' => $createdAt,
    ]);
    return true;
  }

  /**
    * Verify user credentials.
    *
    * @param string $username Username.
    * @param string $password Plain text password.
    * @return bool True if credentials are valid.
    * @throws PDOException
    */
  public function verifyUser(string $username, string $password): bool
  {
    $stmt = $this->pdo->prepare(<<<SQL
      SELECT passwordHash
      FROM users
      WHERE username = :username
    SQL);
    $stmt->execute([':username' => $username]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
      return false;
    }
    return password_verify($password, $row['passwordHash']);
  }

  /**
    * Process outbox items received from the client.
    *
    * @param string $username Username associated with the outbox items.
    * @param array $outbox Array of outbox items to process.
    * @throws PDOException
    */
  public function processOutbox(string $username, array $outbox): void
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
                    username,
                    createdAt,
                    updatedAt
                  ) VALUES (
                    :uuid,
                    :username,
                    :createdAt,
                    :createdAt
                  )
                SQL);
                $stmt->execute([
                  ':uuid' => $outboxItem['entityUuid'],
                  ':username' => $username,
                  ':createdAt' => $outboxItem['timestamp'],
                ]);
                break;
              case 'delete':
                $stmt = $this->pdo->prepare(<<<SQL
                  UPDATE cacas
                  SET
                    deletedAt=:deletedAt,
                    updatedAt=:deletedAt
                  WHERE uuid = :uuid AND username = :username
                SQL);
                $stmt->execute([
                  ':uuid' => $outboxItem['entityUuid'],
                  ':deletedAt' => $outboxItem['timestamp'],
                  ':username' => $username,
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
    * Retrieve all cacas for a given user since a given timestamp, newest first.
    *
    * @param string $username Username to filter by.
    * @param int $sinceTimestamp Timestamp to filter by.
    * @return array Array of cacas.
    * @throws PDOException
    */
  public function getCacasSince(string $username, int $sinceTimestamp): array
  {
    $stmt = $this->pdo->prepare(<<<SQL
      SELECT * FROM cacas
      WHERE username = :username AND updatedAt > :sinceTimestamp
      ORDER BY createdAt DESC
    SQL);
    $stmt->execute([
      ':username' => $username,
      ':sinceTimestamp' => $sinceTimestamp,
    ]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  /**
    * Get the latest update timestamp from the cacas table for a user.
    *
    * @param string $username Username to filter by.
    * @return int Latest update timestamp.
    * @throws PDOException
    */
  public function getLatestUpdateTimestamp(string $username): int
  {
    $stmt = $this->pdo->prepare(<<<SQL
      SELECT MAX(updatedAt) as latestTimestamp
      FROM cacas
      WHERE username = :username
    SQL);
    $stmt->execute([':username' => $username]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$result || $result['latestTimestamp'] === null) {
      return 0;
    }
    return (int)$result['latestTimestamp'];
  }
}

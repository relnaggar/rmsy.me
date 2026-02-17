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
    $this->pdo = new PDO('sqlite:/var/db/cacana.sqlite');
    // throw exceptions on errors
    $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // original table creation
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

    // migration 1: add colour and updatedAt columns to users table
    if (
      $this->pdo->query(
        "PRAGMA table_info(users);"
      )->fetchAll(PDO::FETCH_ASSOC)
    ) {
      $columns = array_column(
        $this->pdo->query("PRAGMA table_info(users);")
          ->fetchAll(PDO::FETCH_ASSOC),
        'name'
      );
      if (!in_array('colour', $columns)) {
        $this->pdo->exec(<<<SQL
          ALTER TABLE users
          ADD COLUMN colour TEXT DEFAULT "#000000";
        SQL);
      }
      if (!in_array('updatedAt', $columns)) {
        $this->pdo->exec(<<<SQL
          ALTER TABLE users
          ADD COLUMN updatedAt INTEGER DEFAULT 0;
        SQL);
      }
    }
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
                    :updatedAt
                  )
                SQL);
                $stmt->execute([
                  ':uuid' => $outboxItem['entityUuid'],
                  ':username' => $username,
                  ':createdAt' => $outboxItem['createdAt'],
                  ':updatedAt' => $outboxItem['timestamp'],
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
              default:
                throw new PDOException("Unknown action for cacas table");
            }
            break;
          case 'users':
            if ($outboxItem['entityUuid'] !== $username) {
              throw new PDOException("Not authorized to update other users");
            }
            switch ($outboxItem['action']) {
              case 'updateColour':
                $stmt = $this->pdo->prepare(<<<SQL
                  UPDATE users
                  SET
                    colour=:colour,
                    updatedAt=:updatedAt
                  WHERE username = :username
                SQL);
                $stmt->execute([
                  ':colour' => $outboxItem['colour'] ?? null,
                  ':updatedAt' => $outboxItem['timestamp'],
                  ':username' => $username,
                ]);
                break;
              default:
                throw new PDOException("Unknown action for users table");
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
    * Get the latest update timestamp for a given user.
    *
    * @param string $username Username to filter by.
    * @return int Latest update timestamp.
    * @throws PDOException
    */
  public function getLatestUpdateTimestamp(string $username): int
  {
    $stmt = $this->pdo->prepare(<<<SQL
      SELECT MAX(updatedAt) as latestCacaUpdate
      FROM cacas
      WHERE username = :username
    SQL);
    $stmt->execute([':username' => $username]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    $latestUpdateTimestamp = 0;
    if ($result && $result['latestCacaUpdate'] !== null) {
      $latestUpdateTimestamp = (int)$result['latestCacaUpdate'];
    }

    $stmt = $this->pdo->prepare(<<<SQL
      SELECT updatedAt
      FROM users
      WHERE username = :username
    SQL);
    $stmt->execute([':username' => $username]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($result && $result['updatedAt'] !== null) {
      $latestUserUpdate = (int)$result['updatedAt'];
      if ($latestUserUpdate > $latestUpdateTimestamp) {
        $latestUpdateTimestamp = $latestUserUpdate;
      }
    }

    return $latestUpdateTimestamp;
  }

  /**
    * Get the colour associated with a user if it has been updated since a given timestamp.
    *
    * @param string $username Username to filter by.
    * @return string|null User colour or null if not set.
    * @throws PDOException
    */
  public function getUserColourIfUpdated(
    string $username,
    int $sinceTimestamp
  ): ?string {
    $stmt = $this->pdo->prepare(<<<SQL
      SELECT colour, updatedAt
      FROM users
      WHERE username = :username
    SQL);
    $stmt->execute([':username' => $username]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$result || (int)$result['updatedAt'] <= $sinceTimestamp) {
      return null;
    }
    return $result['colour'];
  }
}

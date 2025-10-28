<?php

declare(strict_types=1);

namespace RmsyMe\Services;

use PDO;
use PDOException;

class Database
{
  private ?PDO $pdo;
  private bool $databaseConnected;

  public function __construct()
  {
    $this->pdo = null;
    $this->databaseConnected = false;
  }

  /**
   * Establish a connection to the database.
   * 
   * @throws PDOException If there is a database connection error.
   */
  public function connect(): void {
    if ($this->databaseConnected) {
      return;
    }

    $this->pdo = new PDO('sqlite:/var/db/database.sqlite3');
    $this->databaseConnected = true;
  }

  /**
   * Get the user ID for the given email and password.
   * 
   * @param string $email The user's email address.
   * @param string $password The user's password.
   * @return int The user ID if the email and password are valid, -1 otherwise.
   * @throws PDOException If there is a database error.
   */
  public function getUserId(string $email, string $password): int
  {
    $this->connect();

    $stmt = $this->pdo->prepare(<<<SQL
      SELECT id, password_hash FROM users WHERE email = :email
    SQL);
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password_hash'])) {
      return $user['id'];
    }

    return -1;
  }

  /**
   * Get the email address of a user by their user ID.
   * 
   * @param int $userId The user's ID.
   * @return string The user's email address.
   * @throws PDOException If there is a database error.
   */
  public function getUserEmail(int $userId): string
  {
    $this->connect();

    $stmt = $this->pdo->prepare(<<<SQL
      SELECT email FROM users WHERE id = :id
    SQL);
    $stmt->execute(['id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    return $user['email'];
  }

  private function paymentExists(string $paymentId, array $existingPayments): bool
  {
      $stmt = $this->pdo->prepare(<<<SQL
      SELECT COUNT(*) as count FROM payments WHERE id = :id
    SQL);
    $stmt->execute(['id' => $paymentId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    return $result['count'] > 0;
  }

  /**
   * Import payments from a CSV file into the payments table.
   * 
   * @param string $csvPath The path to the CSV file.
   * @return bool True on success, false on failure.
   * @throws PDOException If there is a database error.
   */
  public function importPayments(string $csvPath): bool
  {
    $this->connect();

    $this->pdo->beginTransaction();

    $update_stmt = $this->pdo->prepare(<<<SQL
      INSERT INTO payments (id, datetime, amount, currency, payment_reference, payer_name)
      VALUES (:id, :datetime, :amount, :currency, :payment_reference, :payer_name)
    SQL);

    if (($handle = fopen($csvPath, 'r')) !== false) {
      // validate header row
      if (($header = fgetcsv($handle)) === false ||
        count($header) < 12 ||
        $header[0] !== 'TransferWise ID' ||
        $header[2] !== 'Date Time' ||
        $header[3] !== 'Amount' ||
        $header[4] !== 'Currency' ||
        $header[6] !== 'Payment Reference' ||
        $header[11] !== 'Payer Name'
      ) {
        fclose($handle);
        $this->pdo->rollBack();
        return false;
      }

      // get existing payment IDs to avoid duplicates
      $select_stmt = $this->pdo->prepare(<<<SQL
        SELECT id FROM payments
      SQL);
      $select_stmt->execute();
      $existingPayments = $select_stmt->fetchAll(PDO::FETCH_COLUMN, 0);

      // import each row
      while (($data = fgetcsv($handle)) !== false) {
        $id = $data[0];
        $datetime = $data[2];
        $amount = (int)((float)$data[3]*100);
        $currency = $data[4];
        $payment_reference = $data[6];
        $payer_name = $data[11];

        // ignore negative amounts
        if ($amount < 0) {
          continue;
        }

        // ignore duplicate IDs
        if (in_array($id, $existingPayments, true)) {
          continue;
        }

        $update_stmt->execute([
          'id' => $id,
          'datetime' => $datetime,
          'amount' => $amount,
          'currency' => $currency,
          'payment_reference' => $payment_reference,
          'payer_name' => $payer_name,
        ]);
      }
      fclose($handle);
    } else {
      $this->pdo->rollBack();
      return false;
    }

    $this->pdo->commit();
    return true;
  }
}

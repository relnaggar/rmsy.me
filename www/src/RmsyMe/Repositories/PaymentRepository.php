<?php

declare(strict_types=1);

namespace RmsyMe\Repositories;

use PDO;
use PDOException;
use RmsyMe\Services\Database;
use RmsyMe\Models\Payment;

class PaymentRepository extends AbstractRepository
{
  public function __construct(Database $databaseService)
  {
    parent::__construct($databaseService);
    $this->tableName = 'payments';
    $this->modelClass = Payment::class;
  }

  /**
   * Get all payments ordered by datetime descending.
   * 
   * @return Payment[] An array of Payment objects.
   * @throws PDOException If there is a database error.
   */
  #[\Override]
  public function selectAll(): array
  {
    $stmt = $this->pdo->prepare(<<<SQL
      SELECT *
      FROM {$this->tableName}
      ORDER BY datetime(datetime) DESC
    SQL);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_CLASS, Payment::class);

    return $results;
  }

  private function updateSequenceNumbers($years): void
  {
    $payments = $this->selectAll(); // ordered by datetime DESC
    $sequenceNumbers = [];
    foreach (array_reverse($payments) as $payment) { // oldest to newest
      $year = $payment->getYear();
      // skip years we don't care about
      if (!in_array($year, $years)) {
        continue;
      }

      // increment sequence number for year
      // works because we're processing oldest to newest
      if (!isset($sequenceNumbers[$year])) {
        $sequenceNumbers[$year] = 1;
      } else {
        $sequenceNumbers[$year]++;
      }

      // format sequence number as zero-padded 3-digit string
      $sequenceNumberStr = str_pad(
        (string)$sequenceNumbers[$year],
        3,
        '0',
        STR_PAD_LEFT,
      );

      // skip if sequence number already set correctly
      if ($payment->sequence_number === $sequenceNumberStr) {
        continue;
      }

      // otherwise, update sequence number in database
      $stmt = $this->pdo->prepare(<<<SQL
        UPDATE {$this->tableName}
        SET sequence_number = :sequence_number
        WHERE id = :id
      SQL);
      $stmt->execute([
        'sequence_number' => $sequenceNumberStr,
        'id' => $payment->id,
      ]);
    }
  }

  /**
   * Import payments from a CSV file into the payments table.
   * 
   * @param string $csvPath The path to the CSV file.
   * @return bool True on success, false on failure.
   * @throws PDOException If there is a database error.
   */
  public function importFromCsv(string $csvPath): bool
  {
    $this->pdo->beginTransaction();

    $insertIntoPayments = $this->pdo->prepare(<<<SQL
      INSERT INTO {$this->tableName} (
        id, datetime, amount_gbp_pence, currency, payment_reference, buyer_id
      )
      VALUES (
        :id,
        :datetime,
        :amount_gbp_pence,
        :currency,
        :payment_reference,
        :buyer_id
      )
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
        error_log(print_r($header, true));
        fclose($handle);
        $this->pdo->rollBack();
        return false;
      }

      // get existing payment IDs to avoid duplicates
      $selectFromPayments = $this->pdo->prepare(<<<SQL
        SELECT id
        FROM {$this->tableName}
      SQL);
      $selectFromPayments->execute();
      $existingPayments = $selectFromPayments->fetchAll(PDO::FETCH_COLUMN, 0);

      // prepare buyer insert statement
      $insertIntoBuyers = $this->pdo->prepare(<<<SQL
        INSERT OR IGNORE INTO buyers (id, name)
        VALUES (:id, :name)
      SQL);

      $years = [];
      // import each row
      while (($data = fgetcsv($handle)) !== false) {
        $id = $data[0];
        $datetime = $data[2];
        $amount_gbp_pence = (int)((float)$data[3]*100);
        $currency = $data[4];
        $payment_reference = $data[6];
        $buyer_name = $data[11];

        // ignore negative amounts
        if ($amount_gbp_pence < 0) {
          continue;
        }

        // ignore duplicate IDs
        if (in_array($id, $existingPayments, true)) {
          continue;
        }

        // add buyer to buyers table
        $insertIntoBuyers->execute([
          'id' => $buyer_name,
          'name' => $buyer_name,
        ]);

        $insertIntoPayments->execute([
          'id' => $id,
          'datetime' => $datetime,
          'amount_gbp_pence' => $amount_gbp_pence,
          'currency' => $currency,
          'payment_reference' => $payment_reference,
          'buyer_id' => $buyer_name,
        ]);

        // track years for sequence number updates
        $year = (new DateTime($datetime))->format('Y');
        if (!in_array($year, $years)) {
          $years[] = $year;
        }
      }

      $this->updateSequenceNumbers($years);
      fclose($handle);
    } else {
      $this->pdo->rollBack();
      return false;
    }

    $this->pdo->commit();
    return true;
  }

  /**
   * Find payments by sequence number.
   * 
   * @param string $sequence_number The sequence number to search for.
   * @return Payment[] An array of Payment objects.
   * @throws PDOException If there is a database error.
   */
  public function selectBySequenceNumber(string $sequence_number): array
  {
    $stmt = $this->pdo->prepare(<<<SQL
      SELECT *
      FROM {$this->tableName}
      WHERE sequence_number = :sequence_number
    SQL);
    $stmt->execute(['sequence_number' => $sequence_number]);
    $results = $stmt->fetchAll(PDO::FETCH_CLASS, Payment::class);
    return $results;
  }
}

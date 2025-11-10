<?php

declare(strict_types=1);

namespace RmsyMe\Services;

use PDO;
use PDOException;
use DateTime;
use Relnaggar\Veloz\{
  Views\Page,
  Controllers\AbstractController,
};
use RmsyMe\Models\{
  Payment,
  Payer,
};

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

  public function getDatabaseErrorPage(
    AbstractController $controller,
    PDOException $e,
  ): Page {
    http_response_code(500);
    error_log($e->getMessage());
    return $controller->getPage(
      fullBodyTemplatePath: 'Site/databaseError',
      templateVars: [
        'title' => 'Database Error',
        'metaRobots' => 'noindex, nofollow'
      ],
    );
  }

  /**
   * Get the user ID for the given email and password.
   * 
   * @param string $email The user's email address.
   * @param string $password The user's password.
   * @return ?int The user's ID if the email and password are valid, null otherwise.
   * @throws PDOException If there is a database error.
   */
  public function getUserId(string $email, string $password): ?int
  {
    $this->connect();

    $stmt = $this->pdo->prepare(<<<SQL
      SELECT id, password_hash
      FROM users
      WHERE email = :email
    SQL);
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password_hash'])) {
      return $user['id'];
    }

    return null;
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
      SELECT email
      FROM users
      WHERE id = :id
    SQL);
    $stmt->execute(['id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    return $user['email'];
  }

  /**
   * Check if a payer exists in the payers table.
   * 
   * @param string $payerId The payer's ID.
   * @return bool True if the payer exists, false otherwise.
   * @throws PDOException If there is a database error.
   */
  private function payerExists(string $payerId): bool
  {
    $this->connect();

    $stmt = $this->pdo->prepare(<<<SQL
      SELECT COUNT(*) as count
      FROM payers
      WHERE id = :id
    SQL);
    $stmt->execute(['id' => $payerId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    return $result['count'] > 0;
  }

  private function updateSequenceNumbers($years): void
  {
    $this->connect();

    $payments = $this->getPayments(); // ordered by datetime DESC
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
        UPDATE payments
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
  public function importPayments(string $csvPath): bool
  {
    $this->connect();

    $this->pdo->beginTransaction();

    $insertIntoPayments = $this->pdo->prepare(<<<SQL
      INSERT INTO payments (
        id, datetime, amount, currency, payment_reference, payer_id
      )
      VALUES (
        :id, :datetime, :amount, :currency, :payment_reference, :payer_name
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
        fclose($handle);
        $this->pdo->rollBack();
        return false;
      }

      // get existing payment IDs to avoid duplicates
      $selectFromPayments = $this->pdo->prepare(<<<SQL
        SELECT id
        FROM payments
      SQL);
      $selectFromPayments->execute();
      $existingPayments = $selectFromPayments->fetchAll(PDO::FETCH_COLUMN, 0);

      // prepare payer insert statement
      $insertIntoPayers = $this->pdo->prepare(<<<SQL
        INSERT INTO payers (id, name)
        VALUES (:id, :name)
      SQL);

      $years = [];
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

        // add payer to payers table
        if (!$this->payerExists($payer_name, $existingPayments)) {
          $insertIntoPayers->execute([
            'id' => $payer_name,
            'name' => $payer_name,
          ]);
        }

        $insertIntoPayments->execute([
          'id' => $id,
          'datetime' => $datetime,
          'amount' => $amount,
          'currency' => $currency,
          'payment_reference' => $payment_reference,
          'payer_name' => $payer_name,
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
   * Get all payments from the payments table ordered by datetime descending.
   * 
   * @return array An array of Payment objects.
   * @throws PDOException If there is a database error.
   */
  public function getPayments(): array
  {
    $this->connect();

    $stmt = $this->pdo->prepare(<<<SQL
      SELECT *
      FROM payments
      ORDER BY datetime DESC
    SQL);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_CLASS, Payment::class);

    return $results;
  }

  /**
   * Get a payer by their ID.
   * 
   * @param string $payerId The payer's ID.
   * @return ?Payer The Payer object if found, null otherwise.
   * @throws PDOException If there is a database error.
   */
  public function getPayer(string $payerId): ?Payer
  {
    $this->connect();

    $stmt = $this->pdo->prepare(<<<SQL
      SELECT *
      FROM payers
      WHERE id = :id
    SQL);
    $stmt->execute(['id' => $payerId]);
    $result = $stmt->fetchObject(Payer::class);

    if (!$result) {
      return null;
    }

    return $result;
  }

  /**
   * Update a payer in the payers table.
   * 
   * @param Payer $payer The Payer object to update.
   * @throws PDOException If there is a database error.
   */
  public function updatePayer(Payer $payer): void
  {
    $this->connect();

    $stmt = $this->pdo->prepare(<<<SQL
      UPDATE payers
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
      'id' => $payer->id,
      'name' => $payer->name,
      'address1' => $payer->address1 == '' ? null : $payer->address1,
      'address2' => $payer->address2 == '' ? null : $payer->address2,
      'address3' => $payer->address3 == '' ? null : $payer->address3,
      'town_city' => $payer->town_city == '' ? null : $payer->town_city,
      'state_province_county' => $payer->state_province_county == '' ?
        null : $payer->state_province_county,
      'zip_postal_code' => $payer->zip_postal_code == '' ? null : $payer->zip_postal_code,
      'country' => $payer->country,
      'extra' => $payer->extra == '' ? null : $payer->extra,
    ]);
  }

  /**
   * Check if an invoice exists based on its invoice number.
   * 
   * @param string $invoiceNumber The invoice number to check.
   * @return bool True if the invoice exists, false otherwise.
   * @throws PDOException If there is a database error.
   */
  public function doesInvoiceExist(string $invoiceNumber): bool
  {
    $this->connect();

    // basic validation of invoice number format
    if (strlen($invoiceNumber) !== 8 || $invoiceNumber[4] !== '-') {
      return false;
    }
    $yearString = substr($invoiceNumber, 0, 4);
    $sequence_number = substr($invoiceNumber, 5, 3);
    if (!is_numeric($yearString) || !is_numeric($sequence_number)) {
      return false;
    }

    // validate year range
    $year = (int)$yearString;
    if ($year < 2020 || $year > (int)date('Y')) {
      return false;
    }

    // find payments with matching sequence number
    $stmt = $this->pdo->prepare(<<<SQL
      SELECT *
      FROM payments
      WHERE sequence_number = :sequence_number
    SQL);
    $stmt->execute(['sequence_number' => $sequence_number]);
    $results = $stmt->fetchAll(PDO::FETCH_CLASS, Payment::class);

    // check if any matching payment matches the full invoice number
    foreach ($results as $payment) {
      if ($payment->getInvoiceNumber() === $invoiceNumber) {
        return true;
      }
    }
    return false;
  }

  public function generateInvoicePdf(string $invoiceNumber): string
  {
    // TODO: generate a proper PDF using dompdf
    $pdfContent = "%PDF-1.4\n";
    $pdfContent .= "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n";
    $pdfContent .= "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n";
    $pdfContent .= "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] ";
    $pdfContent .= "/Contents 4 0 R /Resources << >> >> endobj\n";
    $pdfContent .= "4 0 obj << /Length 44 >> stream\n";
    $pdfContent .= "BT /F1 24 Tf 100 700 Td (Invoice: $invoiceNumber) Tj ET\n";
    $pdfContent .= "endstream endobj\n";
    $pdfContent .= "xref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n";
    $pdfContent .= "0000000067 00000 n \n0000000123 00000 n \n0000000220 00000 n \n";
    $pdfContent .= "trailer << /Size 5 /Root 1 0 R >>\nstartxref\n300\n%%EOF";

    return $pdfContent;
  }
}

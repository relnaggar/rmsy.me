<?php

declare(strict_types=1);

namespace RmsyMe\Services;

use PDO;
use PDOException;
use DateTime;
use InvalidArgumentException;
use Dompdf\Dompdf;
use Dompdf\Options;
use PrinsFrank\Standards\{
  Country\CountryAlpha2,
  Language\LanguageAlpha2,
};
use Relnaggar\Veloz\{
  Views\Page,
  Controllers\AbstractController,
};
use RmsyMe\Models\{
  Payment,
  Buyer,
};
use RmsyMe\Services\Secrets;

class Database
{
  private ?PDO $pdo;
  private bool $databaseConnected;
  private Secrets $secrets;

  public function __construct(Secrets $secrets)
  {
    $this->secrets = $secrets;
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
   * Check if a buyer exists in the buyers table.
   * 
   * @param string $buyerId The buyer's ID.
   * @return bool True if the buyer exists, false otherwise.
   * @throws PDOException If there is a database error.
   */
  private function buyerExists(string $buyerId): bool
  {
    $this->connect();

    $stmt = $this->pdo->prepare(<<<SQL
      SELECT COUNT(*) as count
      FROM buyers
      WHERE id = :id
    SQL);
    $stmt->execute(['id' => $buyerId]);
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
        id, datetime, amount, currency, payment_reference, buyer_id
      )
      VALUES (
        :id, :datetime, :amount, :currency, :payment_reference, :buyer_name
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
        FROM payments
      SQL);
      $selectFromPayments->execute();
      $existingPayments = $selectFromPayments->fetchAll(PDO::FETCH_COLUMN, 0);

      // prepare buyer insert statement
      $insertIntoBuyers = $this->pdo->prepare(<<<SQL
        INSERT INTO buyers (id, name)
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
        $buyer_name = $data[11];

        // ignore negative amounts
        if ($amount < 0) {
          continue;
        }

        // ignore duplicate IDs
        if (in_array($id, $existingPayments, true)) {
          continue;
        }

        // add buyer to buyers table
        if (!$this->buyerExists($buyer_name, $existingPayments)) {
          $insertIntoBuyers->execute([
            'id' => $buyer_name,
            'name' => $buyer_name,
          ]);
        }

        $insertIntoPayments->execute([
          'id' => $id,
          'datetime' => $datetime,
          'amount' => $amount,
          'currency' => $currency,
          'payment_reference' => $payment_reference,
          'buyer_name' => $buyer_name,
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
      ORDER BY datetime(datetime) DESC
    SQL);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_CLASS, Payment::class);

    return $results;
  }

  /**
   * Get a buyer by their ID.
   * 
   * @param string $buyerId The buyer's ID.
   * @return ?Buyer The Buyer object if found, null otherwise.
   * @throws PDOException If there is a database error.
   */
  public function getBuyer(string $buyerId): ?Buyer
  {
    $this->connect();

    $stmt = $this->pdo->prepare(<<<SQL
      SELECT *
      FROM buyers
      WHERE id = :id
    SQL);
    $stmt->execute(['id' => $buyerId]);
    $result = $stmt->fetchObject(Buyer::class);

    if (!$result) {
      return null;
    }

    return $result;
  }

  /**
   * Update a buyer in the buyers table.
   * 
   * @param Buyer $buyer The Buyer object to update.
   * @throws PDOException If there is a database error.
   */
  public function updateBuyer(Buyer $buyer): void
  {
    $this->connect();

    $stmt = $this->pdo->prepare(<<<SQL
      UPDATE buyers
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

  public function formatCurrency(int $amountInCents, string $currency): string
  {
    $formattedAmount = number_format($amountInCents / 100, 2, '.', ',');
    if ($currency == 'GBP') {
      return 'GBP £' . $formattedAmount;
    } elseif ($currency == 'EUR') {
      return 'EUR €' . $formattedAmount;
    } else {
      throw new InvalidArgumentException('Unsupported currency: ' . $currency);
    }
  }

  /**
   * Update exchange rates from the external CSV source.
   *
   * @param string $dateOfInterest The date for which exchange rates are needed.
   *  In 'YYYY-MM-DD' format.
   * @throws PDOException If there is a database error.
   */
  public function updateExchangeRates(string $dateOfInterest): void
  {
    $csvUrl = 'https://www.bde.es/webbe/es/estadisticas/compartido/datos/csv/tc_1_1.csv';
    $csvContent = file_get_contents($csvUrl);
    if ($csvContent === false) {
      throw new PDOException('Failed to download exchange rate CSV file');
    }

    // hash the CSV content
    $csvHash = hash('sha256', $csvContent);

    // check against cached hash
    $cachePath = '/var/db/tc_1_1.csv.hash';
    if (file_exists($cachePath)) {
      $cachedHash = file_get_contents($cachePath);
      if ($csvHash === $cachedHash) {
        // no changes
        return;
      }
    }

    // cache miss so save the new hash and process the CSV
    file_put_contents($cachePath, $csvHash);

    $this->connect();

    $stmt = $this->pdo->prepare(<<<SQL
      INSERT INTO exchange_rates (date, gbpeur)
      VALUES (:date, :gbpeur)
      ON CONFLICT(date) DO UPDATE SET gbpeur = :gbpeur
    SQL);

    $monthMap = [
      'ENE' => '01',
      'FEB' => '02',
      'MAR' => '03',
      'ABR' => '04',
      'MAY' => '05',
      'JUN' => '06',
      'JUL' => '07',
      'AGO' => '08',
      'SEP' => '09',
      'OCT' => '10',
      'NOV' => '11',
      'DIC' => '12',
    ];
    $yearOfInterest = (int)substr($dateOfInterest, 0, 4);

    $lines = explode("\n", $csvContent);
    // fifth column is GBP to EUR exchange rate
    foreach ($lines as $line) {
      $fields = str_getcsv($line);
      if (count($fields) < 5 || !is_numeric($fields[4])) {
        // invalid line, skip
        continue;
      }

      // translate date e.g. "04 ENE 1999" to "1999-01-04"
      $dateParts = explode(' ', $fields[0]);
      if (count($dateParts) !== 3) {
        // invalid date, skip
        continue;
      }
      $year = $dateParts[2];
      if ((int)$year < $yearOfInterest) {
        // date is before year we care about, skip
        continue;
      }
      $day = str_pad($dateParts[0], 2, '0', STR_PAD_LEFT);
      $monthStr = strtoupper($dateParts[1]);
      if (!isset($monthMap[$monthStr])) {
        // invalid month, skip
        continue;
      }
      $month = $monthMap[$monthStr];
      $date = "$year-$month-$day";

      // insert or update exchange rate for the date
      $stmt->execute(['date' => $date, 'gbpeur' => $fields[4]]);
    }
  }

  /**
   * Get the exchange rate for GBP to EUR on a given date.
   *
   * @param string $date The date in 'YYYY-MM-DD' format.
   * @return int The exchange rate multiplied by 100,000 (e.g. 0.87540 becomes 87540).
   * @throws PDOException If there is a database error.
   */
  public function getExchangeRate(string $date): int
  {
    $this->connect();

    $this->updateExchangeRates($date);

    $exchange_rate = null;
    while ($exchange_rate === null) { // keep looking back until we find an exchange rate
      $stmt = $this->pdo->prepare(<<<SQL
        SELECT gbpeur
        FROM exchange_rates
        WHERE date = :date
        LIMIT 1
      SQL);
      $stmt->execute(['date' => $date]);
      $result = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($result) {
        $exchange_rate = (int)round($result['gbpeur'] * 100000);
      } else {
        // look back one day
        $dateTime = new DateTime($date);
        $dateTime->modify('-1 day');
        $date = $dateTime->format('Y-m-d');
      }
    }
    return $exchange_rate;
  }

  /**
   * Generate a PDF invoice for the given invoice number.
   * 
   * @param string $invoiceNumber The invoice number.
   * @return string The PDF content as a string.
   * @throws PDOException If there is a database error or any invoice data is
   * missing.
   */
  public function generateInvoicePdf(string $invoiceNumber): string
  {
    $this->connect();

    $sequence_number = substr($invoiceNumber, 5, 3);

    // find payments with matching sequence number
    $stmt = $this->pdo->prepare(<<<SQL
      SELECT *
      FROM payments
      WHERE sequence_number = :sequence_number
    SQL);
    $stmt->execute(['sequence_number' => $sequence_number]);
    $results = $stmt->fetchAll(PDO::FETCH_CLASS, Payment::class);

    // find the payment with the exact invoice number
    $payment = null;
    foreach ($results as $p) {
      if ($p->getInvoiceNumber() === $invoiceNumber) {
        // found the payment
        $payment = $p;
        break;
      }
    }
    if ($payment === null) {
      throw new PDOException('Invoice not found');
    }

    // find the buyer
    $buyer = $this->getBuyer($payment->buyer_id);
    if ($buyer === null) {
      throw new PDOException('Buyer not found');
    }

    $sellerAddress = array_map(
      fn($line) => trim($line),
      explode('|', $this->secrets->getSecret('SELLER_ADDRESS')),
    );
    $sellerAddress[5] = CountryAlpha2::from(
      $sellerAddress[5]
    )?->getNameInLanguage(
      LanguageAlpha2::Spanish_Castilian
    );

    $buyerAddress = array_merge([$buyer->name], array_filter(
      [
        $buyer->address1,
        $buyer->address2,
        $buyer->address3,
        $buyer->town_city,
        $buyer->state_province_county,
        $buyer->zip_postal_code,
        CountryAlpha2::from($buyer->country)?->getNameInLanguage(
          LanguageAlpha2::Spanish_Castilian
        ),
        $buyer->extra,
      ],
      fn($line) => $line !== null && $line !== ''
    ));

    $issue_date = $payment->getDate();
    $exchange_rate = $this->getExchangeRate($issue_date);
    $invoice = [
      'number' => $invoiceNumber,
      'issue_date' => $issue_date,
      'exchange_rate' => $exchange_rate,
      'notes' => "Factura exenta de IVA según artículo 20. Uno. 10º - Ley 37/1992",
    ];

    $qty = 1;
    $items = [
      [
        'date' => $issue_date,
        'service' => 'Clases online de informática',
        // 'student' => 'Example Student',
        // 'client' => 'Example Client',
        'qty' => $qty,
        'unit_price' => intdiv($payment->amount, $qty),
      ],
    ];

    $publicPath = dirname(__DIR__, 3) . '/html';

    $options = new Options();
    $options->set('isRemoteEnabled', true); // allow remote assets
    $options->set('defaultFont', 'DejaVu Sans');
    $options->set('chroot', $publicPath); // restrict file access to public path

    $dompdf = new Dompdf($options);
    $page = Page::withTemplate(
      templatePath: 'Client/invoice',
      templateVars: [
        'sellerAddress' => $sellerAddress,
        'buyerAddress' => $buyerAddress,
        'invoice' => $invoice,
        'items' => $items,
        'formatCurrency' => fn($amount, $currency) =>
          $this->formatCurrency($amount, $currency),
        'cssPath' => "file://$publicPath/css/invoice.css",
        // 'cssPath' => "/css/invoice.css",
      ],
    );
    // return $page->getHtmlContent();
    $dompdf->loadHtml($page->getHtmlContent());
    $dompdf->setPaper('A4', 'portrait');
    $dompdf->render();
    $pdfContent = $dompdf->output();

    return $pdfContent;
  }
}

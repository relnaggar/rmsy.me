<?php

declare(strict_types=1);

namespace RmsyMe\Repositories;

use DateTime;
use PDO;
use PDOException;
use RmsyMe\Services\DatabaseService;

class ExchangeRateRepository extends AbstractRepository
{
  public function __construct(DatabaseService $databaseService)
  {
    parent::__construct($databaseService);
    $this->tableName = 'exchange_rates';
  }

  /**
   * Import exchange rates from the external CSV source.
   *
   * @param string $dateOfInterest The date for which exchange rates are needed.
   *  In 'YYYY-MM-DD' format.
   * @throws PDOException If there is a database error.
   */
  public function importFromBde(string $dateOfInterest): void
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

    $stmt = $this->pdo->prepare(<<<SQL
      INSERT INTO {$this->tableName} (date, gbpeur)
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
   * Select the exchange rate for GBP to EUR on a given date.
   *
   * @param string $date The date in 'YYYY-MM-DD' format.
   * @return int The exchange rate multiplied by 100,000 (e.g. 0.87540 becomes 87540).
   * @throws PDOException If there is a database error.
   */
  public function selectByDate(string $date): int
  {
    $this->importFromBde($date);

    $exchange_rate = null;
    while ($exchange_rate === null) { // keep looking back until we find an exchange rate
      $stmt = $this->pdo->prepare(<<<SQL
        SELECT gbpeur
        FROM {$this->tableName}
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
}
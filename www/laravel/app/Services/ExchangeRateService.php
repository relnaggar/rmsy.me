<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ExchangeRate;
use DateTime;
use RuntimeException;

class ExchangeRateService
{
    private const BDE_CSV_URL = 'https://www.bde.es/webbe/es/estadisticas/compartido/datos/csv/tc_1_1.csv';

    private const MONTH_MAP = [
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

    public function importFromBde(string $dateOfInterest): void
    {
        $csvContent = file_get_contents(self::BDE_CSV_URL);
        if ($csvContent === false) {
            throw new RuntimeException('Failed to download exchange rate CSV file');
        }

        $csvHash = hash('sha256', $csvContent);

        $cachePath = storage_path('app/tc_1_1.csv.hash');
        if (file_exists($cachePath)) {
            $cachedHash = file_get_contents($cachePath);
            if ($csvHash === $cachedHash) {
                return;
            }
        }

        file_put_contents($cachePath, $csvHash);

        $yearOfInterest = (int) substr($dateOfInterest, 0, 4);

        $lines = explode("\n", $csvContent);
        foreach ($lines as $line) {
            $fields = str_getcsv($line);
            if (count($fields) < 5 || ! is_numeric($fields[4])) {
                continue;
            }

            $dateParts = explode(' ', $fields[0]);
            if (count($dateParts) !== 3) {
                continue;
            }

            $year = $dateParts[2];
            if ((int) $year < $yearOfInterest) {
                continue;
            }

            $day = str_pad($dateParts[0], 2, '0', STR_PAD_LEFT);
            $monthStr = strtoupper($dateParts[1]);
            if (! isset(self::MONTH_MAP[$monthStr])) {
                continue;
            }
            $month = self::MONTH_MAP[$monthStr];
            $date = "$year-$month-$day";

            ExchangeRate::upsert(
                ['date' => $date, 'gbpeur' => $fields[4]],
                ['date'],
                ['gbpeur'],
            );
        }
    }

    /**
     * Get the GBP/EUR exchange rate for a given date as an integer multiplied by 100,000.
     *
     * Walks backward day-by-day if no rate exists for the exact date.
     */
    public function getRateForDate(string $date): int
    {
        $this->importFromBde($date);

        $currentDate = $date;
        while (true) {
            $rate = ExchangeRate::where('date', $currentDate)->first();
            if ($rate) {
                return (int) round($rate->gbpeur * 100000);
            }

            $dateTime = new DateTime($currentDate);
            $dateTime->modify('-1 day');
            $currentDate = $dateTime->format('Y-m-d');
        }
    }
}

<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ExchangeRate;
use Illuminate\Support\Facades\DB;
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
     * Only imports from BDE if no rate can be found in the database.
     */
    public function getRateForDate(string $date): int
    {
        $rate = $this->lookupRate($date);
        if ($rate !== null) {
            return $rate;
        }

        $this->importFromBde($date);

        $rate = $this->lookupRate($date);
        if ($rate !== null) {
            return $rate;
        }

        throw new RuntimeException("No exchange rate found for date: $date");
    }

    /**
     * Look up the nearest exchange rate from the database, walking backward.
     */
    private function lookupRate(string $date): ?int
    {
        $rate = DB::table('exchange_rates')
            ->whereDate('date', '<=', $date)
            ->orderByDesc('date')
            ->value('gbpeur');

        if ($rate !== null) {
            return (int) round($rate * 100000);
        }

        return null;
    }
}

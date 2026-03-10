<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ExchangeRate;
use App\Models\Lesson;
use Carbon\Carbon;

class AnalyticsService
{
    /**
     * @return array{quarters: array, sources: list<string>}
     */
    public function getData(Carbon $lastFullWeekStart): array
    {
        [$weeks, $sources] = $this->processLessons();
        $quarters = $this->buildQuarters($weeks);
        $quarters = $this->expandAndAggregate($quarters, $lastFullWeekStart);

        $sources = array_keys($sources);
        sort($sources);

        return compact('quarters', 'sources');
    }

    private function processLessons(): array
    {
        $allRates = ExchangeRate::orderBy('date')->get();

        $lessons = Lesson::where('complete', true)
            ->where('datetime', '>=', '2026-01-01')
            ->with(['student', 'payments'])
            ->get();

        $weeks = [];
        $sources = [];

        foreach ($lessons as $lesson) {
            $source = ($lesson->student?->source !== null && $lesson->student->source !== '')
                ? $lesson->student->source
                : null;

            $rateDate = ($lesson->paid && $lesson->payments->isNotEmpty())
                ? $lesson->payments->first()->datetime->format('Y-m-d')
                : $lesson->datetime->format('Y-m-d');

            $rate = $allRates->last(fn ($r) => $r->date->format('Y-m-d') <= $rateDate);
            $eurCents = $rate !== null
                ? (int) ceil($lesson->price_gbp_pence / (float) $rate->gbpeur)
                : null;

            $weekStart = $lesson->datetime->copy()->startOfWeek();
            $weekKey = $weekStart->format('Y-m-d');

            if ($weekKey < '2026-01-01') {
                continue;
            }

            if (! isset($weeks[$weekKey])) {
                $weeks[$weekKey] = $this->emptyWeek();
            }

            $weeks[$weekKey]['lesson_count']++;
            $weeks[$weekKey]['gbp_pence'] += $lesson->price_gbp_pence;
            if ($eurCents !== null) {
                $weeks[$weekKey]['eur_cents'] += $eurCents;
            } else {
                $weeks[$weekKey]['eur_missing'] = true;
            }

            if ($source !== null) {
                $sources[$source] = true;

                if (! isset($weeks[$weekKey]['sources'][$source])) {
                    $weeks[$weekKey]['sources'][$source] = ['lesson_count' => 0, 'gbp_pence' => 0, 'eur_cents' => 0, 'eur_missing' => false];
                }
                $weeks[$weekKey]['sources'][$source]['lesson_count']++;
                $weeks[$weekKey]['sources'][$source]['gbp_pence'] += $lesson->price_gbp_pence;
                if ($eurCents !== null) {
                    $weeks[$weekKey]['sources'][$source]['eur_cents'] += $eurCents;
                } else {
                    $weeks[$weekKey]['sources'][$source]['eur_missing'] = true;
                }
            }
        }

        krsort($weeks);

        return [$weeks, $sources];
    }

    private function buildQuarters(array $weeks): array
    {
        $quarters = [];

        foreach ($weeks as $weekKey => $week) {
            $weekStart = Carbon::parse($weekKey);
            $trimestre = (int) ceil($weekStart->month / 3);
            $quarterKey = sprintf('%04d-T%d', $weekStart->year, $trimestre);

            if (! isset($quarters[$quarterKey])) {
                $quarters[$quarterKey] = [
                    'year' => $weekStart->year,
                    'trimestre' => $trimestre,
                    'eur_missing' => false,
                    'weeks' => [],
                ];
            }

            if ($week['eur_missing']) {
                $quarters[$quarterKey]['eur_missing'] = true;
            }

            $quarters[$quarterKey]['weeks'][$weekKey] = $week;
        }

        krsort($quarters);

        return $quarters;
    }

    private function expandAndAggregate(array $quarters, Carbon $lastFullWeekStart): array
    {
        foreach ($quarters as &$quarter) {
            $quarterStart = Carbon::create($quarter['year'], ($quarter['trimestre'] - 1) * 3 + 1, 1);
            $quarterEnd = Carbon::create($quarter['year'], $quarter['trimestre'] * 3, 1)->endOfMonth();

            $firstMonday = $quarterStart->copy()->startOfWeek(Carbon::MONDAY);
            if ($firstMonday->lt($quarterStart)) {
                $firstMonday->addWeek();
            }

            $effectiveEnd = $quarterEnd->lte($lastFullWeekStart) ? $quarterEnd : $lastFullWeekStart;

            $allWeeks = [];
            $current = $firstMonday->copy();
            while ($current->lte($effectiveEnd)) {
                $weekKey = $current->format('Y-m-d');
                $allWeeks[$weekKey] = $quarter['weeks'][$weekKey] ?? $this->emptyWeek();
                $current->addWeek();
            }

            // Include any lesson-data weeks not covered by the generated range
            foreach ($quarter['weeks'] as $weekKey => $weekData) {
                if (! isset($allWeeks[$weekKey]) && $weekKey <= $effectiveEnd->format('Y-m-d')) {
                    $allWeeks[$weekKey] = $weekData;
                }
            }

            krsort($allWeeks);
            $quarter['weeks'] = $allWeeks;

            ['total' => $quarter['total'], 'avg' => $quarter['avg']] = $this->aggregateWeeks($allWeeks);
        }
        unset($quarter);

        return $quarters;
    }

    private function emptyWeek(): array
    {
        return [
            'lesson_count' => 0,
            'gbp_pence' => 0,
            'eur_cents' => 0,
            'eur_missing' => false,
            'sources' => [],
        ];
    }

    private function aggregateWeeks(array $weeks): array
    {
        $total = $this->emptyWeek();

        foreach ($weeks as $week) {
            $total['lesson_count'] += $week['lesson_count'];
            $total['gbp_pence'] += $week['gbp_pence'];
            $total['eur_cents'] += $week['eur_cents'];
            if ($week['eur_missing']) {
                $total['eur_missing'] = true;
            }
            foreach ($week['sources'] as $source => $srcData) {
                if (! isset($total['sources'][$source])) {
                    $total['sources'][$source] = ['lesson_count' => 0, 'gbp_pence' => 0, 'eur_cents' => 0, 'eur_missing' => false];
                }
                $total['sources'][$source]['lesson_count'] += $srcData['lesson_count'];
                $total['sources'][$source]['gbp_pence'] += $srcData['gbp_pence'];
                $total['sources'][$source]['eur_cents'] += $srcData['eur_cents'];
                if ($srcData['eur_missing']) {
                    $total['sources'][$source]['eur_missing'] = true;
                }
            }
        }

        $weekCount = count($weeks);
        $avg = [
            'lesson_count' => $weekCount > 0 ? $total['lesson_count'] / $weekCount : 0.0,
            'gbp_pence' => $weekCount > 0 ? $total['gbp_pence'] / $weekCount : 0.0,
            'eur_cents' => $weekCount > 0 ? $total['eur_cents'] / $weekCount : 0.0,
            'eur_missing' => $total['eur_missing'],
            'sources' => [],
        ];
        foreach ($total['sources'] as $source => $srcTotal) {
            $avg['sources'][$source] = [
                'lesson_count' => $weekCount > 0 ? $srcTotal['lesson_count'] / $weekCount : 0.0,
                'gbp_pence' => $weekCount > 0 ? $srcTotal['gbp_pence'] / $weekCount : 0.0,
                'eur_cents' => $weekCount > 0 ? $srcTotal['eur_cents'] / $weekCount : 0.0,
                'eur_missing' => $srcTotal['eur_missing'],
            ];
        }

        return compact('total', 'avg');
    }
}

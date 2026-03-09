<?php

declare(strict_types=1);

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\ExchangeRate;
use App\Models\Lesson;
use Illuminate\View\View;

class AnalyticsController extends Controller
{
    public function index(): View
    {
        $allRates = ExchangeRate::orderBy('date')->get();

        $lessons = Lesson::where('complete', true)
            ->where('datetime', '>=', '2026-01-01')
            ->with(['student', 'payments'])
            ->get();

        $weeks = [];
        $weekToQuarter = [];
        $quarterMeta = [];
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

            $weekKey = $lesson->datetime->copy()->startOfWeek()->format('Y-m-d');

            if ($weekKey < '2026-01-01') {
                continue;
            }

            $trimestre = (int) ceil($lesson->datetime->month / 3);
            $quarterKey = sprintf('%04d-T%d', $lesson->datetime->year, $trimestre);

            $weekToQuarter[$weekKey] = $quarterKey;
            $quarterMeta[$quarterKey] = [
                'year' => $lesson->datetime->year,
                'trimestre' => $trimestre,
            ];

            if (! isset($weeks[$weekKey])) {
                $weeks[$weekKey] = [
                    'lesson_count' => 0,
                    'gbp_pence' => 0,
                    'eur_cents' => 0,
                    'eur_missing' => false,
                    'sources' => [],
                ];
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
                    $weeks[$weekKey]['sources'][$source] = [
                        'lesson_count' => 0,
                        'gbp_pence' => 0,
                        'eur_cents' => 0,
                        'eur_missing' => false,
                    ];
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

        $quarters = [];
        foreach ($weeks as $weekStart => $week) {
            $quarterKey = $weekToQuarter[$weekStart];

            if (! isset($quarters[$quarterKey])) {
                $quarters[$quarterKey] = [
                    'year' => $quarterMeta[$quarterKey]['year'],
                    'trimestre' => $quarterMeta[$quarterKey]['trimestre'],
                    'eur_missing' => false,
                    'weeks' => [],
                ];
            }

            if ($week['eur_missing']) {
                $quarters[$quarterKey]['eur_missing'] = true;
            }

            $quarters[$quarterKey]['weeks'][$weekStart] = $week;
        }

        krsort($quarters);

        $sources = array_keys($sources);
        sort($sources);

        return view('portal.analytics', [
            'quarters' => $quarters,
            'sources' => $sources,
        ]);
    }
}

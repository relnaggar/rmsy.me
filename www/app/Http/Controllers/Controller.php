<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;

abstract class Controller
{
    /**
     * Prepend a "- All -" option only when there are multiple entries.
     *
     * @param  array<int|string, string>  $options
     * @return array<int|string, string>
     */
    protected static function withAllOption(array $options): array
    {
        return count($options) > 1 ? ['' => '- All -'] + $options : $options;
    }

    /**
     * Resolve start/end date filter values, defaulting to the lesson date range on first visit.
     *
     * @return array{string, string}
     */
    protected function lessonDateDefaults(Request $request, ?string $min, ?string $max): array
    {
        $startDate = $request->has('start_date')
            ? (string) $request->query('start_date')
            : ($min ? \Carbon\Carbon::parse($min)->format('Y-m-d') : '');

        $endDate = $request->has('end_date')
            ? (string) $request->query('end_date')
            : ($max ? \Carbon\Carbon::parse($max)->format('Y-m-d') : '');

        return [$startDate, $endDate];
    }

    /**
     * Apply date range WHERE clauses to a lesson query.
     *
     * @param  Builder<\App\Models\Lesson>  $query
     */
    protected function applyLessonDateFilters(Builder|Relation $query, string $startDate, string $endDate): void
    {
        if ($startDate !== '') {
            $query->where('datetime', '>=', $startDate.' 00:00:00');
        }
        if ($endDate !== '') {
            $query->where('datetime', '<=', $endDate.' 23:59:59');
        }
    }

    /**
     * Apply complete status WHERE clause to a lesson query.
     *
     * @param  Builder<\App\Models\Lesson>  $query
     */
    protected function applyLessonCompleteFilter(Builder|Relation $query, string $completeFilter): void
    {
        if ($completeFilter === 'incomplete') {
            $query->where('complete', false);
        } elseif ($completeFilter === 'complete') {
            $query->where('complete', true);
        }
    }
}

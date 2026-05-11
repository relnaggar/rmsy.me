<?php

declare(strict_types=1);

namespace App\Data;

use App\Models\Lesson;
use Carbon\Carbon;

/**
 * A calendar event parsed from Microsoft Graph and normalised for lesson
 * import: timezone resolved to {@see Lesson::TIMEZONE}, names and IDs
 * extracted from the subject line.
 */
final class CalendarEvent
{
    public function __construct(
        public readonly Carbon $startDatetime,
        public readonly int $durationMinutes,
        public readonly int $repeatWeeks,
        public readonly int $priceGbpPence,
        public readonly string $source,
        public readonly string $studentName,
        public readonly string $clientName,
    ) {
    }
}

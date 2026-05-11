<?php

declare(strict_types=1);

namespace App\Casts;

use App\Models\Lesson;
use Carbon\Carbon;
use DateTimeInterface;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

/**
 * Casts the lesson `datetime` column as a Carbon in UK time. Stored values
 * are naive wallclock strings in `Europe/London`; reads always come back
 * as Carbon instances with that timezone.
 *
 * @implements CastsAttributes<Carbon, Carbon|DateTimeInterface|string>
 */
class LessonDateTime implements CastsAttributes
{
    public function get(Model $model, string $key, mixed $value, array $attributes): ?Carbon
    {
        if ($value === null) {
            return null;
        }

        return Carbon::parse($value, Lesson::TIMEZONE);
    }

    public function set(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        if ($value === null) {
            return null;
        }

        $carbon = $value instanceof DateTimeInterface
            ? Carbon::instance($value)
            : Carbon::parse($value, Lesson::TIMEZONE);

        return $carbon->copy()->setTimezone(Lesson::TIMEZONE)->format('Y-m-d H:i:s');
    }
}

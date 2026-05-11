<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\LessonDateTime;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Lesson extends Model
{
    use HasFactory;

    public const TIMEZONE = 'Europe/London';

    public $timestamps = false;

    protected $fillable = [
        'description',
        'datetime',
        'duration_minutes',
        'repeat_weeks',
        'price_gbp_pence',
        'paid',
        'complete',
        'student_id',
        'client_id',
        'buyer_id',
    ];

    protected function casts(): array
    {
        return [
            'datetime' => LessonDateTime::class,
            'duration_minutes' => 'integer',
            'repeat_weeks' => 'integer',
            'price_gbp_pence' => 'integer',
            'paid' => 'boolean',
            'complete' => 'boolean',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(Buyer::class);
    }

    public function payments(): BelongsToMany
    {
        return $this->belongsToMany(Payment::class);
    }

    public function getFormattedPrice(): string
    {
        return penceToPounds($this->price_gbp_pence);
    }

    public function getFormattedDatetime(): string
    {
        return $this->datetime->format('Y-m-d D H:i');
    }

    public function getFormattedTimeRange(): string
    {
        $end = $this->datetime->copy()->addMinutes($this->duration_minutes);

        return $this->getFormattedDatetime().'-'.$end->format('H:i');
    }

    public function getEndDatetime(): Carbon
    {
        return $this->datetime->copy()->addMinutes($this->duration_minutes);
    }

    public function getSpanishDescription(): string
    {
        $descriptions = config('lessons.spanish_descriptions', []);

        return $descriptions[$this->description] ?? $this->description;
    }
}

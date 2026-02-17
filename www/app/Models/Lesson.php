<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Lesson extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'description',
        'datetime',
        'duration_minutes',
        'repeat_weeks',
        'price_gbp_pence',
        'paid',
        'student_id',
        'client_id',
        'buyer_id',
    ];

    protected function casts(): array
    {
        return [
            'datetime' => 'datetime',
            'duration_minutes' => 'integer',
            'repeat_weeks' => 'integer',
            'price_gbp_pence' => 'integer',
            'paid' => 'boolean',
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

    private const SPANISH_DESCRIPTIONS = [
        'Online computer science classes' => 'Clases online de informática',
    ];

    public function getSpanishDescription(): string
    {
        return self::SPANISH_DESCRIPTIONS[$this->description] ?? $this->description;
    }
}

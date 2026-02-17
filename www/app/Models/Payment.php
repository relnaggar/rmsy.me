<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Payment extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'datetime',
        'amount_gbp_pence',
        'currency',
        'payment_reference',
        'payer',
        'buyer_id',
        'sequence_number',
        'lesson_pending',
    ];

    protected function casts(): array
    {
        return [
            'datetime' => 'datetime',
            'amount_gbp_pence' => 'integer',
            'lesson_pending' => 'boolean',
        ];
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(Buyer::class);
    }

    public function getDate(): string
    {
        return $this->datetime->format('Y-m-d');
    }

    public function getYear(): int
    {
        return (int) $this->datetime->format('Y');
    }

    public function getInvoiceNumber(): ?string
    {
        if ($this->sequence_number === null) {
            return null;
        }

        return $this->getYear().'-'.$this->sequence_number;
    }

    public function getFormattedAmount(): string
    {
        return penceToPounds($this->amount_gbp_pence);
    }

    public function lessons(): BelongsToMany
    {
        return $this->belongsToMany(Lesson::class);
    }

    public function getMatchedTotal(): int
    {
        return (int) $this->lessons->sum('price_gbp_pence');
    }

    public function getRemainingAmount(): int
    {
        return $this->amount_gbp_pence - $this->getMatchedTotal();
    }

    public function isFullyMatched(): bool
    {
        return $this->lessons->isNotEmpty() && $this->getMatchedTotal() === $this->amount_gbp_pence;
    }

    public function isPartiallyMatched(): bool
    {
        return $this->lessons->isNotEmpty() && $this->getMatchedTotal() < $this->amount_gbp_pence;
    }

    public function previousForBuyer(): ?self
    {
        if (! $this->buyer_id) {
            return null;
        }

        return static::where('buyer_id', $this->buyer_id)
            ->where('datetime', '<', $this->datetime)
            ->orderBy('datetime', 'desc')
            ->first();
    }

    public function nextForBuyer(): ?self
    {
        if (! $this->buyer_id) {
            return null;
        }

        return static::where('buyer_id', $this->buyer_id)
            ->where('datetime', '>', $this->datetime)
            ->orderBy('datetime', 'asc')
            ->first();
    }
}

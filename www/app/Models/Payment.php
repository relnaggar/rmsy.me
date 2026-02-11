<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
        'buyer_id',
        'sequence_number',
    ];

    protected function casts(): array
    {
        return [
            'datetime' => 'datetime',
            'amount_gbp_pence' => 'integer',
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
        $amount = $this->amount_gbp_pence / 100;

        return number_format($amount, 2);
    }
}

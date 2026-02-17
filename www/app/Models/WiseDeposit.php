<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WiseDeposit extends Model
{
    protected $fillable = [
        'amount_cents',
        'currency',
        'occurred_at',
    ];

    protected function casts(): array
    {
        return [
            'occurred_at' => 'datetime',
        ];
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExchangeRate extends Model
{
    protected $primaryKey = 'date';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'date',
        'gbpeur',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'gbpeur' => 'decimal:5',
        ];
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use PrinsFrank\Standards\Country\CountryAlpha2;
use PrinsFrank\Standards\Language\LanguageAlpha2;

class Buyer extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'name',
        'address1',
        'address2',
        'address3',
        'town_city',
        'state_province_county',
        'zip_postal_code',
        'country',
        'extra',
    ];

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class);
    }

    public function getCountryName(): string
    {
        $countryAlpha2 = CountryAlpha2::tryFrom($this->country);

        return $countryAlpha2?->getNameInLanguage(LanguageAlpha2::English) ?? $this->country;
    }
}

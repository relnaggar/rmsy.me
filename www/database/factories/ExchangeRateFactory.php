<?php

namespace Database\Factories;

use App\Models\ExchangeRate;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ExchangeRate> */
class ExchangeRateFactory extends Factory
{
    public function definition(): array
    {
        return [
            'date' => fake()->unique()->date(),
            'gbpeur' => fake()->randomFloat(5, 0.80, 0.90),
        ];
    }
}

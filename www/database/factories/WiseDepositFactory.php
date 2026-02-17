<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\WiseDeposit;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<WiseDeposit> */
class WiseDepositFactory extends Factory
{
    public function definition(): array
    {
        return [
            'amount_cents' => fake()->numberBetween(1000, 50000),
            'currency' => 'GBP',
            'occurred_at' => fake()->dateTimeBetween('-1 month', 'now'),
        ];
    }
}

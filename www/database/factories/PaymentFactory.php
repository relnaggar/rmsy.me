<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Payment> */
class PaymentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'id' => fake()->unique()->slug(),
            'datetime' => fake()->dateTimeBetween('-1 year', '+1 year'),
            'amount_gbp_pence' => 5000,
            'currency' => 'GBP',
            'payment_reference' => 'ref',
        ];
    }
}

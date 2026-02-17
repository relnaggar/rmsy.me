<?php

namespace Database\Factories;

use App\Models\Buyer;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Buyer> */
class BuyerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'id' => fake()->unique()->slug(),
            'name' => fake()->company(),
        ];
    }
}

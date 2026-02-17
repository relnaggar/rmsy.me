<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Lesson;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Lesson> */
class LessonFactory extends Factory
{
    public function definition(): array
    {
        return [
            'datetime' => fake()->unique()->dateTimeBetween('-1 year', '+1 year'),
            'price_gbp_pence' => 5000,
        ];
    }
}

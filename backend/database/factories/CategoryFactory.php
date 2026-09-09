<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->randomElement([
            'Information Technology', 'Banking & Finance', 'Sales & Marketing',
            'Engineering', 'Healthcare', 'Human Resources', 'Design', 'Operations',
        ]);

        return [
            'type' => fake()->randomElement(['course', 'job']),
            'name' => $name,
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }

    public function course(): static
    {
        return $this->state(fn () => ['type' => 'course']);
    }

    public function job(): static
    {
        return $this->state(fn () => ['type' => 'job']);
    }
}

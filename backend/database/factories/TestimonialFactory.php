<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Testimonial>
 */
class TestimonialFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'role_title' => fake()->jobTitle(),
            'company' => fake()->company(),
            'quote' => fake()->paragraph(3),
            'rating' => fake()->numberBetween(4, 5),
            'is_featured' => fake()->boolean(40),
            'is_active' => true,
            'sort_order' => fake()->numberBetween(0, 10),
        ];
    }
}

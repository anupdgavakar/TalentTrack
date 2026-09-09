<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Course>
 */
class CourseFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->unique()->words(3, true);

        return [
            'category_id' => Category::factory()->course(),
            'title' => ucwords($title),
            'short_description' => fake()->sentence(12),
            'description' => fake()->paragraphs(3, true),
            'duration' => fake()->randomElement(['4 weeks', '6 weeks', '3 months', '6 months']),
            'level' => fake()->randomElement(['beginner', 'intermediate', 'advanced']),
            'mode' => fake()->randomElement(['online', 'offline', 'hybrid']),
            'fee' => fake()->randomElement([4999, 9999, 14999, 24999]),
            'syllabus' => fake()->paragraphs(2, true),
            'is_featured' => fake()->boolean(30),
            'is_active' => true,
        ];
    }
}

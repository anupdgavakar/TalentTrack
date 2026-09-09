<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\JobPosting>
 */
class JobPostingFactory extends Factory
{
    public function definition(): array
    {
        $min = fake()->numberBetween(3, 12) * 10000;

        return [
            'category_id' => Category::factory()->job(),
            'title' => fake()->jobTitle(),
            'company_name' => fake()->company(),
            'location' => fake()->city(),
            'job_type' => fake()->randomElement(['full_time', 'part_time', 'internship', 'contract']),
            'experience_level' => fake()->randomElement(['0-1 years', '1-3 years', '3-5 years', '5+ years']),
            'salary_min' => $min,
            'salary_max' => $min + fake()->numberBetween(1, 6) * 10000,
            'description' => fake()->paragraphs(3, true),
            'requirements' => fake()->paragraphs(2, true),
            'listing_type' => fake()->randomElement(['placement', 'recruitment']),
            'is_featured' => fake()->boolean(30),
            'is_active' => true,
            'closing_date' => fake()->dateTimeBetween('+2 weeks', '+3 months'),
        ];
    }
}

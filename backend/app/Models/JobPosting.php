<?php

namespace App\Models;

use App\Models\Concerns\HasSlug;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobPosting extends Model
{
    use HasFactory, HasSlug;

    protected $fillable = [
        'category_id',
        'title',
        'slug',
        'company_name',
        'location',
        'job_type',
        'experience_level',
        'salary_min',
        'salary_max',
        'description',
        'requirements',
        'listing_type',
        'is_featured',
        'is_active',
        'closing_date',
    ];

    protected function casts(): array
    {
        return [
            'salary_min' => 'decimal:2',
            'salary_max' => 'decimal:2',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'closing_date' => 'date',
        ];
    }

    /**
     * @return BelongsTo<Category, JobPosting>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return HasMany<JobApplication>
     */
    public function applications(): HasMany
    {
        return $this->hasMany(JobApplication::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Phase 15 QA fix: `active()` alone only checked the `is_active` flag —
     * `closing_date` was captured on the admin form and shown as SEO
     * `validThrough` metadata, but nothing actually stopped a posting from
     * staying live and accepting new applications after its closing date
     * passed (an admin had to remember to flip `is_active` off by hand).
     * `open()` is what the public listing/detail endpoints and the
     * application-eligibility check (see JobApplicationRequest) use
     * instead: active AND (no closing date set, or it hasn't passed yet).
     */
    public function scopeOpen(Builder $query): Builder
    {
        return $query->active()->where(
            fn (Builder $q) => $q->whereNull('closing_date')->orWhere('closing_date', '>=', now()->toDateString())
        );
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    public function scopePlacement(Builder $query): Builder
    {
        return $query->where('listing_type', 'placement');
    }

    public function scopeRecruitment(Builder $query): Builder
    {
        return $query->where('listing_type', 'recruitment');
    }
}

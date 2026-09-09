<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * An admin-editable block of content on the About or Contact page. See the
 * create_page_sections_table migration for the full design rationale and
 * frontend/src/utils/pageSectionKeys.js for the list of valid `section_key`
 * values, what each one feeds, and whether it's meant to be a singleton or
 * repeatable slot.
 */
class PageSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'page',
        'section_key',
        'icon',
        'title',
        'subtitle',
        'body',
        'image',
        'primary_label',
        'primary_url',
        'secondary_label',
        'secondary_url',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function scopeForPage(Builder $query, string $page): Builder
    {
        return $query->where('page', $page);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)->orderBy('section_key')->orderBy('sort_order');
    }
}

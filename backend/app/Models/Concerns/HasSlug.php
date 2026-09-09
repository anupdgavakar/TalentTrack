<?php

namespace App\Models\Concerns;

use Illuminate\Support\Str;

/**
 * Auto-generates a unique `slug` from the model's `title` (falling back to
 * `name`) when one isn't set explicitly before create. Kept as a small
 * local trait rather than pulling in a slug package, to keep the composer
 * dependency list minimal.
 */
trait HasSlug
{
    protected static function bootHasSlug(): void
    {
        static::creating(function ($model) {
            if (! empty($model->slug)) {
                return;
            }

            $source = $model->title ?? $model->name ?? null;

            if (! $source) {
                return;
            }

            $base = Str::slug($source);
            $slug = $base;
            $suffix = 1;

            while (static::where('slug', $slug)->exists()) {
                $suffix++;
                $slug = "{$base}-{$suffix}";
            }

            $model->slug = $slug;
        });
    }
}

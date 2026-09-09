<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
    ];

    /**
     * Keys the public API (GET /api/settings/public) is allowed to expose —
     * everything else (e.g. admin_notification_email) is admin-only via
     * GET /api/admin/settings. Add new public-facing keys here explicitly
     * rather than exposing the whole table by default.
     */
    public const PUBLIC_KEYS = [
        'footer_address',
        'footer_phone',
        'footer_email',
        'social_facebook_url',
        'social_instagram_url',
        'social_linkedin_url',
        'social_youtube_url',
    ];

    /**
     * Read one setting by key, cached, with a sensible default when unset.
     * The write-through cache is cleared automatically whenever a setting
     * is saved or deleted (see booted() below), so admin edits (Phase 9)
     * take effect immediately.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::rememberForever("setting:{$key}", function () use ($key, $default) {
            return static::where('key', $key)->value('value') ?? $default;
        });
    }

    public static function set(string $key, ?string $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
    }

    protected static function booted(): void
    {
        static::saved(fn (self $setting) => Cache::forget("setting:{$setting->key}"));
        static::deleted(fn (self $setting) => Cache::forget("setting:{$setting->key}"));
    }
}

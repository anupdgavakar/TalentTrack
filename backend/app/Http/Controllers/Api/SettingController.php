<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    /**
     * Public, whitelisted subset (footer contact details, social links) —
     * see Setting::PUBLIC_KEYS. Everything else lives behind
     * GET /api/admin/settings.
     */
    public function publicIndex(): JsonResponse
    {
        $settings = Setting::whereIn('key', Setting::PUBLIC_KEYS)
            ->pluck('value', 'key');

        return $this->success($settings);
    }
}

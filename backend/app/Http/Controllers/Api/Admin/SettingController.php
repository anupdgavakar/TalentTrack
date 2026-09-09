<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        return $this->success(Setting::pluck('value', 'key'));
    }

    public function update(UpdateSettingsRequest $request): JsonResponse
    {
        foreach ($request->validated('settings') as $key => $value) {
            Setting::set($key, $value);
        }

        return $this->success(Setting::pluck('value', 'key'), 'Settings updated.');
    }
}

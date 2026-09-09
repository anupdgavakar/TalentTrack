<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Bulk update: { "settings": { "footer_phone": "+91 ...", "footer_email": "..." } }
 * Any known key can be sent; unknown keys are simply created (see
 * Admin\SettingController::update) — there's no fixed schema to keep in
 * sync here beyond what Setting::PUBLIC_KEYS already documents for the
 * public-facing subset.
 */
class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'settings' => ['required', 'array'],
            'settings.*' => ['nullable', 'string', 'max:2000'],
        ];
    }
}

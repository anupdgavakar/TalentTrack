<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Backs the general Contact form as well as the Recruitment ("we need to
 * hire") and Consulting booking-request forms — `type` is what tells them
 * apart, and is set by the frontend per page (e.g. the Recruitment page
 * always sends type=recruitment).
 */
class LeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['recruitment', 'consulting', 'training', 'placement', 'general'])],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'company' => ['nullable', 'string', 'max:255'],
            'message' => ['nullable', 'string', 'max:2000'],
            'source' => ['nullable', 'string', 'max:100'],
        ];
    }
}

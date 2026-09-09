<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class BannerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'eyebrow' => ['nullable', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => [$this->isMethod('POST') ? 'required' : 'nullable', 'image', 'max:2048'],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'primary_cta_label' => ['nullable', 'string', 'max:100'],
            'primary_cta_url' => ['nullable', 'string', 'max:255'],
            'secondary_cta_label' => ['nullable', 'string', 'max:100'],
            'secondary_cta_url' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}

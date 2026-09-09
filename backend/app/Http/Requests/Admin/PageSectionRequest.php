<?php

namespace App\Http\Requests\Admin;

use App\Support\PageSectionKeys;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class PageSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // gated by the 'auth:sanctum' + 'admin' route middleware
    }

    public function rules(): array
    {
        return [
            'page' => ['required', Rule::in(PageSectionKeys::PAGES)],
            'section_key' => ['required', 'string'],
            'icon' => ['nullable', 'string', 'max:50'],
            'title' => ['nullable', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:500'],
            'body' => ['nullable', 'string', 'max:2000'],
            // Never required — unlike a Banner, most section_keys don't use
            // an image at all, and even the ones that do (about.intro,
            // contact.get_in_touch) are meant to look fine with it absent
            // until an admin uploads a real photo (see PageSectionResource
            // and the frontend's conditional rendering).
            'image' => ['nullable', 'image', 'max:2048'],
            'primary_label' => ['nullable', 'string', 'max:100'],
            'primary_url' => ['nullable', 'string', 'max:255'],
            'secondary_label' => ['nullable', 'string', 'max:100'],
            'secondary_url' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * `section_key` is only valid *for the page it was submitted with* —
     * plain `Rule::in` can't express that cross-field relationship, so it's
     * checked here instead. This is what stops a typo'd or copy-pasted
     * request from creating a row that matches neither page's template and
     * would silently never render anywhere.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $page = $this->input('page');
            $key = $this->input('section_key');

            if ($page && $key && ! in_array($key, PageSectionKeys::allKeysFor($page), true)) {
                $validator->errors()->add('section_key', "\"{$key}\" isn't a valid section for the {$page} page.");
            }
        });
    }
}

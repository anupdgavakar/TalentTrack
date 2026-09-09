<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // gated by the 'auth:sanctum' + 'admin' route middleware
    }

    public function rules(): array
    {
        $categoryId = $this->route('category')?->id;

        return [
            'type' => ['required', Rule::in(['course', 'job'])],
            // Phase 13 bug fix: this was unscoped ("IT" as a course
            // category blocked "IT" as an unrelated job category, a real
            // and fairly common collision), even though the database only
            // enforces uniqueness on slug, not name (see
            // create_categories_table.php) — names only need to be unique
            // within their own type.
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name')->where('type', $this->input('type'))->ignore($categoryId),
            ],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('categories', 'slug')->ignore($categoryId)],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}

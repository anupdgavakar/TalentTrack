<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $courseId = $this->route('course')?->id;

        return [
            'category_id' => ['nullable', 'integer', Rule::exists('categories', 'id')->where('type', 'course')],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('courses', 'slug')->ignore($courseId)],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'duration' => ['nullable', 'string', 'max:100'],
            'level' => ['nullable', Rule::in(['beginner', 'intermediate', 'advanced'])],
            'mode' => ['nullable', Rule::in(['online', 'offline', 'hybrid'])],
            'fee' => ['nullable', 'numeric', 'min:0'],
            'image' => ['nullable', 'image', 'max:2048'],
            'syllabus' => ['nullable', 'string'],
            'is_featured' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}

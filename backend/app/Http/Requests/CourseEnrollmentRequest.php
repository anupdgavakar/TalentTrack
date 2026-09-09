<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CourseEnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // public enquiry form — guest or logged-in candidate
    }

    public function rules(): array
    {
        return [
            // Phase 13 bug fix: this used to be a bare `exists:courses,id`,
            // which only checked the row exists — not that it's active. A
            // draft course (is_active=false, not yet linked from any public
            // page) still has a guessable sequential ID, and this endpoint
            // would happily accept an enrollment against it. Scoping the
            // exists check to active courses makes a draft course behave
            // like it doesn't exist yet, which is what "draft" should mean.
            'course_id' => [
                'required',
                'integer',
                Rule::exists('courses', 'id')->where('is_active', true),
            ],
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'message' => ['nullable', 'string', 'max:2000'],
        ];
    }
}

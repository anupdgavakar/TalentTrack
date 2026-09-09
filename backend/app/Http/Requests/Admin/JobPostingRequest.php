<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class JobPostingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $jobId = $this->route('job_posting')?->id;

        return [
            'category_id' => ['nullable', 'integer', Rule::exists('categories', 'id')->where('type', 'job')],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('job_postings', 'slug')->ignore($jobId)],
            'company_name' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'job_type' => ['required', Rule::in(['full_time', 'part_time', 'internship', 'contract'])],
            'experience_level' => ['nullable', 'string', 'max:100'],
            'salary_min' => ['nullable', 'numeric', 'min:0'],
            'salary_max' => ['nullable', 'numeric', 'min:0', 'gte:salary_min'],
            'description' => ['required', 'string'],
            'requirements' => ['nullable', 'string'],
            'listing_type' => ['required', Rule::in(['placement', 'recruitment'])],
            'is_featured' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'closing_date' => ['nullable', 'date'],
        ];
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class JobApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // public application form — guest or logged-in candidate
    }

    public function rules(): array
    {
        return [
            // Phase 13 bug fix — see the matching comment in
            // CourseEnrollmentRequest.php: scoped to active postings only,
            // so a draft job posting can't be applied to via a guessed ID.
            // Phase 15 QA fix: also excludes a posting whose closing_date
            // has passed — previously `is_active` alone was checked here,
            // so a job an admin considered "closed" (but hadn't manually
            // deactivated) kept accepting applications indefinitely. Same
            // "open" definition as JobPosting::scopeOpen().
            'job_posting_id' => [
                'required',
                'integer',
                Rule::exists('job_postings', 'id')->where(
                    fn ($query) => $query->where('is_active', true)
                        ->where(fn ($q) => $q->whereNull('closing_date')->orWhere('closing_date', '>=', now()->toDateString()))
                ),
            ],
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'resume' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
            'cover_note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\JobApplicationRequest;
use App\Http\Resources\JobApplicationResource;
use App\Models\JobApplication;
use App\Services\AdminNotifier;
use Illuminate\Http\JsonResponse;

class JobApplicationController extends Controller
{
    public function store(JobApplicationRequest $request): JsonResponse
    {
        $data = $request->safe()->except('resume');

        $application = JobApplication::create([
            ...$data,
            'user_id' => $request->user()?->id,
            'resume_path' => $request->file('resume')?->store('resumes', 'public'),
        ]);

        AdminNotifier::send(
            heading: 'New job application: '.$application->full_name,
            intro: 'Someone just applied for a role from the public site.',
            fields: [
                'Job' => $application->jobPosting?->title,
                'Name' => $application->full_name,
                'Email' => $application->email,
                'Phone' => $application->phone,
                'Resume attached' => $application->resume_path ? 'Yes' : 'No',
                'Cover note' => $application->cover_note,
            ],
            ctaLabel: 'View in Applications',
            ctaUrl: config('app.frontend_url').'/admin/applications',
        );

        return $this->created(
            new JobApplicationResource($application),
            'Application submitted — our placement team will review it and reach out if there\'s a match.'
        );
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CourseEnrollmentRequest;
use App\Http\Resources\CourseEnrollmentResource;
use App\Models\CourseEnrollment;
use App\Services\AdminNotifier;
use Illuminate\Http\JsonResponse;

class CourseEnrollmentController extends Controller
{
    public function store(CourseEnrollmentRequest $request): JsonResponse
    {
        $enrollment = CourseEnrollment::create([
            ...$request->validated(),
            'user_id' => $request->user()?->id,
        ]);

        AdminNotifier::send(
            heading: 'New course enrollment: '.$enrollment->full_name,
            intro: 'Someone just enrolled in a course from the public site.',
            fields: [
                'Course' => $enrollment->course?->title,
                'Name' => $enrollment->full_name,
                'Email' => $enrollment->email,
                'Phone' => $enrollment->phone,
                'Message' => $enrollment->message,
            ],
            ctaLabel: 'View in Enrollments',
            ctaUrl: config('app.frontend_url').'/admin/enrollments',
        );

        return $this->created(
            new CourseEnrollmentResource($enrollment),
            'Thanks — we\'ve received your enrollment enquiry and will be in touch shortly.'
        );
    }
}

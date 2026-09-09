<?php

namespace App\Http\Controllers\Api\Candidate;

use App\Http\Controllers\Controller;
use App\Http\Resources\CourseEnrollmentResource;
use App\Http\Resources\JobApplicationResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Backs the candidate-facing "My Dashboard" page (Phase 8) — a logged-in
 * candidate's own enrollment and application history. Unlike the admin
 * dashboard this is scoped to `auth:sanctum` only (no `admin` middleware):
 * any authenticated user can see their own records, which for an admin
 * account will simply come back empty.
 *
 * Deliberately unpaginated — a candidate's own history is a handful of
 * rows at most, not worth the complexity `Api\Admin\*` list endpoints take
 * on for potentially thousands of records across all users.
 */
class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $enrollments = $user->courseEnrollments()->with('course')->latest()->get();
        $applications = $user->jobApplications()->with('jobPosting')->latest()->get();

        return $this->success([
            'enrollments' => CourseEnrollmentResource::collection($enrollments),
            'applications' => JobApplicationResource::collection($applications),
        ]);
    }
}

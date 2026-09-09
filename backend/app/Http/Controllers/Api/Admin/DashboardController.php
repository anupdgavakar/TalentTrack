<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CourseEnrollmentResource;
use App\Http\Resources\JobApplicationResource;
use App\Models\Category;
use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\JobApplication;
use App\Models\JobPosting;
use Illuminate\Http\JsonResponse;

/**
 * Backs the admin Dashboard screen with a single request instead of the
 * 6-7+ separate ones an equivalent naive implementation would make (a count
 * per domain, a count per pipeline status, recent-activity lists) — each of
 * those is its own full Laravel bootstrap + DB round trip, and
 * `php artisan serve`'s single-threaded dev server queues them instead of
 * running them concurrently, so the page felt much slower to load than it
 * needed to. This collapses all of it into one query pass per domain.
 *
 * Covers both Training (Phase 6) and Placement/Recruitment (Phase 7) —
 * added to as one shared dashboard rather than split into two, since an
 * admin managing one domain still benefits from seeing the other at a
 * glance.
 */
class DashboardController extends Controller
{
    private const ENROLLMENT_STATUSES = ['new', 'contacted', 'enrolled', 'rejected'];

    private const APPLICATION_STATUSES = ['new', 'shortlisted', 'interview', 'placed', 'rejected'];

    public function stats(): JsonResponse
    {
        $enrollmentCounts = CourseEnrollment::query()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $enrollmentsByStatus = collect(self::ENROLLMENT_STATUSES)
            ->mapWithKeys(fn ($status) => [$status => (int) ($enrollmentCounts[$status] ?? 0)]);

        $applicationCounts = JobApplication::query()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $applicationsByStatus = collect(self::APPLICATION_STATUSES)
            ->mapWithKeys(fn ($status) => [$status => (int) ($applicationCounts[$status] ?? 0)]);

        $recentEnrollments = CourseEnrollment::with('course')->latest()->take(5)->get();
        $recentApplications = JobApplication::with('jobPosting')->latest()->take(5)->get();

        return $this->success([
            'courses_count' => Course::count(),
            'training_categories_count' => Category::ofType('course')->count(),
            'enrollments_by_status' => $enrollmentsByStatus,
            'recent_enrollments' => CourseEnrollmentResource::collection($recentEnrollments),

            'jobs_count' => JobPosting::count(),
            'job_categories_count' => Category::ofType('job')->count(),
            'applications_by_status' => $applicationsByStatus,
            'recent_applications' => JobApplicationResource::collection($recentApplications),
        ]);
    }
}

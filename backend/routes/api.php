<?php

use App\Http\Controllers\Api\Admin\BannerController as AdminBannerController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\CourseController as AdminCourseController;
use App\Http\Controllers\Api\Admin\CourseEnrollmentController as AdminCourseEnrollmentController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\JobApplicationController as AdminJobApplicationController;
use App\Http\Controllers\Api\Admin\JobPostingController as AdminJobPostingController;
use App\Http\Controllers\Api\Admin\LeadController as AdminLeadController;
use App\Http\Controllers\Api\Admin\PageSectionController as AdminPageSectionController;
use App\Http\Controllers\Api\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Api\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Api\Admin\StatisticController as AdminStatisticController;
use App\Http\Controllers\Api\Admin\TestimonialController as AdminTestimonialController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Candidate\DashboardController as CandidateDashboardController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\CourseEnrollmentController;
use App\Http\Controllers\Api\JobApplicationController;
use App\Http\Controllers\Api\JobPostingController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\PageSectionController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\StatisticController;
use App\Http\Controllers\Api\TestimonialController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Every response follows the { success, message, data } envelope (see
| App\Traits\ApiResponse and bootstrap/app.php's exception rendering).
| Auth is Sanctum's SPA ("stateful") flow: the frontend calls
| GET /sanctum/csrf-cookie once, then these routes authenticate via the
| session cookie — no bearer token to manage. See docs/API.md for the full
| endpoint reference.
|
*/

// ---- Auth --------------------------------------------------------------
Route::prefix('auth')->group(function () {
    // Named rate limiters, defined in AppServiceProvider::boot() (Phase
    // 13) — tighter than the default throttle:api every other route gets,
    // since login/register are the two endpoints worth throttling harder
    // than "don't hammer the API" (brute-force credential guessing, and
    // automated fake-account creation, respectively).
    Route::post('register', [AuthController::class, 'register'])->middleware('throttle:register');
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:login');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

// ---- Public reads --------------------------------------------------------
Route::get('courses', [CourseController::class, 'index']);
Route::get('courses/{course:slug}', [CourseController::class, 'show']);

Route::get('job-postings', [JobPostingController::class, 'index']);
Route::get('job-postings/{job_posting:slug}', [JobPostingController::class, 'show']);

Route::get('categories', [CategoryController::class, 'index']);
Route::get('banners', [BannerController::class, 'index']);
Route::get('testimonials', [TestimonialController::class, 'index']);
Route::get('statistics', [StatisticController::class, 'index']);
Route::get('settings/public', [SettingController::class, 'publicIndex']);
Route::get('page-sections', [PageSectionController::class, 'index']);

// ---- Public writes (guest or logged-in candidate) -------------------------
Route::post('course-enrollments', [CourseEnrollmentController::class, 'store']);
Route::post('job-applications', [JobApplicationController::class, 'store']);
Route::post('leads', [LeadController::class, 'store']);

// ---- Candidate "My Dashboard" (any authenticated user, own records only) --
Route::middleware('auth:sanctum')->prefix('me')->group(function () {
    Route::get('dashboard', [CandidateDashboardController::class, 'index']);
});

// ---- Admin (authenticated + role=admin) -----------------------------------
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('dashboard/stats', [AdminDashboardController::class, 'stats']);

    Route::apiResource('categories', AdminCategoryController::class);
    Route::apiResource('courses', AdminCourseController::class);
    Route::apiResource('job-postings', AdminJobPostingController::class);
    Route::apiResource('banners', AdminBannerController::class);
    Route::apiResource('testimonials', AdminTestimonialController::class);
    Route::apiResource('statistics', AdminStatisticController::class);
    Route::apiResource('page-sections', AdminPageSectionController::class);

    Route::get('settings', [AdminSettingController::class, 'index']);
    Route::put('settings', [AdminSettingController::class, 'update']);

    Route::apiResource('course-enrollments', AdminCourseEnrollmentController::class)->only(['index', 'show', 'update']);
    Route::apiResource('job-applications', AdminJobApplicationController::class)->only(['index', 'show', 'update']);
    Route::apiResource('leads', AdminLeadController::class)->only(['index', 'show', 'update']);

    Route::get('reports/summary', [AdminReportController::class, 'summary']);
    Route::get('reports/leads/export', [AdminReportController::class, 'exportLeads']);
});

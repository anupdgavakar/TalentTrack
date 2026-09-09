<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CourseEnrollmentResource;
use App\Models\CourseEnrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CourseEnrollmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $enrollments = CourseEnrollment::with('course')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->latest()
            ->paginate(20);

        return $this->success([
            'items' => CourseEnrollmentResource::collection($enrollments->items()),
            'meta' => [
                'current_page' => $enrollments->currentPage(),
                'last_page' => $enrollments->lastPage(),
                'per_page' => $enrollments->perPage(),
                'total' => $enrollments->total(),
            ],
        ]);
    }

    public function show(CourseEnrollment $courseEnrollment): JsonResponse
    {
        return $this->success(new CourseEnrollmentResource($courseEnrollment->load('course')));
    }

    public function update(Request $request, CourseEnrollment $courseEnrollment): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['new', 'contacted', 'enrolled', 'rejected'])],
        ]);

        $courseEnrollment->update($validated);

        return $this->success(new CourseEnrollmentResource($courseEnrollment->load('course')), 'Status updated.');
    }
}

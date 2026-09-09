<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Public, read-only. Powers /training (list) and the course detail page.
 * Only ever returns active courses — inactive/draft courses are admin-only
 * (see Api\Admin\CourseController).
 */
class CourseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $courses = Course::query()
            ->active()
            ->with('category')
            ->when($request->filled('category'), fn ($q) => $q->whereHas(
                'category',
                fn ($cq) => $cq->where('slug', $request->string('category'))
            ))
            ->when($request->boolean('featured'), fn ($q) => $q->featured())
            ->when($request->filled('search'), fn ($q) => $q->where('title', 'like', '%'.$request->string('search').'%'))
            ->latest()
            ->paginate($request->integer('per_page', 12));

        return $this->success([
            'items' => CourseResource::collection($courses->items()),
            'meta' => [
                'current_page' => $courses->currentPage(),
                'last_page' => $courses->lastPage(),
                'per_page' => $courses->perPage(),
                'total' => $courses->total(),
            ],
        ]);
    }

    public function show(Course $course): JsonResponse
    {
        if (! $course->is_active) {
            return $this->error('Course not found.', 404);
        }

        return $this->success(new CourseResource($course->load('category')));
    }
}

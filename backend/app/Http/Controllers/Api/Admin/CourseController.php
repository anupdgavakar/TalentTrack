<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CourseRequest;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use App\Support\ImageOptimizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class CourseController extends Controller
{
    public function index(): JsonResponse
    {
        $courses = Course::with('category')->latest()->paginate(20);

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

    public function store(CourseRequest $request): JsonResponse
    {
        $data = $request->safe()->except('image');

        $course = Course::create([
            ...$data,
            'image' => $this->storeOptimizedImage($request),
        ]);

        return $this->created(new CourseResource($course->load('category')));
    }

    public function show(Course $course): JsonResponse
    {
        return $this->success(new CourseResource($course->load('category')));
    }

    public function update(CourseRequest $request, Course $course): JsonResponse
    {
        $data = $request->safe()->except('image');

        if ($request->hasFile('image')) {
            if ($course->image) {
                Storage::disk('public')->delete($course->image);
            }
            $data['image'] = $this->storeOptimizedImage($request);
        }

        $course->update($data);

        return $this->success(new CourseResource($course->load('category')), 'Course updated.');
    }

    public function destroy(Course $course): JsonResponse
    {
        if ($course->image) {
            Storage::disk('public')->delete($course->image);
        }

        $course->delete();

        return $this->success(null, 'Course deleted.');
    }

    /**
     * Same reasoning as BannerController's equivalent helper — an
     * unbounded-resolution upload slows down every public page that shows
     * course images (the Training list and each course's detail page), not
     * just the homepage slider. Course photos don't need to be as large as
     * a full-bleed hero banner, hence the smaller cap.
     */
    private function storeOptimizedImage(CourseRequest $request): ?string
    {
        $file = $request->file('image');

        if (! $file) {
            return null;
        }

        $optimized = ImageOptimizer::optimize($file, maxWidth: 1200, maxHeight: 900);
        // Extension comes from the optimizer, not the upload — see
        // BannerController's matching comment.
        $path = 'courses/'.pathinfo($file->hashName(), PATHINFO_FILENAME).'.'.$optimized->extension;

        Storage::disk('public')->put($path, $optimized->data);

        return $path;
    }
}

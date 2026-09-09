<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TestimonialRequest;
use App\Http\Resources\TestimonialResource;
use App\Models\Testimonial;
use App\Support\ImageOptimizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class TestimonialController extends Controller
{
    public function index(): JsonResponse
    {
        return $this->success(TestimonialResource::collection(Testimonial::orderBy('sort_order')->get()));
    }

    public function store(TestimonialRequest $request): JsonResponse
    {
        $data = $request->safe()->except('avatar');

        $testimonial = Testimonial::create([
            ...$data,
            'avatar' => $this->storeOptimizedAvatar($request),
        ]);

        return $this->created(new TestimonialResource($testimonial));
    }

    public function show(Testimonial $testimonial): JsonResponse
    {
        return $this->success(new TestimonialResource($testimonial));
    }

    public function update(TestimonialRequest $request, Testimonial $testimonial): JsonResponse
    {
        $data = $request->safe()->except('avatar');

        if ($request->hasFile('avatar')) {
            if ($testimonial->avatar) {
                Storage::disk('public')->delete($testimonial->avatar);
            }
            $data['avatar'] = $this->storeOptimizedAvatar($request);
        }

        $testimonial->update($data);

        return $this->success(new TestimonialResource($testimonial), 'Testimonial updated.');
    }

    public function destroy(Testimonial $testimonial): JsonResponse
    {
        if ($testimonial->avatar) {
            Storage::disk('public')->delete($testimonial->avatar);
        }

        $testimonial->delete();

        return $this->success(null, 'Testimonial deleted.');
    }

    /**
     * Same reasoning as BannerController's equivalent helper. An avatar is
     * shown small (a few dozen px, round-cropped) — capped much tighter
     * than a banner or course image since there's no reason for it to ever
     * be larger than a few hundred px square.
     */
    private function storeOptimizedAvatar(TestimonialRequest $request): ?string
    {
        $file = $request->file('avatar');

        if (! $file) {
            return null;
        }

        $optimized = ImageOptimizer::optimize($file, maxWidth: 400, maxHeight: 400);
        // Extension comes from the optimizer, not the upload — see
        // BannerController's matching comment.
        $path = 'testimonials/'.pathinfo($file->hashName(), PATHINFO_FILENAME).'.'.$optimized->extension;

        Storage::disk('public')->put($path, $optimized->data);

        return $path;
    }
}

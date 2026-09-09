<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BannerRequest;
use App\Http\Resources\BannerResource;
use App\Models\Banner;
use App\Support\ImageOptimizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class BannerController extends Controller
{
    public function index(): JsonResponse
    {
        return $this->success(BannerResource::collection(Banner::orderBy('sort_order')->get()));
    }

    public function store(BannerRequest $request): JsonResponse
    {
        $data = $request->safe()->except('image');

        $banner = Banner::create([
            ...$data,
            'image' => $this->storeOptimizedImage($request),
        ]);

        return $this->created(new BannerResource($banner));
    }

    public function show(Banner $banner): JsonResponse
    {
        return $this->success(new BannerResource($banner));
    }

    public function update(BannerRequest $request, Banner $banner): JsonResponse
    {
        $data = $request->safe()->except('image');

        if ($request->hasFile('image')) {
            Storage::disk('public')->delete($banner->image);
            $data['image'] = $this->storeOptimizedImage($request);
        }

        $banner->update($data);

        return $this->success(new BannerResource($banner), 'Banner updated.');
    }

    /**
     * Banners are the hero slider's images — the single largest,
     * furthest-above-the-fold image on the whole site, and the one a slow
     * connection feels first (reported as a ~10s slider load). Resized/
     * re-compressed at upload time (see ImageOptimizer's own docblock for
     * why this runs synchronously with plain GD rather than a queued job
     * or a new dependency) so the public homepage never has to serve an
     * original, unbounded-resolution upload.
     */
    private function storeOptimizedImage(BannerRequest $request): string
    {
        $file = $request->file('image');
        $optimized = ImageOptimizer::optimize($file, maxWidth: 1920, maxHeight: 1080);
        // Extension comes from the optimizer, not the upload — a flat/
        // opaque PNG upload is routinely converted to JPEG (see
        // ImageOptimizer's docblock), so the stored extension must match
        // what was actually encoded, not what was originally uploaded.
        $path = 'banners/'.pathinfo($file->hashName(), PATHINFO_FILENAME).'.'.$optimized->extension;

        Storage::disk('public')->put($path, $optimized->data);

        return $path;
    }

    public function destroy(Banner $banner): JsonResponse
    {
        Storage::disk('public')->delete($banner->image);
        $banner->delete();

        return $this->success(null, 'Banner deleted.');
    }
}

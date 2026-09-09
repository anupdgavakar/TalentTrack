<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PageSectionRequest;
use App\Http\Resources\PageSectionResource;
use App\Models\PageSection;
use App\Support\ImageOptimizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PageSectionController extends Controller
{
    /**
     * `?page=about` / `?page=contact` filters the list, same as the admin
     * Categories screen filters by `type` — the admin UI always passes
     * this (see PageSectionManager.jsx), since editing "all content blocks
     * across every page" in one flat list isn't a useful view for anyone.
     */
    public function index(Request $request): JsonResponse
    {
        $query = PageSection::query()->orderBy('section_key')->orderBy('sort_order');

        if ($request->filled('page')) {
            $query->forPage($request->string('page'));
        }

        return $this->success(PageSectionResource::collection($query->get()));
    }

    public function store(PageSectionRequest $request): JsonResponse
    {
        $data = $request->safe()->except('image');

        $section = PageSection::create([
            ...$data,
            'image' => $this->storeOptimizedImage($request),
        ]);

        return $this->created(new PageSectionResource($section));
    }

    public function show(PageSection $pageSection): JsonResponse
    {
        return $this->success(new PageSectionResource($pageSection));
    }

    public function update(PageSectionRequest $request, PageSection $pageSection): JsonResponse
    {
        $data = $request->safe()->except('image');

        if ($request->hasFile('image')) {
            if ($pageSection->image) {
                Storage::disk('public')->delete($pageSection->image);
            }
            $data['image'] = $this->storeOptimizedImage($request);
        }

        $pageSection->update($data);

        return $this->success(new PageSectionResource($pageSection), 'Content block updated.');
    }

    public function destroy(PageSection $pageSection): JsonResponse
    {
        if ($pageSection->image) {
            Storage::disk('public')->delete($pageSection->image);
        }

        $pageSection->delete();

        return $this->success(null, 'Content block deleted.');
    }

    private function storeOptimizedImage(PageSectionRequest $request): ?string
    {
        $file = $request->file('image');

        if (! $file) {
            return null;
        }

        $optimized = ImageOptimizer::optimize($file, maxWidth: 1600, maxHeight: 1000);
        // Extension comes from the optimizer, not the upload — see
        // BannerController's matching comment.
        $path = 'page-sections/'.pathinfo($file->hashName(), PATHINFO_FILENAME).'.'.$optimized->extension;

        Storage::disk('public')->put($path, $optimized->data);

        return $path;
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PageSectionResource;
use App\Models\PageSection;
use App\Support\PageSectionKeys;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PageSectionController extends Controller
{
    /**
     * Public, read-only, active-only — `?page=about` or `?page=contact` is
     * required (unlike Banners/Statistics, there's no sensible "give me
     * every page's content blocks in one flat list" use case on the public
     * site, so this doesn't default to unfiltered). Validated inline, same
     * pattern as ReportController::parseRange, rather than a dedicated
     * FormRequest class for one query param.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = Validator::make($request->query(), [
            'page' => ['required', 'string', 'in:'.implode(',', PageSectionKeys::PAGES)],
        ])->validate();

        $sections = PageSection::forPage($validated['page'])->active()->get();

        return $this->success(PageSectionResource::collection($sections));
    }
}

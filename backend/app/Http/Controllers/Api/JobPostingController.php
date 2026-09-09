<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\JobPostingResource;
use App\Models\JobPosting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Public, read-only. `listing_type` filter (?listing_type=placement or
 * =recruitment) is what separates /placement's job board from a
 * /recruitment "current searches" list, if the frontend wants to show one.
 */
class JobPostingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $jobs = JobPosting::query()
            ->open()
            ->with('category')
            ->when($request->filled('category'), fn ($q) => $q->whereHas(
                'category',
                fn ($cq) => $cq->where('slug', $request->string('category'))
            ))
            ->when($request->filled('listing_type'), fn ($q) => $q->where('listing_type', $request->string('listing_type')))
            ->when($request->filled('job_type'), fn ($q) => $q->where('job_type', $request->string('job_type')))
            ->when($request->boolean('featured'), fn ($q) => $q->featured())
            ->when($request->filled('search'), fn ($q) => $q->where('title', 'like', '%'.$request->string('search').'%'))
            ->latest()
            ->paginate($request->integer('per_page', 12));

        return $this->success([
            'items' => JobPostingResource::collection($jobs->items()),
            'meta' => [
                'current_page' => $jobs->currentPage(),
                'last_page' => $jobs->lastPage(),
                'per_page' => $jobs->perPage(),
                'total' => $jobs->total(),
            ],
        ]);
    }

    public function show(JobPosting $jobPosting): JsonResponse
    {
        // Same "open" definition as JobPosting::scopeOpen() — closing_date
        // is inclusive of the day itself (a job closing "today" is still
        // open today), so this compares dates, not a isPast() timestamp
        // check that would cut it off at midnight.
        $isOpen = $jobPosting->is_active
            && (! $jobPosting->closing_date || $jobPosting->closing_date->toDateString() >= now()->toDateString());

        if (! $isOpen) {
            return $this->error('Job posting not found.', 404);
        }

        return $this->success(new JobPostingResource($jobPosting->load('category')));
    }
}

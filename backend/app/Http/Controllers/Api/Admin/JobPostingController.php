<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\JobPostingRequest;
use App\Http\Resources\JobPostingResource;
use App\Models\JobPosting;
use Illuminate\Http\JsonResponse;

class JobPostingController extends Controller
{
    public function index(): JsonResponse
    {
        $jobs = JobPosting::with('category')->latest()->paginate(20);

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

    public function store(JobPostingRequest $request): JsonResponse
    {
        $jobPosting = JobPosting::create($request->validated());

        return $this->created(new JobPostingResource($jobPosting->load('category')));
    }

    public function show(JobPosting $jobPosting): JsonResponse
    {
        return $this->success(new JobPostingResource($jobPosting->load('category')));
    }

    public function update(JobPostingRequest $request, JobPosting $jobPosting): JsonResponse
    {
        $jobPosting->update($request->validated());

        return $this->success(new JobPostingResource($jobPosting->load('category')), 'Job posting updated.');
    }

    public function destroy(JobPosting $jobPosting): JsonResponse
    {
        $jobPosting->delete();

        return $this->success(null, 'Job posting deleted.');
    }
}

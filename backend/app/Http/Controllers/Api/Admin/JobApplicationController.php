<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\JobApplicationResource;
use App\Models\JobApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class JobApplicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $applications = JobApplication::with('jobPosting')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->latest()
            ->paginate(20);

        return $this->success([
            'items' => JobApplicationResource::collection($applications->items()),
            'meta' => [
                'current_page' => $applications->currentPage(),
                'last_page' => $applications->lastPage(),
                'per_page' => $applications->perPage(),
                'total' => $applications->total(),
            ],
        ]);
    }

    public function show(JobApplication $jobApplication): JsonResponse
    {
        return $this->success(new JobApplicationResource($jobApplication->load('jobPosting')));
    }

    public function update(Request $request, JobApplication $jobApplication): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['new', 'shortlisted', 'interview', 'placed', 'rejected'])],
        ]);

        $jobApplication->update($validated);

        return $this->success(new JobApplicationResource($jobApplication->load('jobPosting')), 'Status updated.');
    }
}

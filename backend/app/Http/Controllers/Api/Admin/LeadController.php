<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\LeadResource;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LeadController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $leads = Lead::query()
            ->when($request->filled('type'), fn ($q) => $q->ofType($request->string('type')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->latest()
            ->paginate(20);

        return $this->success([
            'items' => LeadResource::collection($leads->items()),
            'meta' => [
                'current_page' => $leads->currentPage(),
                'last_page' => $leads->lastPage(),
                'per_page' => $leads->perPage(),
                'total' => $leads->total(),
            ],
        ]);
    }

    public function show(Lead $lead): JsonResponse
    {
        return $this->success(new LeadResource($lead));
    }

    public function update(Request $request, Lead $lead): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['new', 'in_progress', 'converted', 'closed'])],
        ]);

        $lead->update($validated);

        return $this->success(new LeadResource($lead), 'Status updated.');
    }
}

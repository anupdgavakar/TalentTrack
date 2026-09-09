<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LeadRequest;
use App\Http\Resources\LeadResource;
use App\Models\Lead;
use App\Services\AdminNotifier;
use Illuminate\Http\JsonResponse;

class LeadController extends Controller
{
    public function store(LeadRequest $request): JsonResponse
    {
        $lead = Lead::create($request->validated());

        AdminNotifier::send(
            heading: 'New lead: '.$lead->name,
            intro: "A new {$lead->type} enquiry just came in from the public site.",
            fields: [
                'Type' => ucfirst($lead->type),
                'Name' => $lead->name,
                'Email' => $lead->email,
                'Phone' => $lead->phone,
                'Company' => $lead->company,
                'Message' => $lead->message,
            ],
            ctaLabel: 'View in Leads',
            ctaUrl: config('app.frontend_url').'/admin/leads',
        );

        return $this->created(new LeadResource($lead), 'Thanks for reaching out — we\'ll get back to you shortly.');
    }
}

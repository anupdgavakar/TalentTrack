<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * Shared by both the public `GET /testimonials` endpoint and the admin
 * `GET/POST/PUT /admin/testimonials` endpoints (Phase 9) — `is_active` and
 * `sort_order` are only meaningful to the admin screens (the public
 * controller already filters to `active()` and orders by `sort_order`
 * itself), but including them here is harmless: the public payload's
 * `is_active` is always true by construction, and admin needs both fields
 * to prefill its edit form and list ordering.
 */
class TestimonialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'role_title' => $this->role_title,
            'company' => $this->company,
            'quote' => $this->quote,
            'avatar_url' => $this->avatar ? Storage::disk('public')->url($this->avatar) : null,
            'rating' => $this->rating,
            'is_featured' => $this->is_featured,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
        ];
    }
}

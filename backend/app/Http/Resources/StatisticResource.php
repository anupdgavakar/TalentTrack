<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Shared by both the public `GET /statistics` endpoint and the admin
 * `GET/POST/PUT /admin/statistics` endpoints (Phase 9) — see
 * TestimonialResource's docblock for why `is_active`/`sort_order` are safe
 * to expose on the public payload too.
 */
class StatisticResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'value' => $this->value,
            'icon' => $this->icon,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
        ];
    }
}

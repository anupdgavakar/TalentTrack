<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * Shaped to match the frontend's HERO_SLIDES / Hero.jsx slide props
 * directly: id, eyebrow, title, description, image, alt, primaryCta,
 * secondaryCta — so the homepage can eventually do
 * `slides={bannersFromApi}` with zero mapping code.
 */
class BannerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'eyebrow' => $this->eyebrow,
            'title' => $this->title,
            'description' => $this->description,
            'image' => $this->image ? Storage::disk('public')->url($this->image) : null,
            'alt' => $this->alt_text,
            'primaryCta' => $this->primary_cta_label ? [
                'label' => $this->primary_cta_label,
                'to' => $this->primary_cta_url,
            ] : null,
            'secondaryCta' => $this->secondary_cta_label ? [
                'label' => $this->secondary_cta_label,
                'to' => $this->secondary_cta_url,
            ] : null,
            'sort_order' => $this->sort_order,
            'is_active' => $this->is_active,
        ];
    }
}

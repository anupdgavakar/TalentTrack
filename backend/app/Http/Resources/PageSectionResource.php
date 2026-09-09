<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * One shape for both the admin CRUD screen and the public About/Contact
 * pages — same reasoning as BannerResource: nothing here is sensitive, so
 * there's no separate admin-only field set to maintain.
 */
class PageSectionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'page' => $this->page,
            'section_key' => $this->section_key,
            'icon' => $this->icon,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'body' => $this->body,
            'image' => $this->image ? Storage::disk('public')->url($this->image) : null,
            'primary_label' => $this->primary_label,
            'primary_url' => $this->primary_url,
            'secondary_label' => $this->secondary_label,
            'secondary_url' => $this->secondary_url,
            'sort_order' => $this->sort_order,
            'is_active' => $this->is_active,
        ];
    }
}

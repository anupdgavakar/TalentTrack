<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobPostingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'title' => $this->title,
            'slug' => $this->slug,
            'company_name' => $this->company_name,
            'location' => $this->location,
            'job_type' => $this->job_type,
            'experience_level' => $this->experience_level,
            'salary_min' => $this->salary_min,
            'salary_max' => $this->salary_max,
            'description' => $this->description,
            'requirements' => $this->requirements,
            'listing_type' => $this->listing_type,
            'is_featured' => $this->is_featured,
            'is_active' => $this->is_active,
            'closing_date' => $this->closing_date?->toDateString(),
            'created_at' => $this->created_at,
        ];
    }
}

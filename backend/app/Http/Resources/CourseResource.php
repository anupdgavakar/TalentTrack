<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class CourseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'title' => $this->title,
            'slug' => $this->slug,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'duration' => $this->duration,
            'level' => $this->level,
            'mode' => $this->mode,
            'fee' => $this->fee,
            'image_url' => $this->image ? Storage::disk('public')->url($this->image) : null,
            'syllabus' => $this->syllabus,
            'is_featured' => $this->is_featured,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class JobApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'job_posting' => new JobPostingResource($this->whenLoaded('jobPosting')),
            'user_id' => $this->user_id,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'resume_url' => $this->resume_path ? Storage::disk('public')->url($this->resume_path) : null,
            'cover_note' => $this->cover_note,
            'status' => $this->status,
            'created_at' => $this->created_at,
        ];
    }
}

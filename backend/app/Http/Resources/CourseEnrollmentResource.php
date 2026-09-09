<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseEnrollmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'course' => new CourseResource($this->whenLoaded('course')),
            'user_id' => $this->user_id,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'message' => $this->message,
            'status' => $this->status,
            'created_at' => $this->created_at,
        ];
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TestimonialResource;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestimonialController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $testimonials = Testimonial::active()
            ->when($request->boolean('featured'), fn ($q) => $q->featured())
            ->get();

        return $this->success(TestimonialResource::collection($testimonials));
    }
}

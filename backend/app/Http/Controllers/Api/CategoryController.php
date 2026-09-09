<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categories = Category::query()
            ->active()
            ->when($request->filled('type'), fn ($q) => $q->ofType($request->string('type')))
            ->orderBy('name')
            ->get();

        return $this->success(CategoryResource::collection($categories));
    }
}

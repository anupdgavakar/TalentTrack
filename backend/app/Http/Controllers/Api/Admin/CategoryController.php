<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        return $this->success(CategoryResource::collection(Category::orderBy('type')->orderBy('name')->get()));
    }

    public function store(CategoryRequest $request): JsonResponse
    {
        $category = Category::create($request->validated());

        return $this->created(new CategoryResource($category));
    }

    public function show(Category $category): JsonResponse
    {
        return $this->success(new CategoryResource($category));
    }

    public function update(CategoryRequest $request, Category $category): JsonResponse
    {
        $category->update($request->validated());

        return $this->success(new CategoryResource($category), 'Category updated.');
    }

    public function destroy(Category $category): JsonResponse
    {
        $category->delete();

        return $this->success(null, 'Category deleted.');
    }
}

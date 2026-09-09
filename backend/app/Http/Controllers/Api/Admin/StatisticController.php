<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StatisticRequest;
use App\Http\Resources\StatisticResource;
use App\Models\Statistic;
use Illuminate\Http\JsonResponse;

class StatisticController extends Controller
{
    public function index(): JsonResponse
    {
        return $this->success(StatisticResource::collection(Statistic::orderBy('sort_order')->get()));
    }

    public function store(StatisticRequest $request): JsonResponse
    {
        $statistic = Statistic::create($request->validated());

        return $this->created(new StatisticResource($statistic));
    }

    public function show(Statistic $statistic): JsonResponse
    {
        return $this->success(new StatisticResource($statistic));
    }

    public function update(StatisticRequest $request, Statistic $statistic): JsonResponse
    {
        $statistic->update($request->validated());

        return $this->success(new StatisticResource($statistic), 'Statistic updated.');
    }

    public function destroy(Statistic $statistic): JsonResponse
    {
        $statistic->delete();

        return $this->success(null, 'Statistic deleted.');
    }
}

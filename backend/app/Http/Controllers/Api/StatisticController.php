<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StatisticResource;
use App\Models\Statistic;
use Illuminate\Http\JsonResponse;

class StatisticController extends Controller
{
    public function index(): JsonResponse
    {
        return $this->success(StatisticResource::collection(Statistic::active()->get()));
    }
}

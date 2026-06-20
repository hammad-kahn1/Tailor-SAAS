<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Measurement\MeasurementStoreRequest;
use App\Models\Measurement;
use App\Services\MeasurementService;
use Illuminate\Http\JsonResponse;

class MeasurementController extends Controller
{
    public function __construct(private MeasurementService $service) {}

    /**
     * POST /measurements
     * Record a new measurement for a customer.
     */
    public function store(MeasurementStoreRequest $request): JsonResponse
    {
        $measurement = $this->service->store($request->validated());
        return response()->json(['message' => 'Measurement recorded.', 'data' => $measurement], 201);
    }

    /**
     * GET /customers/{customer}/measurements
     * List all measurements for a customer (optionally filtered by type).
     */
    public function index(int $customer): JsonResponse
    {
        $type = request('type');
        return response()->json(['data' => $this->service->history($customer, $type)]);
    }

    /**
     * GET /customers/{customer}/measurements/latest/{type}
     * Get the latest measurement of a given type.
     */
    public function latest(int $customer, string $type): JsonResponse
    {
        $m = $this->service->latest($customer, $type);
        if (! $m) return response()->json(['message' => 'No measurement found.'], 404);
        return response()->json(['data' => $m]);
    }

    /**
     * GET /measurements/{measurement}
     * Show a single measurement record.
     */
    public function show(Measurement $measurement): JsonResponse
    {
        return response()->json(['data' => $measurement->load(['customer:id,full_name', 'recordedBy:id,name'])]);
    }
}

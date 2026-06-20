<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\OrderStoreRequest;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(private OrderService $service) {}

    public function index(Request $request): JsonResponse
    {
        $orders = $this->service->list(
            $request->only('status','search','from_date','to_date','customer_id'),
            (int) $request->get('per_page', 15)
        );
        return response()->json($orders);
    }

    public function store(OrderStoreRequest $request): JsonResponse
    {
        $order = $this->service->create(
            $request->safe()->except('items'),
            $request->input('items')
        );
        return response()->json(['message' => 'Order created.', 'data' => $order], 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['data' => $this->service->show($id)]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate(['status' => 'required|in:pending,assigned,in_progress,ready,delivered,cancelled']);
        $order = $this->service->updateStatus($id, $request->status, $request->notes);
        return response()->json(['message' => 'Status updated.', 'data' => $order]);
    }
}

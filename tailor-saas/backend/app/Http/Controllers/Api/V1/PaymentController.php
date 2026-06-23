<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(private OrderService $service) {}

    /**
     * GET /orders/{order}/payments
     * Return all payments for the given order.
     */
    public function index(Order $order): JsonResponse
    {
        $payments = Payment::with('receivedBy:id,name')
            ->where('order_id', $order->id)
            ->orderByDesc('paid_at')
            ->get();

        return response()->json(['data' => $payments]);
    }

    /**
     * POST /orders/{order}/payments
     * Record a new payment against an order.
     */
    public function store(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'type'   => 'required|in:advance,partial,final,refund',
            'method' => 'required|in:cash,card,bank_transfer,mobile_wallet',
            'notes'  => 'nullable|string',
        ]);

        $payment = $this->service->recordPayment($order, $validated);
        return response()->json(['message' => 'Payment recorded.', 'data' => $payment], 201);
    }
}

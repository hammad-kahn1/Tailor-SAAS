<?php

use Illuminate\Support\Facades\Route;

// QR code order verification (public)
Route::get('/verify/{orderNumber}', function (string $orderNumber) {
    $order = \App\Models\Order::withoutGlobalScopes()
        ->where('order_number', $orderNumber)
        ->with(['customer:id,full_name', 'tenant:id,name'])
        ->firstOrFail();

    return response()->json([
        'order_number' => $order->order_number,
        'status'       => $order->status,
        'customer'     => $order->customer->full_name,
        'shop'         => $order->tenant->name,
        'delivery_date'=> $order->delivery_date,
    ]);
})->name('order.verify');

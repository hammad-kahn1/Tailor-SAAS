<?php

namespace App\Repositories\Eloquent;

use App\Models\Order;
use App\Models\OrderItem;
use App\Repositories\Contracts\OrderRepositoryInterface;
use Illuminate\Support\Facades\DB;

class EloquentOrderRepository implements OrderRepositoryInterface
{
    public function paginate(array $filters, int $perPage = 15)
    {
        return Order::with(['customer:id,full_name,phone', 'assignment.tailor:id,name'])
            ->forStatus($filters['status'] ?? null)
            ->search($filters['search'] ?? null)
            ->when($filters['customer_id'] ?? null, fn ($q, $v) => $q->where('customer_id', $v))
            ->when($filters['from_date'] ?? null, fn ($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($filters['to_date'] ?? null, fn ($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function findById(int $id)
    {
        return Order::with([
            'customer', 'measurement', 'items',
            'payments.receivedBy:id,name',
            'assignment.tailor:id,name',
            'createdBy:id,name',
        ])->findOrFail($id);
    }

    public function create(array $data, array $items): mixed
    {
        return DB::transaction(function () use ($data, $items) {
            $totalPrice = collect($items)->sum(fn ($i) => $i['quantity'] * $i['unit_price']);

            $order = Order::create(array_merge($data, [
                'order_number'      => Order::generateOrderNumber(),
                'total_price'       => $totalPrice,
                'remaining_payment' => $totalPrice - ($data['advance_payment'] ?? 0),
                'created_by'        => auth()->id(),
            ]));

            foreach ($items as $item) {
                OrderItem::create([
                    'order_id'   => $order->id,
                    'item_name'  => $item['item_name'],
                    'quantity'   => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal'   => $item['quantity'] * $item['unit_price'],
                ]);
            }

            return $order->load(['customer', 'items']);
        });
    }

    public function updateStatus(int $id, string $status, ?string $notes): mixed
    {
        $order = Order::findOrFail($id);
        $order->update(['status' => $status, 'notes' => $notes ?? $order->notes]);
        return $order->fresh()->load(['customer', 'items', 'assignment.tailor']);
    }
}

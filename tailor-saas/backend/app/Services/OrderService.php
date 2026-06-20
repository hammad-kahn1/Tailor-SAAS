<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use App\Models\TailorAssignment;
use App\Notifications\OrderReadyNotification;
use App\Repositories\Contracts\OrderRepositoryInterface;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(private OrderRepositoryInterface $orderRepo) {}

    public function list(array $filters, int $perPage = 15)
    {
        return $this->orderRepo->paginate($filters, $perPage);
    }

    public function show(int $id)
    {
        return $this->orderRepo->findById($id);
    }

    public function create(array $data, array $items)
    {
        return $this->orderRepo->create($data, $items);
    }

    public function updateStatus(int $id, string $status, ?string $notes): Order
    {
        $order = $this->orderRepo->updateStatus($id, $status, $notes);

        // Sync assignment status when order moves to in_progress
        if ($status === Order::STATUS_IN_PROGRESS && $order->assignment) {
            $order->assignment->update(['status' => 'in_progress', 'started_at' => now()]);
        }

        // Trigger notification when order is ready
        if ($status === Order::STATUS_READY) {
            $customer = $order->customer;
            if ($customer && $customer->email) {
                try {
                    $customer->notify(new OrderReadyNotification($order));
                } catch (\Throwable $e) {
                    logger()->warning('Order ready notification failed: '.$e->getMessage());
                }
            }
        }

        return $order;
    }

    public function recordPayment(Order $order, array $data): Payment
    {
        return DB::transaction(function () use ($order, $data) {
            $payment = Payment::create(array_merge($data, [
                'tenant_id'   => $order->tenant_id,
                'order_id'    => $order->id,
                'received_by' => auth()->id(),
                'paid_at'     => now(),
            ]));

            // Recalculate remaining
            $paid = Payment::where('order_id', $order->id)
                ->whereIn('type', ['advance', 'partial', 'final'])
                ->sum('amount');
            $order->update(['remaining_payment' => max(0, $order->total_price - $paid)]);

            return $payment;
        });
    }
}

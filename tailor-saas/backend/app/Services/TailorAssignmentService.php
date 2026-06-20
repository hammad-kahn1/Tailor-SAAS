<?php

namespace App\Services;

use App\Models\Order;
use App\Models\TailorAssignment;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class TailorAssignmentService
{
    public function assign(Order $order, int $tailorId, ?string $notes): TailorAssignment
    {
        return DB::transaction(function () use ($order, $tailorId, $notes) {
            $assignment = TailorAssignment::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'tenant_id'   => $order->tenant_id,
                    'tailor_id'   => $tailorId,
                    'status'      => 'assigned',
                    'assigned_at' => now(),
                    'started_at'  => null,
                    'completed_at'=> null,
                    'notes'       => $notes,
                    'assigned_by' => auth()->id(),
                ]
            );
            $order->update(['status' => Order::STATUS_ASSIGNED]);
            return $assignment->load('tailor:id,name');
        });
    }

    public function updateStatus(TailorAssignment $assignment, string $status): TailorAssignment
    {
        $data = ['status' => $status];
        if ($status === 'in_progress') {
            $data['started_at'] = now();
            $assignment->order->update(['status' => Order::STATUS_IN_PROGRESS]);
        }
        if ($status === 'completed') {
            $data['completed_at'] = now();
            $assignment->order->update(['status' => Order::STATUS_READY]);
        }
        $assignment->update($data);
        return $assignment->fresh()->load('tailor:id,name', 'order.customer');
    }

    public function workload(): array
    {
        return User::where('tenant_id', auth()->user()->tenant_id)
            ->where('role', 'tailor')
            ->where('is_active', true)
            ->withCount([
                'assignments as assigned_count'    => fn ($q) => $q->where('status', 'assigned'),
                'assignments as in_progress_count' => fn ($q) => $q->where('status', 'in_progress'),
                'assignments as completed_count'   => fn ($q) => $q->where('status', 'completed'),
            ])
            ->get(['id', 'name', 'email'])
            ->toArray();
    }

    public function myAssignments(int $tailorId, ?string $status)
    {
        return TailorAssignment::with(['order.customer:id,full_name,phone', 'order.items'])
            ->where('tailor_id', $tailorId)
            ->when($status, fn ($q) => $q->where('status', $status))
            ->orderByDesc('assigned_at')
            ->paginate(15);
    }
}

<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use App\Models\TailorAssignment;
use Illuminate\Support\Facades\DB;

class ReportService
{
    public function dailySales(string $date, int $tenantId): array
    {
        $orders = Order::with(['customer:id,full_name', 'items'])
            ->where('tenant_id', $tenantId)
            ->whereDate('created_at', $date)
            ->get();

        $payments = Payment::where('tenant_id', $tenantId)
            ->whereDate('paid_at', $date)
            ->whereIn('type', ['advance', 'partial', 'final'])
            ->sum('amount');

        return [
            'date'           => $date,
            'total_orders'   => $orders->count(),
            'total_collected'=> (float) $payments,
            'orders'         => $orders,
        ];
    }

    public function monthlyRevenue(int $year, int $month, int $tenantId): array
    {
        $data = Payment::where('tenant_id', $tenantId)
            ->whereYear('paid_at', $year)
            ->whereMonth('paid_at', $month)
            ->whereIn('type', ['advance', 'partial', 'final'])
            ->select(DB::raw('DATE(paid_at) as day'), DB::raw('SUM(amount) as total'))
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        return [
            'year'    => $year,
            'month'   => $month,
            'total'   => (float) $data->sum('total'),
            'daily'   => $data,
        ];
    }

    public function pendingOrders(int $tenantId): array
    {
        $orders = Order::with(['customer:id,full_name,phone', 'assignment.tailor:id,name'])
            ->where('tenant_id', $tenantId)
            ->whereIn('status', ['pending', 'assigned', 'in_progress'])
            ->orderBy('delivery_date')
            ->get();

        return ['orders' => $orders, 'count' => $orders->count()];
    }

    public function tailorPerformance(int $tenantId): array
    {
        return TailorAssignment::where('tenant_id', $tenantId)
            ->select('tailor_id',
                DB::raw('count(*) as total_assigned'),
                DB::raw('sum(case when status="completed" then 1 else 0 end) as completed'),
                DB::raw('sum(case when status="in_progress" then 1 else 0 end) as in_progress'),
                DB::raw('avg(timestampdiff(hour,assigned_at,completed_at)) as avg_completion_hours')
            )
            ->with('tailor:id,name')
            ->groupBy('tailor_id')
            ->get()
            ->toArray();
    }

    public function deliverySchedule(string $from, string $to, int $tenantId): array
    {
        $orders = Order::with(['customer:id,full_name,phone', 'assignment.tailor:id,name'])
            ->where('tenant_id', $tenantId)
            ->whereNotIn('status', ['delivered', 'cancelled'])
            ->whereBetween('delivery_date', [$from, $to])
            ->orderBy('delivery_date')
            ->get();

        return ['orders' => $orders, 'from' => $from, 'to' => $to];
    }
}

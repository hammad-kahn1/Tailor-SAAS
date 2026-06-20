<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function stats(int $tenantId): array
    {
        $today = today();

        $todaysOrders = Order::where('tenant_id', $tenantId)
            ->whereDate('created_at', $today)->count();

        $pendingOrders = Order::where('tenant_id', $tenantId)
            ->whereIn('status', ['pending', 'assigned', 'in_progress'])->count();

        $completedOrders = Order::where('tenant_id', $tenantId)
            ->where('status', 'delivered')->count();

        $revenueToday = Payment::where('tenant_id', $tenantId)
            ->whereDate('paid_at', $today)
            ->whereIn('type', ['advance', 'partial', 'final'])
            ->sum('amount');

        $monthlyRevenue = Payment::where('tenant_id', $tenantId)
            ->whereYear('paid_at', now()->year)
            ->whereMonth('paid_at', now()->month)
            ->whereIn('type', ['advance', 'partial', 'final'])
            ->sum('amount');

        $upcomingDeliveries = Order::with('customer:id,full_name,phone')
            ->where('tenant_id', $tenantId)
            ->whereNotIn('status', ['delivered', 'cancelled'])
            ->where('delivery_date', '>=', $today)
            ->orderBy('delivery_date')
            ->limit(10)
            ->get(['id', 'order_number', 'delivery_date', 'status', 'customer_id']);

        $statusBreakdown = Order::where('tenant_id', $tenantId)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        return [
            'todays_orders'      => $todaysOrders,
            'pending_orders'     => $pendingOrders,
            'completed_orders'   => $completedOrders,
            'revenue_today'      => (float) $revenueToday,
            'monthly_revenue'    => (float) $monthlyRevenue,
            'upcoming_deliveries'=> $upcomingDeliveries,
            'status_breakdown'   => $statusBreakdown,
        ];
    }
}

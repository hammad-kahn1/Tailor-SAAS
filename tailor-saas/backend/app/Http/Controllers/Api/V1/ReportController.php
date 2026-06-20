<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(private ReportService $service) {}

    public function dailySales(Request $request)
    {
        $date = $request->get('date', today()->toDateString());
        $data = $this->service->dailySales($date, auth()->user()->tenant_id);
        return $this->respond($data, $request->get('format', 'json'), 'receipts.reports.daily-sales', 'daily-sales-'.$date);
    }

    public function monthlyRevenue(Request $request)
    {
        $data = $this->service->monthlyRevenue(
            $request->get('year', now()->year),
            $request->get('month', now()->month),
            auth()->user()->tenant_id
        );
        return $this->respond($data, $request->get('format', 'json'), 'receipts.reports.monthly-revenue', 'monthly-revenue');
    }

    public function pendingOrders(Request $request)
    {
        $data = $this->service->pendingOrders(auth()->user()->tenant_id);
        return $this->respond($data, $request->get('format', 'json'), 'receipts.reports.pending-orders', 'pending-orders');
    }

    public function tailorPerformance(Request $request)
    {
        // Returns array — wrap as ['data' => [...]] for the view
        $raw  = $this->service->tailorPerformance(auth()->user()->tenant_id);
        $data = ['data' => $raw];
        return $this->respond($data, $request->get('format', 'json'), 'receipts.reports.tailor-performance', 'tailor-performance');
    }

    public function deliverySchedule(Request $request)
    {
        $from = $request->get('from', today()->toDateString());
        $to   = $request->get('to',   today()->addDays(7)->toDateString());
        $data = $this->service->deliverySchedule($from, $to, auth()->user()->tenant_id);
        return $this->respond($data, $request->get('format', 'json'), 'receipts.reports.delivery-schedule', 'delivery-schedule');
    }

    private function respond(array $data, string $format, string $view, string $filename)
    {
        if ($format === 'pdf') {
            return Pdf::loadView($view, $data)->download($filename.'.pdf');
        }
        return response()->json(['data' => $data]);
    }
}

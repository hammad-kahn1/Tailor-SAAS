<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;
use Illuminate\Http\JsonResponse;

class ReceiptController extends Controller
{
    public function show(Order $order): JsonResponse
    {
        $order->load(['customer', 'measurement', 'items', 'payments', 'assignment.tailor', 'tenant']);
        return response()->json(['data' => $order]);
    }

    public function pdf(Order $order)
    {
        $order->load(['customer', 'measurement', 'items', 'payments', 'assignment.tailor', 'tenant']);

        $qrContent = url('/verify/'.$order->order_number);
        $options   = new QROptions(['outputType' => \chillerlan\QRCode\Output\QROutputInterface::MARKUP_SVG]);
        $qrCode    = (new QRCode($options))->render($qrContent);

        $pdf = Pdf::loadView('receipts.thermal', compact('order', 'qrCode'))
            ->setPaper([0, 0, 226.77, 600], 'portrait'); // 80mm width

        return $pdf->download('receipt-'.$order->order_number.'.pdf');
    }
}

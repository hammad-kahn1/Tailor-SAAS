<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Courier New', monospace; font-size: 11px; width: 226px; padding: 8px; }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .divider { border-top: 1px dashed #000; margin: 6px 0; }
  .row { display: flex; justify-content: space-between; margin: 2px 0; }
  .shop-name { font-size: 14px; font-weight: bold; text-transform: uppercase; }
  .order-num { font-size: 13px; font-weight: bold; }
  .total-row { font-size: 12px; font-weight: bold; }
  .qr { margin: 8px auto; display: block; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 2px 0; font-size: 10px; }
  td:last-child { text-align: right; }
</style>
</head>
<body>

{{-- Shop Header --}}
<div class="center">
  <div class="shop-name">{{ $order->tenant->name }}</div>
  @if($order->tenant->phone)<div>{{ $order->tenant->phone }}</div>@endif
  @if($order->tenant->address)<div>{{ $order->tenant->address }}</div>@endif
</div>

<div class="divider"></div>

{{-- Order Info --}}
<div class="center">
  <div class="order-num">{{ $order->order_number }}</div>
  <div>Date: {{ $order->created_at->format('d/m/Y H:i') }}</div>
</div>

<div class="divider"></div>

{{-- Customer Info --}}
<div><span class="bold">Customer:</span> {{ $order->customer->full_name }}</div>
<div><span class="bold">Phone:</span> {{ $order->customer->phone }}</div>
<div><span class="bold">Delivery:</span> {{ $order->delivery_date->format('d/m/Y') }}</div>

<div class="divider"></div>

{{-- Items --}}
<table>
  <tr><td class="bold">Item</td><td class="bold">Qty</td><td class="bold">Price</td></tr>
  @foreach($order->items as $item)
  <tr>
    <td>{{ $item->item_name }}</td>
    <td>{{ $item->quantity }}</td>
    <td>{{ number_format($item->subtotal, 0) }}</td>
  </tr>
  @endforeach
</table>

<div class="divider"></div>

{{-- Totals --}}
<div class="row"><span>Total:</span><span class="bold">PKR {{ number_format($order->total_price, 0) }}</span></div>
<div class="row"><span>Advance Paid:</span><span>PKR {{ number_format($order->advance_payment, 0) }}</span></div>
<div class="row total-row"><span>Balance Due:</span><span>PKR {{ number_format($order->remaining_payment, 0) }}</span></div>

@if($order->notes)
<div class="divider"></div>
<div><span class="bold">Notes:</span> {{ $order->notes }}</div>
@endif

<div class="divider"></div>

{{-- QR Code --}}
<div class="center">
  <img class="qr" src="data:image/png;base64,{{ $qrCode }}" width="100" height="100" alt="QR">
  <div>Scan to verify order</div>
</div>

<div class="divider"></div>
<div class="center">Thank you for your business!</div>
@if(isset($order->tenant->settings['receipt_footer']))
<div class="center">{{ $order->tenant->settings['receipt_footer'] }}</div>
@endif

</body>
</html>

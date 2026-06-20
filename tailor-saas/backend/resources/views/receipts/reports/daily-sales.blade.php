<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Daily Sales Report — {{ $date }}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #212529; padding: 20px; }
  h1  { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
  h2  { font-size: 13px; color: #495057; margin-bottom: 16px; }
  .summary { display: flex; gap: 24px; margin-bottom: 20px; background: #f8f9fa; padding: 12px; border-radius: 6px; }
  .stat { }
  .stat .val { font-size: 18px; font-weight: bold; color: #4240d0; }
  .stat .lbl { font-size: 10px; color: #6c757d; text-transform: uppercase; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { background: #f1f3f5; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; color: #495057; }
  td { padding: 8px 10px; border-bottom: 1px solid #e9ecef; }
  .footer { margin-top: 24px; font-size: 9px; color: #adb5bd; text-align: center; }
</style>
</head>
<body>
  <h1>Daily Sales Report</h1>
  <h2>{{ \Carbon\Carbon::parse($date)->format('l, d F Y') }}</h2>

  <div class="summary">
    <div class="stat">
      <div class="val">{{ $total_orders }}</div>
      <div class="lbl">Orders Placed</div>
    </div>
    <div class="stat">
      <div class="val">PKR {{ number_format($total_collected, 0) }}</div>
      <div class="lbl">Revenue Collected</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Order No.</th>
        <th>Customer</th>
        <th>Items</th>
        <th>Total</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      @forelse($orders as $i => $order)
      <tr>
        <td>{{ $i + 1 }}</td>
        <td style="font-family: monospace;">{{ $order->order_number }}</td>
        <td>{{ $order->customer?->full_name ?? '—' }}</td>
        <td>{{ $order->items->count() }}</td>
        <td>PKR {{ number_format($order->total_price, 0) }}</td>
        <td style="text-transform:capitalize;">{{ str_replace('_', ' ', $order->status) }}</td>
      </tr>
      @empty
      <tr><td colspan="6" style="text-align:center;color:#adb5bd;padding:20px;">No orders on this date.</td></tr>
      @endforelse
    </tbody>
  </table>

  <div class="footer">Generated {{ now()->format('d/m/Y H:i') }} &mdash; TailorSaaS</div>
</body>
</html>

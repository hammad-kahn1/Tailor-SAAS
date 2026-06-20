<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Pending Orders Report</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #212529; padding: 20px; }
  h1  { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
  h2  { font-size: 13px; color: #495057; margin-bottom: 16px; }
  .count { font-size: 22px; font-weight: bold; color: #f59e0b; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f1f3f5; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; color: #495057; }
  td { padding: 8px 10px; border-bottom: 1px solid #e9ecef; }
  .badge { padding: 2px 8px; border-radius: 12px; font-size: 9px; font-weight: bold; text-transform: capitalize; }
  .pending     { background:#fef3c7; color:#92400e; }
  .assigned    { background:#dbeafe; color:#1e40af; }
  .in_progress { background:#ede9fe; color:#5b21b6; }
  .footer { margin-top: 24px; font-size: 9px; color: #adb5bd; text-align: center; }
</style>
</head>
<body>
  <h1>Pending Orders Report</h1>
  <h2>As of {{ now()->format('d F Y H:i') }}</h2>
  <div class="count">{{ $count }} pending orders</div>

  <table>
    <thead>
      <tr>
        <th>Order #</th>
        <th>Customer</th>
        <th>Phone</th>
        <th>Delivery Date</th>
        <th>Assigned To</th>
        <th>Status</th>
        <th style="text-align:right;">Balance (PKR)</th>
      </tr>
    </thead>
    <tbody>
      @forelse($orders as $order)
      <tr>
        <td style="font-family:monospace;">{{ $order->order_number }}</td>
        <td>{{ $order->customer?->full_name ?? '—' }}</td>
        <td>{{ $order->customer?->phone ?? '—' }}</td>
        <td>{{ $order->delivery_date?->format('d/m/Y') ?? '—' }}</td>
        <td>{{ $order->assignment?->tailor?->name ?? 'Unassigned' }}</td>
        <td><span class="badge {{ $order->status }}">{{ str_replace('_', ' ', $order->status) }}</span></td>
        <td style="text-align:right;">{{ number_format($order->remaining_payment, 0) }}</td>
      </tr>
      @empty
      <tr><td colspan="7" style="text-align:center;color:#adb5bd;padding:20px;">No pending orders.</td></tr>
      @endforelse
    </tbody>
  </table>

  <div class="footer">Generated {{ now()->format('d/m/Y H:i') }} &mdash; TailorSaaS</div>
</body>
</html>

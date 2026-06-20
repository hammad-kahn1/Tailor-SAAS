<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Monthly Revenue — {{ $year }}/{{ str_pad($month, 2, '0', STR_PAD_LEFT) }}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #212529; padding: 20px; }
  h1  { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
  h2  { font-size: 13px; color: #495057; margin-bottom: 16px; }
  .total { font-size: 22px; font-weight: bold; color: #4240d0; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f1f3f5; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; color: #495057; }
  td { padding: 8px 10px; border-bottom: 1px solid #e9ecef; }
  td:last-child { text-align: right; font-weight: bold; }
  .footer { margin-top: 24px; font-size: 9px; color: #adb5bd; text-align: center; }
</style>
</head>
<body>
  <h1>Monthly Revenue Report</h1>
  <h2>{{ \Carbon\Carbon::create($year, $month)->format('F Y') }}</h2>
  <div class="total">PKR {{ number_format($total, 0) }}</div>

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th style="text-align:right;">Revenue (PKR)</th>
      </tr>
    </thead>
    <tbody>
      @forelse($daily as $row)
      <tr>
        <td>{{ \Carbon\Carbon::parse($row->day)->format('d F Y') }}</td>
        <td>{{ number_format($row->total, 0) }}</td>
      </tr>
      @empty
      <tr><td colspan="2" style="text-align:center;color:#adb5bd;padding:20px;">No revenue data for this period.</td></tr>
      @endforelse
    </tbody>
  </table>

  <div class="footer">Generated {{ now()->format('d/m/Y H:i') }} &mdash; TailorSaaS</div>
</body>
</html>

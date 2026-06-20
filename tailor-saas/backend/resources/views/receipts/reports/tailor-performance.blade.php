<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Tailor Performance Report</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #212529; padding: 20px; }
  h1  { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
  h2  { font-size: 13px; color: #495057; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f1f3f5; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; color: #495057; }
  td { padding: 8px 10px; border-bottom: 1px solid #e9ecef; }
  td:not(:first-child) { text-align: center; }
  .footer { margin-top: 24px; font-size: 9px; color: #adb5bd; text-align: center; }
  .green { color: #059669; font-weight: bold; }
</style>
</head>
<body>
  <h1>Tailor Performance Report</h1>
  <h2>As of {{ now()->format('d F Y') }}</h2>

  <table>
    <thead>
      <tr>
        <th>Tailor Name</th>
        <th>Total Assigned</th>
        <th>Completed</th>
        <th>In Progress</th>
        <th>Completion Rate</th>
        <th>Avg. Hours</th>
      </tr>
    </thead>
    <tbody>
      @forelse($data as $row)
      @php
        $rate = $row['total_assigned'] > 0
          ? round(($row['completed'] / $row['total_assigned']) * 100)
          : 0;
        $avg  = $row['avg_completion_hours'] ? round($row['avg_completion_hours'], 1) : '—';
      @endphp
      <tr>
        <td>{{ $row['tailor']['name'] ?? 'Unknown' }}</td>
        <td>{{ $row['total_assigned'] }}</td>
        <td class="green">{{ $row['completed'] }}</td>
        <td>{{ $row['in_progress'] }}</td>
        <td>{{ $rate }}%</td>
        <td>{{ $avg }}</td>
      </tr>
      @empty
      <tr><td colspan="6" style="text-align:center;color:#adb5bd;padding:20px;">No assignment data available.</td></tr>
      @endforelse
    </tbody>
  </table>

  <div class="footer">Generated {{ now()->format('d/m/Y H:i') }} &mdash; TailorSaaS</div>
</body>
</html>

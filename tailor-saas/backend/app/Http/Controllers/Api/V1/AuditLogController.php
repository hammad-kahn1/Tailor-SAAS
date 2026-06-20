<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $logs = AuditLog::with('user:id,name')
            ->where('tenant_id', $request->user()->tenant_id)
            ->when($request->model_type, fn ($q, $v) => $q->where('model_type', 'like', "%{$v}%"))
            ->when($request->user_id,    fn ($q, $v) => $q->where('user_id', $v))
            ->when($request->from_date,  fn ($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($request->to_date,    fn ($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->orderByDesc('created_at')
            ->paginate((int) $request->get('per_page', 20));

        return response()->json($logs);
    }
}

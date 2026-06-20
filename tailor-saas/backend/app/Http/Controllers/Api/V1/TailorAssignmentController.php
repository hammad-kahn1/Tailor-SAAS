<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\TailorAssignment;
use App\Services\TailorAssignmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TailorAssignmentController extends Controller
{
    public function __construct(private TailorAssignmentService $service) {}

    public function assign(Request $request, Order $order): JsonResponse
    {
        $request->validate(['tailor_id' => 'required|exists:users,id', 'notes' => 'nullable|string']);
        $assignment = $this->service->assign($order, $request->tailor_id, $request->notes);
        return response()->json(['message' => 'Order assigned.', 'data' => $assignment], 201);
    }

    public function updateStatus(Request $request, TailorAssignment $assignment): JsonResponse
    {
        $request->validate(['status' => 'required|in:assigned,in_progress,completed']);
        // Tailors can only update their own assignments
        $user = $request->user();
        if ($user->isTailor() && $assignment->tailor_id !== $user->id) {
            abort(403);
        }
        $result = $this->service->updateStatus($assignment, $request->status);
        return response()->json(['message' => 'Status updated.', 'data' => $result]);
    }

    public function workload(): JsonResponse
    {
        return response()->json(['data' => $this->service->workload()]);
    }

    public function mine(Request $request): JsonResponse
    {
        $assignments = $this->service->myAssignments($request->user()->id, $request->status);
        return response()->json($assignments);
    }
}

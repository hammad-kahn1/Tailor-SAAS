<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenantController extends Controller
{
    // ── Super Admin: list all tenants ───────────────────────────────────
    public function index(): JsonResponse
    {
        $tenants = Tenant::withoutTenantScope()
            ->with('subscription')
            ->paginate(20);
        return response()->json($tenants);
    }

    // ── Super Admin: view any tenant (GET /admin/tenants/{tenant}) ──────
    public function show(int $tenant): JsonResponse
    {
        $record = Tenant::withoutTenantScope()
            ->with(['users', 'subscription'])
            ->findOrFail($tenant);
        return response()->json(['data' => $record]);
    }

    // ── Super Admin: update any tenant (PUT /admin/tenants/{tenant}) ────
    public function update(Request $request, int $tenant): JsonResponse
    {
        $request->validate([
            'name'                => 'sometimes|string|max:255',
            'phone'               => 'nullable|string',
            'address'             => 'nullable|string',
            'subscription_plan'   => 'sometimes|in:trial,basic,pro,enterprise',
            'subscription_status' => 'sometimes|in:active,past_due,cancelled,expired',
            'is_active'           => 'sometimes|boolean',
            'settings'            => 'nullable|array',
        ]);
        $record = Tenant::withoutTenantScope()->findOrFail($tenant);
        $record->update($request->validated());
        return response()->json(['message' => 'Tenant updated.', 'data' => $record]);
    }

    // ── Super Admin: destroy tenant (DELETE /admin/tenants/{tenant}) ────
    public function destroy(int $tenant): JsonResponse
    {
        Tenant::withoutTenantScope()->findOrFail($tenant)->delete();
        return response()->json(['message' => 'Tenant deleted.']);
    }

    // ── Super Admin: toggle active (PATCH /admin/tenants/{tenant}/toggle-active)
    public function toggleActive(int $tenant): JsonResponse
    {
        $record = Tenant::withoutTenantScope()->findOrFail($tenant);
        $record->update(['is_active' => ! $record->is_active]);
        $state = $record->is_active ? 'activated' : 'deactivated';
        return response()->json(['message' => "Tenant {$state}.", 'data' => $record]);
    }

    // ── Shop Owner: view own profile (GET /shop/profile) ───────────────
    public function showProfile(Request $request): JsonResponse
    {
        return response()->json(['data' => $request->user()->tenant]);
    }

    // ── Shop Owner: update own profile (PUT /shop/profile) ─────────────
    public function updateProfile(Request $request): JsonResponse
    {
        $request->validate([
            'name'     => 'sometimes|string|max:255',
            'phone'    => 'nullable|string',
            'address'  => 'nullable|string',
            'settings' => 'nullable|array',
        ]);
        $tenant = $request->user()->tenant;
        $tenant->update($request->validated());
        return response()->json(['message' => 'Shop profile updated.', 'data' => $tenant]);
    }
}

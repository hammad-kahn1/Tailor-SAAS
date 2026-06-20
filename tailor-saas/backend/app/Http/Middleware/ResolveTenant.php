<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * ResolveTenant
 *
 * Runs after Sanctum authentication.
 * Binds 'currentTenantId' into the IoC container so the BelongsToTenant
 * global scope can automatically filter all queries to the logged-in user's tenant.
 *
 * Super admins have tenant_id = null and bypass the global scope.
 */
class ResolveTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Super admins are not scoped to any tenant
        if ($user->role === 'super_admin') {
            app()->instance('currentTenantId', null);
            app()->instance('currentTenant', null);
            return $next($request);
        }

        // All other users must have a valid active tenant
        $tenant = Tenant::find($user->tenant_id);

        if (! $tenant || ! $tenant->is_active) {
            return response()->json([
                'message' => 'Your shop account is inactive or suspended. Please contact support.',
            ], 403);
        }

        // Bind into the IoC container — consumed by BelongsToTenant global scope
        app()->instance('currentTenantId', $tenant->id);
        app()->instance('currentTenant', $tenant);

        return $next($request);
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * EnsureRole
 *
 * Usage in routes:
 *   ->middleware('role:shop_owner,manager')
 *
 * Accepts a comma-separated list of roles; passes if the user has ANY of them.
 * Super admins are always granted access regardless of role list.
 */
class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Super admin bypasses all role checks
        if ($user->role === 'super_admin') {
            return $next($request);
        }

        if (! in_array($user->role, $roles)) {
            return response()->json([
                'message' => 'You do not have permission to perform this action.',
            ], 403);
        }

        return $next($request);
    }
}

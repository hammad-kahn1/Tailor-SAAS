<?php

use App\Http\Middleware\EnsureRole;
use App\Http\Middleware\ResolveTenant;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'tenant' => ResolveTenant::class,
            'role'   => EnsureRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Always respond with JSON for API routes
        $exceptions->render(function (\Throwable $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                if ($e instanceof \Illuminate\Validation\ValidationException) {
                    if ($e->response) {
                        return $e->response;
                    }
                    return response()->json([
                        'message' => $e->getMessage(),
                        'errors'  => $e->errors(),
                    ], 422);
                }

                if ($e instanceof NotFoundHttpException) {
                    return response()->json(['message' => 'Resource not found.'], 404);
                }

                if ($e instanceof AccessDeniedHttpException) {
                    return response()->json(['message' => 'Forbidden.'], 403);
                }

                if ($e instanceof \Illuminate\Auth\AuthenticationException) {
                    return response()->json(['message' => 'Unauthenticated.'], 401);
                }

                $status = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;
                return response()->json([
                    'message' => $e->getMessage() ?: 'Server error.',
                    'status'  => $status,
                ], $status);
            }
        });
    })
    ->create();

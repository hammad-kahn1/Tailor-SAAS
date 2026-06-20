<?php

use App\Http\Controllers\Api\V1\AuditLogController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\MeasurementController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\ReceiptController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\TailorAssignmentController;
use App\Http\Controllers\Api\V1\TenantController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes  —  All prefixed /api/v1 (set in bootstrap/app.php)
|--------------------------------------------------------------------------
*/

// ── Public auth ──────────────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {

    Route::prefix('auth')->group(function () {
        Route::post('register-tenant', [AuthController::class, 'registerTenant']);
        Route::post('login',           [AuthController::class, 'login']);
        Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('reset-password',  [AuthController::class, 'resetPassword']);
    });

    // ── Authenticated routes ─────────────────────────────────────────────────
    Route::middleware(['auth:sanctum'])->group(function () {

        // Auth self
        Route::prefix('auth')->group(function () {
            Route::get ('me',              [AuthController::class, 'me']);
            Route::post('logout',          [AuthController::class, 'logout']);
            Route::post('change-password', [AuthController::class, 'changePassword']);
        });

        // Resolve tenant for all routes below
        Route::middleware(['tenant'])->group(function () {

            // Dashboard
            Route::get('dashboard', [DashboardController::class, 'index']);

            // Customers
            Route::apiResource('customers', CustomerController::class);
            Route::get('customers/{customer}/history', [CustomerController::class, 'history']);

            // Measurements
            Route::post('measurements', [MeasurementController::class, 'store']);
            Route::get('customers/{customer}/measurements', [MeasurementController::class, 'index']);
            Route::get('customers/{customer}/measurements/latest/{type}', [MeasurementController::class, 'latest']);
            Route::get('measurements/{measurement}', [MeasurementController::class, 'show']);

            // Orders
            Route::apiResource('orders', OrderController::class)->except(['update', 'destroy']);
            Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus']);
            Route::get ('orders/{order}/receipt', [ReceiptController::class, 'show']);
            Route::get ('orders/{order}/receipt/pdf', [ReceiptController::class, 'pdf']);

            // Payments
            Route::post('orders/{order}/payments', [PaymentController::class, 'store']);
            Route::get ('orders/{order}/payments', [PaymentController::class, 'index']);

            // Tailor Assignments
            Route::post('orders/{order}/assign', [TailorAssignmentController::class, 'assign']);
            Route::get ('assignments/workload',  [TailorAssignmentController::class, 'workload']);
            Route::get ('assignments/my',        [TailorAssignmentController::class, 'mine']);
            Route::patch('assignments/{assignment}/status', [TailorAssignmentController::class, 'updateStatus']);

            // Reports
            Route::prefix('reports')->middleware('role:super_admin,shop_owner,manager')->group(function () {
                Route::get('daily-sales',        [ReportController::class, 'dailySales']);
                Route::get('monthly-revenue',    [ReportController::class, 'monthlyRevenue']);
                Route::get('pending-orders',     [ReportController::class, 'pendingOrders']);
                Route::get('tailor-performance', [ReportController::class, 'tailorPerformance']);
                Route::get('delivery-schedule',  [ReportController::class, 'deliverySchedule']);
            });

            // Audit Logs
            Route::get('audit-logs', [AuditLogController::class, 'index'])
                ->middleware('role:super_admin,shop_owner');

            // Users / Staff
            Route::get ('users',        [UserController::class, 'index'])->middleware('role:super_admin,shop_owner,manager');
            Route::post('users',        [UserController::class, 'store'])->middleware('role:super_admin,shop_owner');
            Route::get ('users/tailors',[UserController::class, 'tailors']);
            Route::get ('users/{user}', [UserController::class, 'show'])->middleware('role:super_admin,shop_owner');
            Route::put ('users/{user}', [UserController::class, 'update'])->middleware('role:super_admin,shop_owner');

            // Shop profile
            Route::get('shop/profile', [TenantController::class, 'showProfile']);
            Route::put('shop/profile', [TenantController::class, 'updateProfile'])->middleware('role:super_admin,shop_owner');

            // Super Admin — tenant management
            Route::prefix('admin')->middleware('role:super_admin')->group(function () {
                Route::apiResource('tenants', TenantController::class);
                Route::patch('tenants/{tenant}/toggle-active', [TenantController::class, 'toggleActive']);
            });
        });
    });
});

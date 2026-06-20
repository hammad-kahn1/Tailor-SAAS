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
| API Routes — Versioned under /api/v1
|--------------------------------------------------------------------------
| Public routes: registration, login, forgot/reset password.
| Authenticated routes: everything else, behind auth:sanctum + tenant
| resolution. Role-restricted routes additionally use the `role:` middleware.
*/

Route::prefix('v1')->group(function () {

    // ---------- Public ----------
    Route::prefix('auth')->group(function () {
        Route::post('register-tenant', [AuthController::class, 'registerTenant']);
        Route::post('login', [AuthController::class, 'login']);
        Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('reset-password', [AuthController::class, 'resetPassword']);
    });

    // ---------- Authenticated ----------
    Route::middleware(['auth:sanctum', 'tenant'])->group(function () {

        Route::prefix('auth')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
            Route::post('change-password', [AuthController::class, 'changePassword']);
        });

        // ---- Super Admin only: cross-tenant management ----
        Route::middleware('role:super_admin')->group(function () {
            Route::get('tenants', [TenantController::class, 'index']);
            Route::get('tenants/{id}', [TenantController::class, 'show']);
            Route::patch('tenants/{id}/subscription', [TenantController::class, 'updateSubscription']);
        });

        // ---- Shop Owner: shop profile + staff/role management ----
        Route::middleware('role:shop_owner')->group(function () {
            Route::put('shop/profile', [TenantController::class, 'updateProfile']);
            Route::get('users', [UserController::class, 'index']);
            Route::post('users', [UserController::class, 'store']);
            Route::put('users/{id}', [UserController::class, 'update']);
        });

        Route::get('users/tailors', [UserController::class, 'tailors']); // any authenticated tenant user

        // ---- Customers (Shop Owner / Manager / Receptionist) ----
        Route::middleware('role:shop_owner,manager,receptionist')->group(function () {
            Route::apiResource('customers', CustomerController::class)->except(['destroy']);
            Route::get('customers/{id}/history', [CustomerController::class, 'history']);
        });
        Route::middleware('role:shop_owner,manager')->delete('customers/{id}', [CustomerController::class, 'destroy']);

        // ---- Measurements (Shop Owner / Manager / Receptionist / Tailor can record+view) ----
        Route::middleware('role:shop_owner,manager,receptionist,tailor')->group(function () {
            Route::post('measurements', [MeasurementController::class, 'store']);
            Route::get('customers/{customerId}/measurements', [MeasurementController::class, 'history']);
            Route::get('customers/{customerId}/measurements/latest/{type}', [MeasurementController::class, 'latest']);
        });

        // ---- Orders ----
        Route::middleware('role:shop_owner,manager,receptionist')->group(function () {
            Route::get('orders', [OrderController::class, 'index']);
            Route::post('orders', [OrderController::class, 'store']);
            Route::post('orders/{order}/payments', [PaymentController::class, 'store']);
        });
        Route::middleware('role:shop_owner,manager,receptionist,tailor')->group(function () {
            Route::get('orders/{id}', [OrderController::class, 'show']);
            Route::patch('orders/{id}/status', [OrderController::class, 'updateStatus']);
        });

        // ---- Tailor Assignment ----
        Route::middleware('role:shop_owner,manager')->group(function () {
            Route::post('orders/{order}/assign', [TailorAssignmentController::class, 'assign']);
            Route::get('assignments/workload', [TailorAssignmentController::class, 'workload']);
        });
        Route::middleware('role:shop_owner,manager,tailor')->group(function () {
            Route::patch('assignments/{id}/status', [TailorAssignmentController::class, 'updateStatus']);
            Route::get('assignments/my', [TailorAssignmentController::class, 'mine']);
        });

        // ---- Receipts ----
        Route::middleware('role:shop_owner,manager,receptionist')->group(function () {
            Route::get('orders/{order}/receipt', [ReceiptController::class, 'show']);
            Route::get('orders/{order}/receipt/pdf', [ReceiptController::class, 'pdf']);
        });

        // ---- Dashboard ----
        Route::get('dashboard', [DashboardController::class, 'index']);

        // ---- Reports (Shop Owner / Manager) ----
        Route::middleware('role:shop_owner,manager')->prefix('reports')->group(function () {
            Route::get('daily-sales', [ReportController::class, 'dailySales']);
            Route::get('monthly-revenue', [ReportController::class, 'monthlyRevenue']);
            Route::get('pending-orders', [ReportController::class, 'pendingOrders']);
            Route::get('tailor-performance', [ReportController::class, 'tailorPerformance']);
            Route::get('delivery-schedule', [ReportController::class, 'deliverySchedule']);
        });

        // ---- Audit Log (Shop Owner only) ----
        Route::middleware('role:shop_owner')->get('audit-logs', [AuditLogController::class, 'index']);
    });
});

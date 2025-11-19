<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\QuotationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\JobOrderController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\UserController;

Route::post('/register', [AuthController::class, 'clientRegister']);
Route::post('/login', [AuthController::class, 'clientLogin']);
Route::post('/admin/login', [AuthController::class, 'adminLogin']);

// Protected routes - All subsequent routes require valid Sanctum token
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'getCurrentUser']);

    // Products
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);

    // Services
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/services/{id}', [ServiceController::class, 'show']);

    // Quotations - Client
    Route::get('/quotations', [QuotationController::class, 'index']);
    Route::get('/quotations/{id}', [QuotationController::class, 'show']);
    Route::post('/quotations', [QuotationController::class, 'store']);

    // Products - Admin
    Route::post('/admin/products', [ProductController::class, 'store']);
    Route::put('/admin/products/{id}', [ProductController::class, 'update']);
    Route::delete('/admin/products/{id}', [ProductController::class, 'destroy']);

    // Services - Admin
    Route::post('/admin/services', [ServiceController::class, 'store']);
    Route::put('/admin/services/{id}', [ServiceController::class, 'update']);
    Route::delete('/admin/services/{id}', [ServiceController::class, 'destroy']);

    // Quotations - Admin
    Route::put('/admin/quotations/{id}/status', [QuotationController::class, 'updateStatus']);
    Route::delete('/admin/quotations/{id}', [QuotationController::class, 'destroy']);

    // Orders
    Route::get('/admin/orders', [OrderController::class, 'index']);
    Route::get('/admin/orders/{id}', [OrderController::class, 'show']);
    Route::post('/admin/orders', [OrderController::class, 'store']);
    Route::put('/admin/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::delete('/admin/orders/{id}', [OrderController::class, 'destroy']);

    // Job Orders
    Route::get('/admin/job-orders', [JobOrderController::class, 'index']);
    Route::get('/admin/job-orders/{id}', [JobOrderController::class, 'show']);
    Route::post('/admin/job-orders', [JobOrderController::class, 'store']);
    Route::put('/admin/job-orders/{id}/status', [JobOrderController::class, 'updateStatus']);
    Route::delete('/admin/job-orders/{id}', [JobOrderController::class, 'destroy']);

    // Branches
    Route::get('/admin/branches', [BranchController::class, 'index']);
    Route::get('/admin/branches/{id}', [BranchController::class, 'show']);
    Route::post('/admin/branches', [BranchController::class, 'store']);
    Route::put('/admin/branches/{id}', [BranchController::class, 'update']);
    Route::delete('/admin/branches/{id}', [BranchController::class, 'destroy']);

    // Roles & Permissions
    Route::get('/admin/roles', [RolePermissionController::class, 'getRoles']);
    Route::get('/admin/permissions', [RolePermissionController::class, 'getPermissions']);
    Route::post('/admin/roles/assign-user', [RolePermissionController::class, 'assignRoleToUser']);
    Route::post('/admin/roles/remove-user', [RolePermissionController::class, 'removeRoleFromUser']);
    Route::post('/admin/roles/assign-permission', [RolePermissionController::class, 'assignPermissionToRole']);

    // Users Management
    Route::get('/admin/users', [UserController::class, 'index']);
    Route::get('/admin/users/{id}', [UserController::class, 'show']);
    Route::post('/admin/users', [UserController::class, 'store']);
    Route::put('/admin/users/{id}', [UserController::class, 'update']);
    Route::delete('/admin/users/{id}', [UserController::class, 'destroy']);
    Route::post('/admin/users/{id}/toggle-status', [UserController::class, 'toggleStatus']);
});

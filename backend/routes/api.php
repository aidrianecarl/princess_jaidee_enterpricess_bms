<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\QuotationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\JobOrderController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\RatingController;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

Route::get('/storage/app/public/{path}', function ($path) {
    $filePath = storage_path('app/public/' . $path);

    if (!File::exists($filePath)) {
        abort(404);
    }

    return response()->file($filePath);
})->where('path', '.*');

Route::post('/register', [AuthController::class, 'clientRegister']);
Route::post('/login', [AuthController::class, 'clientLogin']);
Route::post('/admin/login', [AuthController::class, 'adminLogin']);
Route::post('/contact', [ContactController::class, 'sendMessage']);

Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{id}', [ServiceController::class, 'show']);

// Public ratings endpoint - no authentication required
Route::get('/ratings', [RatingController::class, 'index']);

// Protected routes - All subsequent routes require valid Sanctum token
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'getCurrentUser']);

    // Profile Management - Authenticated User
    Route::get('/profile', [UserController::class, 'getProfile']);
    Route::put('/profile', [UserController::class, 'updateProfile']);
    Route::post('/profile/change-password', [UserController::class, 'changePassword']);

    // Quotations - Client
    Route::get('/quotations/next-number', [QuotationController::class, 'getNextQuotationNumber']);
    Route::post('/quotations/upload-logo', [QuotationController::class, 'uploadLogo']);
    Route::post('/quotations/upload-design', [QuotationController::class, 'uploadDesignFile']);
    Route::get('/quotations/active-branches', [QuotationController::class, 'getActiveBranches']);
    
    Route::get('/quotations', [QuotationController::class, 'index']);
    Route::post('/quotations', [QuotationController::class, 'store']);
    Route::get('/quotations/{id}', [QuotationController::class, 'show']);
    Route::put('/quotations/{id}', [QuotationController::class, 'update']);
    Route::patch('/quotations/{id}/payment', [QuotationController::class, 'updatePayment']);
    Route::put('/quotations/{id}/send-production', [QuotationController::class, 'sendForProduction']);

    // Orders - Customer & Admin
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'customerIndex']);
    Route::get('/order-items', [OrderController::class, 'getOrderItems']);
    Route::post('/order-items', [OrderController::class, 'storeOrderItem']);

    // Users - Profile Management
    Route::get('/users/me', [UserController::class, 'getCurrentUser']);
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/employees', [UserController::class, 'getEmployees']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::post('/users/{id}/change-password', [UserController::class, 'changePassword']);

    // Services - Admin
    Route::get('/admin/services', [ServiceController::class, 'index']);
    Route::post('/admin/services', [ServiceController::class, 'store']);
    Route::put('/admin/services/{id}', [ServiceController::class, 'update']);
    Route::delete('/admin/services/{id}', [ServiceController::class, 'destroy']);
    Route::post('/admin/services/upload-image', [ServiceController::class, 'uploadImage']);

    // Quotations - Admin
    Route::get('/admin/quotations', [QuotationController::class, 'adminIndex']);
    Route::get('/admin/quotations/{id}', [QuotationController::class, 'adminShow']);
    Route::put('/admin/quotations/{id}/status', [QuotationController::class, 'updateStatus']);
    Route::post('/admin/quotations/{id}/pricing', [QuotationController::class, 'updatePricing']);
    Route::post('/admin/quotations/{id}/convert-to-order', [QuotationController::class, 'convertToOrder']);
    Route::put('/admin/quotations/{id}/reject', [QuotationController::class, 'rejectQuotation']);
    Route::delete('/admin/quotations/{id}', [QuotationController::class, 'destroy']);

    // Orders
    Route::get('/admin/orders', [OrderController::class, 'adminIndex']);
    Route::get('/admin/orders/{id}', [OrderController::class, 'show']);
    Route::post('/admin/orders', [OrderController::class, 'store']);
    Route::put('/admin/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::put('/admin/orders/{id}/payment-status', [OrderController::class, 'updatePaymentStatus']);
    Route::delete('/admin/orders/{id}', [OrderController::class, 'destroy']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);

    // Order Items
    Route::put('/admin/order-items/{id}', [OrderController::class, 'updateOrderItem']);

    // Job Orders
    Route::get('/admin/job-orders', [JobOrderController::class, 'index']);
    Route::get('/admin/job-orders/{id}', [JobOrderController::class, 'show']);
    Route::get('/admin/job-orders/{id}/orders', [JobOrderController::class, 'getOrderItems']);
    Route::post('/admin/job-orders', [JobOrderController::class, 'store']);
    Route::put('/admin/job-orders/{id}', [JobOrderController::class, 'update']);
    Route::post('/admin/job-orders/{jobOrderId}/complete-item', [JobOrderController::class, 'completeItem']);
    Route::put('/admin/job-orders/{id}/status', [JobOrderController::class, 'updateStatus']);
    Route::put('/admin/job-orders/{id}/release', [JobOrderController::class, 'releaseJobOrder']);
    Route::delete('/admin/job-orders/{id}', [JobOrderController::class, 'destroy']);

    // Job Order Items
    Route::put('/admin/job-order-items/{id}', [JobOrderController::class, 'updateItem']);

    // Branches
    Route::get('/admin/branches', [BranchController::class, 'index']);
    Route::get('/admin/branches/{id}', [BranchController::class, 'show']);
    Route::post('/admin/branches', [BranchController::class, 'store']);
    Route::put('/admin/branches/{id}', [BranchController::class, 'update']);
    Route::delete('/admin/branches/{id}', [BranchController::class, 'destroy']);

    // Roles & Permissions
    Route::get('/admin/roles', [RolePermissionController::class, 'getRoles']);
    Route::post('/admin/roles', [RolePermissionController::class, 'createRole']);
    Route::get('/admin/permissions', [RolePermissionController::class, 'getPermissions']);
    Route::put('/admin/roles/{id}', [RolePermissionController::class, 'updateRole']);
    Route::delete('/admin/roles/{id}', [RolePermissionController::class, 'deleteRole']);
    Route::post('/admin/roles/assign-user', [RolePermissionController::class, 'assignRoleToUser']);
    Route::post('/admin/roles/remove-user', [RolePermissionController::class, 'removeRoleFromUser']);
    Route::post('/admin/roles/assign-permission', [RolePermissionController::class, 'assignPermissionToRole']);

    // Users Management
    Route::get('/admin/users', [UserController::class, 'index']);
    Route::get('/admin/users/{id}', [UserController::class, 'show']);
    Route::get('/admin/users/{id}/permissions', [UserController::class, 'getUserPermissions']);
    Route::post('/admin/users', [UserController::class, 'store']);
    Route::put('/admin/users/{id}', [UserController::class, 'update']);
    Route::delete('/admin/users/{id}', [UserController::class, 'destroy']);
    Route::post('/admin/users/{id}/toggle-status', [UserController::class, 'toggleStatus']);

    // Ratings - Authenticated
    Route::post('/ratings', [RatingController::class, 'store']);
    Route::get('/ratings/check/user', [RatingController::class, 'checkUserRating']);
    Route::get('/ratings/{id}', [RatingController::class, 'show']);
});

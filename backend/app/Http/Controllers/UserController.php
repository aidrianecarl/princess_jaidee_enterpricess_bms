<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // Get all users
    public function index()
    {
        try {
            $users = User::all();
            return response()->json([
                'success' => true,
                'data' => $users
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Get single user
    public function show($id)
    {
        try {
            $user = User::with(['roles', 'roles.permissions', 'branch'])->findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }
    }

    // Create user
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'first_name' => 'required|string',
                'last_name' => 'required|string',
                'email' => 'required|email|unique:users',
                'password' => 'required|min:6',
                'phone_number' => 'nullable|string',
                'address' => 'nullable|string',
                'zip_code' => 'nullable|string',
                'user_type' => 'required|in:client,employee,admin',
                'status' => 'required|in:active,inactive,suspended',
                'branch_id' => 'nullable|exists:branches,id',
                'role_id' => 'nullable|exists:roles,id',
            ]);

            $validated['password'] = Hash::make($validated['password']);
            $user = User::create($validated);

            // Assign role if provided
            if ($request->has('role_id') && $request->role_id) {
                $user->roles()->attach($request->role_id);
            }

            return response()->json([
                'success' => true,
                'message' => 'User created successfully',
                'data' => $user->load('roles', 'branch')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }

    // Update user
    public function update(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);

            $validated = $request->validate([
                'first_name' => 'string',
                'last_name' => 'string',
                'email' => 'email|unique:users,email,' . $id,
                'phone_number' => 'nullable|string',
                'address' => 'nullable|string',
                'zip_code' => 'nullable|string',
                'user_type' => 'in:client,employee,admin',
                'status' => 'in:active,inactive,suspended',
                'password' => 'nullable|min:6',
                'branch_id' => 'nullable|exists:branches,id',
                'role_id' => 'nullable|exists:roles,id',
            ]);

            if (isset($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            }

            $user->update($validated);

            // Update role if provided
            if ($request->has('role_id')) {
                $user->roles()->sync($request->role_id ? [$request->role_id] : []);
            }

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
                'data' => $user->load('roles', 'branch')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }

    // Get authenticated user's profile
    public function getProfile(Request $request)
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated'
                ], 401);
            }

            $user->load(['branch', 'roles']);

            return response()->json([
                'success' => true,
                'data' => $user
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Update authenticated user's profile
    public function updateProfile(Request $request)
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated'
                ], 401);
            }

            $validated = $request->validate([
                'first_name' => 'nullable|string|max:255',
                'last_name' => 'nullable|string|max:255',
                'email' => 'nullable|email|unique:users,email,' . $user->id,
                'phone_number' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
                'zip_code' => 'nullable|string|max:10',
            ]);

            // Only update provided fields
            $user->update(array_filter($validated, fn($value) => $value !== null));

            $user->load(['branch', 'roles']);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => $user
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }


    // Delete user
    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);
            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    // Toggle user status
    public function toggleStatus($id)
    {
        try {
            $user = User::findOrFail($id);
            $user->status = $user->status === 'active' ? 'inactive' : 'active';
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'User status updated',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    // Change user password
    public function changePassword(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);

            // Validate the request
            $validated = $request->validate([
                'current_password' => 'required|min:6',
                'new_password' => 'required|min:8|different:current_password',
                'new_password_confirmation' => 'required|same:new_password',
            ]);

            // Check if current password is correct
            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password is incorrect',
                ], 422);
            }

            // Update password
            $user->password = Hash::make($validated['new_password']);
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Password changed successfully',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function getEmployees()
    {
        try {
            $users = User::where('user_type', 'employee')
                ->where('status', 'active')
                ->with('roles')
                ->select('id', 'first_name', 'last_name', 'email', 'user_type', 'branch_id')
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'first_name' => $user->first_name,
                        'last_name' => $user->last_name,
                        'email' => $user->email,
                        'user_type' => $user->user_type,
                        'branch_id' => $user->branch_id,
                        'role' => $user->roles->first()?->name ?? 'employee'
                    ];
                });
            
            return response()->json([
                'success' => true,
                'data' => $users
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Get current authenticated user
    public function getCurrentUser(Request $request)
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Not authenticated'
                ], 401);
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'phone_number' => $user->phone_number,
                    'address' => $user->address,
                    'city' => $user->city,
                    'province' => $user->province,
                    'zip_code' => $user->zip_code,
                    'user_type' => $user->user_type,
                    'full_name' => "{$user->first_name} {$user->last_name}"
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Get user permissions
    public function getUserPermissions($id)
    {
        try {
            $user = User::with(['roles.permissions'])->findOrFail($id);
            
            // Check if user is admin - admins get all permissions
            $permissions = [];
            
            // Get roles data from already loaded relationship
            $roles = $user->roles->map(function($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'description' => $role->description ?? null
                ];
            })->toArray();
            
            if ($user->user_type === 'admin') {
                // Admin gets all permissions based on user_type
                $permissions = [
                    'view_dashboard',
                    'manage_branches',
                    'manage_roles',
                    'view_users',
                    'create_users',
                    'edit_users',
                    'delete_users',
                    'view_services',
                    'create_services',
                    'edit_services',
                    'delete_services',
                    'view_quotations',
                    'create_quotations',
                    'edit_quotations',
                    'approve_quotations',
                    'view_orders',
                    'create_orders',
                    'edit_orders',
                    'manage_payments',
                    'view_job_orders',
                    'create_job_orders',
                    'edit_job_orders',
                ];
            } else {
                // Get permissions from assigned roles
                $permissions = $user->roles
                    ->pluck('permissions')
                    ->flatten()
                    ->pluck('name')
                    ->unique()
                    ->values()
                    ->toArray();
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'user_id' => $user->id,
                    'user_type' => $user->user_type,
                    'permissions' => $permissions,
                    'roles' => $roles,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'User not found: ' . $e->getMessage()
            ], 404);
        }
    }
}

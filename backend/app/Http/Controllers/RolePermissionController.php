<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RolePermissionController extends Controller
{
    // Get all roles
    public function getRoles()
    {
        try {
            $roles = Role::with('permissions')->get();
            return response()->json([
                'success' => true,
                'data' => $roles
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Get all permissions
    public function getPermissions()
    {
        try {
            $permissions = Permission::all();
            return response()->json([
                'success' => true,
                'data' => $permissions
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Create role
    public function createRole(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|unique:roles',
                'description' => 'nullable|string',
                'permissions' => 'nullable|array',
                'permissions.*' => 'exists:permissions,id',
            ]);

            $role = Role::create([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
            ]);

            // Attach permissions if provided
            if (isset($validated['permissions'])) {
                $role->permissions()->attach($validated['permissions']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Role created successfully',
                'data' => $role->load('permissions')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }

    // Update role
    public function updateRole(Request $request, $id)
    {
        try {
            $role = Role::findOrFail($id);

            $validated = $request->validate([
                'name' => 'string|unique:roles,name,' . $id,
                'description' => 'nullable|string',
                'permissions' => 'nullable|array',
                'permissions.*' => 'exists:permissions,id',
            ]);

            $role->update([
                'name' => $validated['name'] ?? $role->name,
                'description' => $validated['description'] ?? $role->description,
            ]);

            // Update permissions if provided
            if (isset($validated['permissions'])) {
                $role->permissions()->sync($validated['permissions']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Role updated successfully',
                'data' => $role->load('permissions')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }

    // Delete role
    public function deleteRole($id)
    {
        try {
            $role = Role::findOrFail($id);
            
            // Detach all permissions
            $role->permissions()->detach();
            
            // Detach all users
            $role->users()->detach();
            
            $role->delete();

            return response()->json([
                'success' => true,
                'message' => 'Role deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    // Assign role to user
    public function assignRoleToUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'role_id' => 'required|exists:roles,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::find($request->user_id);
        $user->roles()->attach($request->role_id);

        return response()->json([
            'message' => 'Role assigned successfully',
        ], 200);
    }

    // Remove role from user
    public function removeRoleFromUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'role_id' => 'required|exists:roles,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::find($request->user_id);
        $user->roles()->detach($request->role_id);

        return response()->json([
            'message' => 'Role removed successfully',
        ], 200);
    }

    // Assign permission to role
    public function assignPermissionToRole(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'role_id' => 'required|exists:roles,id',
            'permission_id' => 'required|exists:permissions,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $role = Role::find($request->role_id);
        $role->permissions()->attach($request->permission_id);

        return response()->json([
            'message' => 'Permission assigned successfully',
        ], 200);
    }
}
